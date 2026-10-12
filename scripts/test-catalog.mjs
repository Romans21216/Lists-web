import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { normalizeDomain, parseHosts, parseUblockHosts, validateSource } from './catalog-tools.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
test('public host normalization never accepts URLs, credentials, private names or IPs', () => {
  for (const host of ['https://example.org/user?token=secret', 'user@example.org', '127.0.0.1', 'school.local', 'student.test', '*.example.org', 'example.org/path']) assert.equal(normalizeDomain(host), '');
  assert.equal(normalizeDomain('EXAMPLE.ORG.'), 'example.org');
  assert.equal(normalizeDomain('bücher.de'), 'xn--bcher-kva.de');
});
test('uBO import rejects paths, exceptions, cosmetic/scriptlet rules, disabled and conditional filters', () => {
  const input = ['||ads.example.org^', '||conditional.example.org^$third-party', '||path.example.org/ads', '@@||ads.example.org^$domain=school.edu', 'school.edu##.advert', 'school.edu##+js(test)', '!#if env_firefox', '||firefox.example.org^', '!#endif', '||disabled.example.org^', '||disabled.example.org^$badfilter', '||safe-to-extract.example.org^$all'].join('\n');
  assert.deepEqual(parseUblockHosts(input), ['safe-to-extract.example.org']);
  assert.deepEqual(parseHosts('0.0.0.0 tracker.example.org\n! comment\n@@||allowed.example.org^\n'), ['tracker.example.org']);
});
test('published source partitions have valid categories, licenses and independently counted totals', () => {
  const index = JSON.parse(fs.readFileSync(path.join(root, 'catalog-index.json')));
  const curated = JSON.parse(fs.readFileSync(path.join(root, index.curatedFile)));
  const slugs = new Set(Object.keys(curated.categories));
  const merged = Object.fromEntries(Object.entries(curated.categories).map(([slug, hosts]) => [slug, new Set(hosts)]));
  for (const record of index.sources) {
    assert.match(record.file, /^sources\/[a-z0-9_-]+\.json$/);
    const source = JSON.parse(fs.readFileSync(path.join(root, record.file)));
    assert.equal(validateSource(source, slugs), record.categoryEntries);
    assert.ok(fs.statSync(path.join(root, source.licenseFile)).size > 100);
    assert.ok(!Object.hasOwn(source, 'students') && !Object.hasOwn(source, 'policy'));
    for (const [slug, hosts] of Object.entries(source.categories)) for (const host of hosts) merged[slug].add(host);
  }
  assert.deepEqual(Object.fromEntries(Object.entries(merged).map(([slug, hosts]) => [slug, hosts.size])), index.counts);
  assert.equal(Object.values(merged).reduce((n, hosts) => n + hosts.size, 0), index.categoryEntries);
  assert.equal(new Set(Object.values(merged).flatMap((hosts) => [...hosts])).size, index.uniqueHostnames);
  assert.equal(index.baseline.recoveredCategoryEntries + index.baseline.unpublishedCategoryEntries, index.baseline.categoryEntries);
  assert.ok(index.categoryEntries > 74000);
});
