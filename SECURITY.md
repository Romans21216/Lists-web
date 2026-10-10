# Security and privacy — Lists-web

Report vulnerabilities privately to bp@amanwithcode.org. Do not publish
credentials, student information, browsing history, screenshots, essays, or
exploit details in public issues. Include affected version/commit, reproduction
steps using synthetic data, expected/actual behavior, and likely impact.
No guaranteed response time, bounty, or supported-release window is promised.

This repository includes a reviewed source/data snapshot. The deployed
application has a separate lifecycle; a commit is not proof a live fix.

Do not test production systems or school accounts without explicit authorization.
Keep tenant and role boundaries intact. Store passwords, signing keys, OAuth
client files, API tokens, SMTP credentials, runtime databases, and generated
school configuration outside Git. Ignore rules do not remove already committed
secrets. Review exact staged paths and content before every publication.

If a secret is exposed, notify the operator without repeating its value.
Authorized incident handling should revoke/rotate it and assess history and
artifacts; deleting a file alone does not revoke a credential.
