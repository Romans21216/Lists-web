# Lists-web

Public categorized-domain datasets for Classroom Guardian. No student records,
school policies, credentials, browsing history or private application code.

## Full catalog — October 12, 2026

**92,396 category entries · 91,371 unique hostnames · 32 categories**

Use [catalog-index.json](catalog-index.json) and the independently licensed files
in [sources/](sources/). The older [domains.json](domains.json) remains the
1,450-entry curated subset for compatibility—not the full dataset.

The catalog includes conservative domain-only additions selected from uBlock
Origin's upstream asset lists. Conditional filters, exceptions, page paths,
cosmetic filters and scriptlets are not broadened into whole-site categories.

[Catalog format, usage and limitations](CATALOG.md) ·
[Source import report](SOURCE-IMPORT.md) ·
[Licenses and attribution](THIRD_PARTY_NOTICES.md)

## Honest coverage

The old catalog has 74,550 category entries. This publication independently
recovers 72,792 of those and adds other licensed public-source entries.
**1,758 original entries remain withheld** because their exact public provenance
could not be verified from current licensed snapshots. The reconciliation report
lists the missing counts; this is not a claim that all old entries were published.

Categories are source assertions, not a guarantee of accuracy or maliciousness.
Sites and ownership change. Hostnames do not imply wildcard or parent-domain
blocking. This update does not change school enforcement or restart services.

## Validate and read

Requires Node.js 20 or later; no package dependencies.

```sh
npm test
node scripts/read-catalog.mjs
node scripts/read-catalog.mjs --json
```

Corrections should include the domain, proposed category and public evidence,
never student activity or private school details. Sensitive reports:
bp@amanwithcode.org. See [SECURITY.md](SECURITY.md).

## Licensing

Original documentation, curated contributions and original tooling retain
[LICENSE](LICENSE). Imported source datasets retain their own licenses, copied
under [licenses/](licenses/); the repository's proprietary notice does not apply
to those imports. This is an aggregate of separately licensed data, not a claim
of ownership over individual domain names or an attempt to relicense uBlock.

Related private development repositories:
[Classroom-guardian](https://github.com/Romans21216/Classroom-guardian) and
[Web-Detection](https://github.com/Romans21216/Web-Detection).
