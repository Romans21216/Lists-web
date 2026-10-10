# Lists-web

Public repository reserved for reviewed categorized-domain lists used by
Classroom Guardian. It contains domain classification data, not the private
school console, extension credentials, student histories, or tenant policies.

## Repository status

This initial commit series establishes documentation and publication rules.
No domain dataset has been uploaded yet. The existing local catalog imports
third-party sources whose redistribution terms and provenance must be
reviewed before publication. No completeness, accuracy, freshness, or
real-time synchronization claim is made.

## Intended data contract

A future reviewed export should have a documented schema version and include:

- A normalized hostname, without a URL path, query, fragment, user identifier,
  or credentials. Preserve explicit wildcard semantics rather than inferring
  them from a parent domain.
- One or more documented category slugs.
- Source/provenance reference and applicable license.
- Review date and dataset release date.
- Optional confidence or review status with a documented meaning.

These are publication requirements, not a claim that data files exist.
Do not publish raw HTML, full visited URLs, browsing timestamps tied to users,
student names, emails, school membership, private allow/block rules, or
internal review notes. A domain discovered through a student visit must not
carry the student's activity or identity into an export.

## Categories and corrections

The parent product taxonomy includes games, social media, education, search,
news, productivity, artificial intelligence, shopping, finance, and safety/
security categories. Use the canonical taxonomy and stable slugs at export
time; do not treat this README as the complete taxonomy.

A classification is not evidence that a domain is illegal or malicious.
Sites and ownership change. Submit a public correction issue containing only
the domain, proposed category, and non-sensitive supporting evidence.
For sensitive matters contact bp@amanwithcode.org privately. Do not open
untrusted links merely because they appear in a list.

## Publication checks

Before adding data, validate normalization, duplicate entries, category
validity, provenance, source-license compatibility, and absence of personal
or tenant-specific data. Use deterministic exports and reviewed diffs.
The local parent product provides `catalog:build` and `catalog:check`
scripts in `mock-server/`; those scripts are not included here and must not
be assumed to produce a publication-safe export without a separate review.

## Licensing

Public visibility is not a general reuse grant. Original documentation and
original database material, to the extent protectable and owned by the
contributors, are proprietary under [LICENSE](LICENSE). Individual factual
domains are not claimed as owned by this repository. Third-party datasets
retain their own terms; those terms override this notice for their material.
Do not relicense imported lists under this repository's notice.
See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Related repositories and contact

[Classroom-guardian](https://github.com/Romans21216/Classroom-guardian)
and [Web-Detection](https://github.com/Romans21216/Web-Detection)
hold private application and detection development.
Contact: bp@amanwithcode.org.
