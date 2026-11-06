---
paths:
  - "src/modules/integrations/jira/**"
---

# Jira specifics

- Custom field ids (`customfield_*`) are mapped to product terms only in this folder.
- Natural key for upsert: Jira issue key.
- On HTTP 429, back off using the `Retry-After` header.
- Fixtures live in `test/fixtures/jira/`.
