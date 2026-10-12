# Public catalog import report — 2026-10-12

The prior export contained 1,450 curated entries. The source-separated release
now provides 92,396 distinct category/hostname pairs and 91,371 unique hostnames.

Inputs: the public literal catalog builder, its static September 5 snapshot,
reviewed public upstream datasets, and the uBlock Origin asset registry.
No live database, generated school configuration, private allow/block file,
student URL, screenshot or credential was read or published.

The static baseline has 74,550 category entries and SHA-256
`28ca03af2cdd9aae59ac5eb7e99838fa3ad453be859cde5b340b02419b182cf4`.
Its per-row contributing sources were not retained. Only entries independently
found in reviewed public literals or licensed source snapshots are recovered:
72,792 recovered; 1,758 withheld. The old unlicensed bunchc gist and
StevenBlack's multi-source social aggregate are not redistributed. Overlapping
hosts independently supported by other licensed sources may still occur.

Each source JSON records input SHA-256, URL, pinned revision or mutable retrieval
time, license file, modifications and category arrays. Sorted deduplicated
category totals are recomputed by tests. Source duplicates do not inflate counts.

uAssets extraction handles only unconditional whole-host network rules.
Exceptions/badfilter entries conservatively remove overlapping candidates across
selected uAssets files. Includes, conditional rules, resource modifiers, paths,
regexes, cosmetic rules and scriptlets are skipped. This is not full uBO support.

The normalized data files remain separate according to their source licenses.
`catalog-index.json` is metadata and aggregate counts; `read-catalog.mjs --json`
creates a local merged view retaining source references.

Verification: dependency-free Node tests validate names, forbidden inputs,
filter extraction, exceptions, source metadata, license presence, duplicates,
category validity, recomputed totals and baseline reconciliation. A local secret
scan precedes the authorized GitHub publication. Live school policy is unchanged.
