# Shared kernel (technical only)

Technical primitives used by every module. No business rules and no imports from `src/modules/` (lint-enforced).

- `config/`: environment validation at boot (`loadConfig`, `APP_CONFIG`)
- `ids/`: `newId()`, UUIDv7 generated in the app
- `clock/`: `Clock` behind the `CLOCK` token (`SystemClock`, `FixedClock` for tests)
- `money/`: `Money` (integer `amountCents` + ISO currency)
- `errors/`: `DomainError` base and the global error-envelope filter
- `events/`: the in-process event bus (the per-context outbox is still to come, scaffold task S9)
- `jobs/`: the root BullMQ connection
