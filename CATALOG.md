# Categorized public catalog

The complete published dataset is described by `catalog-index.json` and the
independently licensed JSON files in `sources/`. `domains.json` preserves the
original 1,450-entry curated export contract. It is **not** the whole dataset.

Release 2026-10-12 includes **92,396 category/hostname entries**, representing
**91,371 unique hostnames**, across 32 categories and 55 source snapshots.
An entry can occur in several categories; source duplicates are counted only
once per category in these totals. This is not a claim that every site was
individually reviewed or recently visited.

## Reconciliation with the original catalog

The original public-source product snapshot contained 74,550 category entries.
This release recovers 72,792 of those entries from curated literals or matching
independently licensed public sources, and adds other public-source entries.
The remaining **1,758 original entries are not published**: the old combined
file lost row-level provenance, some public lists changed, and a contributing
gist did not supply a redistribution license. No missing entry is silently
reassigned to an invented source. Counts by category are in
`catalog-index.json` → `baseline.missingCounts`.

The builder never reads private legacy allow/block files, school settings,
runtime databases, student visits, account names or credentials. Old school
resource entries are exported only when independently present in the reviewed
public project literals. This repository update does not change live policy.

## uBlock Origin additions

The selection follows the public `gorhill/uBlock` asset registry and its
`uBlockOrigin/uAssets` lists. Upstream commits are pinned in `upstream-pins.json`.
Only unconditional `||hostname^` and `||hostname^$all` network filters are
converted. Ordinary URL paths, contextual modifiers, CSS rules, scriptlets,
conditional sections and includes are not interpreted as domain classifications.
Exceptions and disabled (`badfilter`) host rules across the selected uAssets
snapshots conservatively remove conflicting candidates.

Ads/privacy hosts are recorded under `advertising-trackers`. The badware list
uses `malware-phishing` as a compatibility category; it means **an upstream
badware-risk assertion**, not a verified finding of phishing or illegality.
No uBO rule is converted into a games classification just because uBO blocks it.
This extractor is deliberately not a replacement for the uBO filtering engine.

## Schema and use

Each source contains its own URL, revision (where available), SHA-256 of the
downloaded input, applicable license, license copy, extraction modifications,
generation time and sorted category arrays. Mutable Toulouse downloads have a
retrieval timestamp/hash, not an invented Git revision. A generation date is not
a site review date. No confidence score or safety guarantee is claimed.

```sh
npm test
node scripts/read-catalog.mjs             # counts, without network requests
node scripts/read-catalog.mjs --json      # merged view with source references
```

For a source refresh, explicitly run:

```sh
node scripts/build-catalog.mjs /path/to/chrome-guardian-extension/mock-server
```

The input must be the public source tree with its static catalog and literal
builder. The script fetches only the configured public upstream files. It does
not crawl categorized websites, access accounts, publish rules or restart servers.
Pin updates and changed licenses require review before another publication.

## Matching and corrections

Hostnames are exact dataset assertions. Do not silently expand them to parents,
subdomains, wildcard rules or every page on a mixed-purpose site. A listed host
may be infrastructure rather than a user-facing website. School allows and
other policy precedence remain the consuming application's responsibility.
Unknown sites must not become blocked just because they are absent from this
catalog. Review disputed entries using public, non-sensitive evidence.

## Licensing

`sources/` is a collection of separate licensed works, not proprietary project
data. Each source's license and obligations remain applicable. See
`THIRD_PARTY_NOTICES.md` and `licenses/`. Original repository documentation,
curated contributions and tooling retain the repository LICENSE; it does not
override imported data licenses or claim ownership of individual hostnames.
No uBlock application source, executable, extension package or scriptlet is
included. Imported normalized GPL data is provided in editable source form.
