---
paths:
  - "src/modules/integrations/**"
---

# Integrations rules (anti-corruption layer, any provider)

- Provider DTOs, provider-specific field ids and HTTP clients stay inside this module's provider folder. Published events use only product terms from `docs/bc-map.md`.
- A sync must be idempotent: upsert by the provider's natural key plus the sync window. Re-running the same window publishes no duplicate events.
- Tokens are decrypted only in the HTTP client, right before a request. Never log tokens, request headers or full provider payloads.
- Respect the provider's rate limits using the signals it documents; never retry in a tight loop.
- Stop syncing for a company after `SubscriptionSuspended`.
- Tests use recorded fixtures with fake people under `test/fixtures/<provider>/`. Never call a real provider from tests.
