// Original Lists-web export builder; does not touch the running product.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { normalizeDomain, parseHosts, parseUblockHosts } from './catalog-tools.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const product = process.argv[2];
if (!product) throw new Error('Usage: node scripts/build-catalog.mjs <public product source directory>');
const builder = fs.readFileSync(path.join(product, 'scripts/build-policy-domain-catalog.mjs'), 'utf8');
const baselineBytes = fs.readFileSync(path.join(product, 'generated-policy-domains.json'));
const baseline = JSON.parse(baselineBytes);
const pins = JSON.parse(fs.readFileSync(path.join(root, 'upstream-pins.json'), 'utf8'));
const digest = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const generatedAt = new Date().toISOString();
const snapshot = (name, start, end) => {
  const section = builder.slice(builder.indexOf(start), builder.indexOf(end));
  if (/\b(?:require|import|process|fetch|readFile|writeFile)\b/.test(section)) throw new Error('Unexpected executable catalog input');
  return JSON.parse(vm.runInNewContext(`${section}\nJSON.stringify(${name})`, {}, { timeout: 1000 }));
};
const sources = snapshot('sources', 'const sources =', 'const curated =');
const curated = snapshot('curated', 'const curated =', 'const categories =');
const curatedCategories = Object.fromEntries(Object.entries(curated).map(([slug, hosts]) => [slug, [...new Set(hosts.map(normalizeDomain).filter(Boolean))].filter((host) => baseline.categories[slug]?.includes(host)).sort()]));
const restrictedInfrastructure = new Set(['google.com', 'googleusercontent.com', 'googleapis.com', 'gstatic.com', 'github.com', 'github.io', 'gitlab.io', 'pages.dev', 'workers.dev', 'cloudfront.net', 'azurewebsites.net', 'amazonaws.com', 'vercel.app', 'netlify.app', 'firebaseapp.com', 'web.app', 'jsdelivr.net', 'cloudflare.com', 'akamaized.net']);
fs.mkdirSync(path.join(root, 'sources'), { recursive: true });
fs.mkdirSync(path.join(root, 'licenses'), { recursive: true });
const write = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`);
const fetchBytes = async (url, maximum = 20 * 1024 * 1024) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`Public source HTTP ${response.status}: ${url}`);
  let size = 0; const chunks = [];
  for await (const chunk of response.body) { size += chunk.length; if (size > maximum) throw new Error('Public source exceeds size budget'); chunks.push(chunk); }
  return Buffer.concat(chunks);
};
const raw = (repo, file) => `https://raw.githubusercontent.com/${repo}/${pins[repo]}/${file}`;
const licenseDefinitions = {
  toulouse: ['CC-BY-SA-4.0', 'https://creativecommons.org/licenses/by-sa/4.0/legalcode.txt'],
  blocklist: ['Unlicense', raw('blocklistproject/Lists', 'LICENSE')],
  games: ['MIT', raw('IREK-szef/games-blocklist', 'LICENSE')],
  hagezi: ['GPL-3.0', raw('hagezi/dns-blocklists', 'LICENSE')],
  'ai-eudk': ['CC0-1.0', raw('eudk/awesome-ai-tools', 'LICENSE')],
  'ai-aliammari': ['CC0-1.0', raw('aliammari1/Awesome-Ai-Tools', 'LICENSE')],
  uassets: ['GPL-3.0', raw('uBlockOrigin/uAssets', 'LICENSE')]
};
for (const [id, [, url]] of Object.entries(licenseDefinitions)) fs.writeFileSync(path.join(root, 'licenses', `${id}.txt`), await fetchBytes(url, 100000));
const records = []; const failures = [];
const add = (source, bytes, categories, licenseId, revision) => {
  const [license, licenseUrl] = licenseDefinitions[licenseId];
  const data = { schemaVersion: 1, id: source.id, generatedAt, url: source.url, revision, sha256: digest(bytes), license, licenseUrl, licenseFile: `licenses/${licenseId}.txt`, modifications: 'Hostname extraction, deduplication, sorting and project category mapping; no browser enforcement rules.', categories };
  const file = `sources/${source.id}.json`;
  write(file, data); records.push({ id: data.id, file, license, categoryEntries: Object.values(categories).reduce((n, values) => n + values.length, 0) });
};
function tarDomains(bytes) {
  const tar = gunzipSync(bytes, { maxOutputLength: 100 * 1024 * 1024 });
  const values = [];
  for (let offset = 0; offset + 512 <= tar.length;) {
    const name = tar.subarray(offset, offset + 100).toString('utf8').replace(/\0.*$/, '');
    if (!name) break;
    const size = parseInt(tar.subarray(offset + 124, offset + 136).toString('ascii').replace(/\0.*$/, '').trim() || '0', 8);
    if (!Number.isSafeInteger(size) || size < 0 || offset + 512 + size > tar.length) throw new Error('Invalid public archive');
    if (/(?:^|\/)domains$/.test(name)) values.push(...parseHosts(tar.subarray(offset + 512, offset + 512 + size).toString('utf8')));
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  return [...new Set(values)];
}
for (const source of sources) {
  let licenseId; let revision = null;
  if (source.id.startsWith('toulouse-')) licenseId = 'toulouse';
  else if (source.id.startsWith('block-list-project-')) { licenseId = 'blocklist'; source.url = raw('blocklistproject/Lists', `alt-version/${source.id.slice('block-list-project-'.length)}-nl.txt`); revision = pins['blocklistproject/Lists']; }
  else if (['games-blocklist', 'games-bypass-blocklist'].includes(source.id)) { licenseId = 'games'; source.url = raw('IREK-szef/games-blocklist', `lists/Adblock-dns/${source.id === 'games-blocklist' ? 'games' : 'bypass'}.txt`); revision = pins['IREK-szef/games-blocklist']; }
  else if (source.id === 'hagezi-doh-vpn-proxy-bypass') { licenseId = 'hagezi'; source.url = raw('hagezi/dns-blocklists', 'adblock/doh-vpn-proxy-bypass.txt'); revision = pins['hagezi/dns-blocklists']; }
  else if (source.id.startsWith('awesome-ai-tools')) { const repo = source.id.endsWith('education') ? 'aliammari1/Awesome-Ai-Tools' : 'eudk/awesome-ai-tools'; licenseId = source.id.endsWith('education') ? 'ai-aliammari' : 'ai-eudk'; source.url = raw(repo, 'README.md'); revision = pins[repo]; }
  else { failures.push({ id: source.id, reason: 'Withheld: unclear standalone redistribution provenance; use independently licensed overlap only.' }); continue; }
  try {
    const bytes = await fetchBytes(source.url, source.id === 'block-list-project-malware' ? 100 * 1024 * 1024 : undefined);
    let hosts;
    if (source.format === 'tar-domains') hosts = tarDomains(bytes);
    else if (source.format === 'ai-markdown') hosts = [...new Set([...bytes.toString('utf8').matchAll(/https?:\/\/[^\s\)\]<>"']+/g)].map((match) => { try { return normalizeDomain(new URL(match[0]).hostname); } catch { return ''; } }).filter((host) => host && (host.endsWith('.ai') || /(?:^|[.-])(?:ai|gpt|llm|claude|gemini|deepseek|mistral)(?:[.-]|$)/.test(host))))];
    else hosts = parseHosts(bytes.toString('utf8'));
    const baselineHosts = new Set((source.categories || [source.category]).flatMap((category) => baseline.categories[category]));
    // Recover old entries only when the independently licensed public snapshot
    // still contains that exact host; do not manufacture historical provenance.
    const parsed = [...new Set(hosts)];
    hosts = [...new Set([...parsed.slice(0, source.limit), ...parsed.filter((host) => baselineHosts.has(host))])].filter((host) => !restrictedInfrastructure.has(host)).sort();
    add(source, bytes, Object.fromEntries((source.categories || [source.category]).map((category) => [category, hosts])), licenseId, revision);
    console.log(JSON.stringify({ source: source.id, imported: hosts.length }));
  } catch (error) { failures.push({ id: source.id, reason: error.message }); }
}
// uBO lists are contextual network filters, not general website topic catalogs.
// Import only conservative unconditional host rules, preserving the GPL source.
const ublockInputs = [];
for (const [file, category] of [['filters.txt', 'advertising-trackers'], ['privacy.txt', 'advertising-trackers'], ['badware.txt', 'malware-phishing'], ['resource-abuse.txt', 'malware-phishing'], ...Array.from({ length: 7 }, (_, i) => [`filters-${2020 + i}.txt`, 'advertising-trackers'])]) {
  const source = { id: `ublock-${file.replace('.txt', '')}`, url: raw('uBlockOrigin/uAssets', `filters/${file}`) };
  try { const bytes = await fetchBytes(source.url); ublockInputs.push({ source, bytes, category }); }
  catch (error) { failures.push({ id: source.id, reason: error.message }); }
}
const ublockExceptions = ublockInputs.flatMap(({ bytes }) => bytes.toString('utf8').split(/\r?\n/).filter((line) => /^@@\|\||^\|\|.*\$.*\bbadfilter\b/.test(line.trim()))).join('\n');
for (const { source, bytes, category } of ublockInputs) {
  const hosts = parseUblockHosts(`${bytes.toString('utf8')}\n${ublockExceptions}`).filter((host) => !restrictedInfrastructure.has(host));
  add(source, bytes, { [category]: hosts }, 'uassets', pins['uBlockOrigin/uAssets']);
}
// Keep the old public curated contract; imports remain separate licensed works.
const curatedFile = { schemaVersion: 1, generatedAt, sources: [{ id: 'project-curated', description: 'Public literal project domains only. No legacy account files, private rules or runtime data.' }], counts: Object.fromEntries(Object.entries(curatedCategories).map(([slug, hosts]) => [slug, hosts.length])), categories: curatedCategories };
write('domains.json', curatedFile);
const merged = Object.fromEntries(Object.entries(curatedCategories).map(([slug, hosts]) => [slug, new Set(hosts)]));
for (const record of records) for (const [slug, hosts] of Object.entries(JSON.parse(fs.readFileSync(path.join(root, record.file), 'utf8')).categories)) for (const host of hosts) merged[slug].add(host);
const counts = Object.fromEntries(Object.entries(merged).map(([slug, hosts]) => [slug, hosts.size]));
const missingCounts = Object.fromEntries(Object.entries(baseline.categories).map(([slug, hosts]) => [slug, hosts.filter((host) => !merged[slug].has(host)).length]));
const index = { schemaVersion: 2, generatedAt, baseline: { generatedAt: baseline.generatedAt, sha256: digest(baselineBytes), categoryEntries: Object.values(baseline.categories).reduce((n, hosts) => n + hosts.length, 0), recoveredCategoryEntries: Object.entries(baseline.categories).reduce((n, [slug, hosts]) => n + hosts.filter((host) => merged[slug].has(host)).length, 0), unpublishedCategoryEntries: Object.values(missingCounts).reduce((n, count) => n + count, 0), missingCounts }, categoryEntries: Object.values(counts).reduce((n, count) => n + count, 0), uniqueHostnames: new Set(Object.values(merged).flatMap((hosts) => [...hosts])).size, counts, curatedFile: 'domains.json', sources: records, withheldSources: failures, enforcement: 'Data only: does not publish rules, change school policy or classify all subdomains.' };
write('catalog-index.json', index);
console.log(JSON.stringify({ categoryEntries: index.categoryEntries, uniqueHostnames: index.uniqueHostnames, baselineRecovered: index.baseline.recoveredCategoryEntries, baselineUnpublished: index.baseline.unpublishedCategoryEntries, sources: records.length, failures }, null, 2));
