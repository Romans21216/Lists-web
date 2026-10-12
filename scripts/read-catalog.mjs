import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const index = JSON.parse(fs.readFileSync(path.join(root, 'catalog-index.json')));
if (!process.argv.includes('--json')) {
  console.log(JSON.stringify({ generatedAt: index.generatedAt, categoryEntries: index.categoryEntries, uniqueHostnames: index.uniqueHostnames, counts: index.counts, baseline: index.baseline }, null, 2));
} else {
  const curated = JSON.parse(fs.readFileSync(path.join(root, index.curatedFile)));
  const categories = Object.fromEntries(Object.entries(curated.categories).map(([slug, hosts]) => [slug, new Map(hosts.map((host) => [host, ['project-curated']]))]));
  for (const record of index.sources) {
    const source = JSON.parse(fs.readFileSync(path.join(root, record.file)));
    for (const [slug, hosts] of Object.entries(source.categories)) for (const host of hosts) {
      const references = categories[slug].get(host) || [];
      if (!references.includes(source.id)) references.push(source.id);
      categories[slug].set(host, references);
    }
  }
  console.log(JSON.stringify({ schemaVersion: 2, generatedAt: index.generatedAt, sources: index.sources, categories: Object.fromEntries(Object.entries(categories).map(([slug, hosts]) => [slug, [...hosts].sort(([a], [b]) => a.localeCompare(b)).map(([hostname, sourceIds]) => ({ hostname, sourceIds }))])) }));
}
