// Original Lists-web tooling. Copyright (c) 2026 Romans21216.
// Repository LICENSE applies to this file, not to imported datasets.
import { domainToASCII } from 'node:url';
import { isIP } from 'node:net';

export function normalizeDomain(value) {
  const text = String(value).trim().toLowerCase().replace(/\.$/, '');
  if (/[\s/@:*^$|?#\\]/.test(text) || isIP(text)) return '';
  const host = domainToASCII(text);
  if (!host || host.length > 253 || !host.includes('.') || /(?:^|\.)(?:localhost|local|internal|test|invalid|example)$/.test(host)) return '';
  const labels = host.split('.');
  if (labels.some((label) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))) return '';
  if (!/[a-z]/.test(labels.at(-1))) return '';
  return host;
}

export function parseHosts(text) {
  const result = new Set();
  for (let line of text.split(/\r?\n/)) {
    line = line.trim();
    if (!line || /^[!#\[]/.test(line) || line.startsWith('@@')) continue;
    const adblock = /^\|\|([^/^$*|]+)\^$/.exec(line);
    if (adblock) line = adblock[1];
    else if (/^(?:0\.0\.0\.0|127\.0\.0\.1|::1)\s+/.test(line)) line = line.split(/\s+/)[1];
    const host = normalizeDomain(line);
    if (host) result.add(host);
  }
  return [...result];
}

// Deliberately NOT an ABP/uBO engine. Only unconditional entire-host rules.
// Exceptions with any modifiers conservatively exclude the affected host.
export function parseUblockHosts(text) {
  const excluded = new Set();
  const candidates = new Set();
  let conditionalDepth = 0;
  for (const original of text.split(/\r?\n/)) {
    const line = original.trim();
    if (/^!#if\b/.test(line)) { conditionalDepth++; continue; }
    if (/^!#endif\b/.test(line)) { conditionalDepth = Math.max(0, conditionalDepth - 1); continue; }
    const exception = /^@@\|\|([^/^$*|]+)\^/.exec(line);
    if (exception) { const host = normalizeDomain(exception[1]); if (host) excluded.add(host); }
    const disabled = /^\|\|([^/^$*|]+)\^\$.*\bbadfilter\b/.exec(line);
    if (disabled) { const host = normalizeDomain(disabled[1]); if (host) excluded.add(host); }
    if (conditionalDepth) continue;
    const block = /^\|\|([^/^$*|]+)\^(?:\$all)?$/.exec(line);
    if (block) { const host = normalizeDomain(block[1]); if (host) candidates.add(host); }
  }
  return [...candidates].filter((host) => ![...excluded].some((allowed) => host === allowed || host.endsWith(`.${allowed}`) || allowed.endsWith(`.${host}`))).sort();
}

export function validateSource(source, slugs) {
  if (!source.id || !source.license || !source.url || !source.sha256 || !source.licenseFile) throw new Error('Missing provenance');
  let count = 0;
  for (const [category, hosts] of Object.entries(source.categories)) {
    if (!slugs.has(category)) throw new Error(`Unknown category: ${category}`);
    const sorted = [...new Set(hosts)].sort();
    if (JSON.stringify(sorted) !== JSON.stringify(hosts) || hosts.some((host) => normalizeDomain(host) !== host)) throw new Error(`Invalid host list: ${source.id}`);
    count += hosts.length;
  }
  return count;
}
