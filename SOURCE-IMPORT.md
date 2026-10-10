# Initial public domain export

The dataset has 1,450 category/domain entries from literal curated sections of
the local catalog builder, intersected with the existing catalog in the same
categories. This preserves existing exclusions without importing external feeds
or legacy files. Counts are per category, not globally unique hosts.

Schema version: 1. `generatedAt` records export time, not a site recheck.
`sources` records extraction provenance. `counts` gives per-category totals.
`categories` maps slugs to sorted, deduplicated hostnames. No wildcard semantics,
paths, queries, student activity, account identifiers, confidence scores, or
individual review dates are added.

The mixed-source catalog is withheld pending provenance/licensing review.
This is not an export of private school rules or student data.
