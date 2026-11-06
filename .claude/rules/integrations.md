---
paths:
  - "src/modules/integrations/**"
---

# Jira Integration rules (anti-corruption layer)

- Jira DTOs, custom field ids (`customfield_*`) and HTTP clients stay inside this folder. The published events use only product terms from `docs/bc-map.md`.
- A sync must be idempotent: upsert by Jira issue key plus the sync window. Re-running the same window publishes no duplicate events.
- Tokens are decrypted only in the HTTP client, right before a request. Never log tokens, request headers or full Jira payloads.
- Respect Jira rate limits: back off on 429 using `Retry-After`, and never retry in a tight loop.
- Stop syncing for a company after `SubscriptionSuspended`.
- Tests use recorded fixtures in `test/fixtures/jira/` with fake people. Never call real Jira from tests.
