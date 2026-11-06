# ADR 0002: Persistence — one Prisma schema and client per context, UUIDv7 ids

- Status: Accepted
- Date: 2026-11-06

## Context

ADR 0001 fixes PostgreSQL 16 + Prisma and gives each bounded context its own Postgres schema (`identity`, `integrations`, `contribution`, `bonus_review`, `billing`). `ARCHITECTURE.md` forbids cross-schema joins and foreign keys: a context references other contexts' data only by id. Most code is written by an agent, so the rule must be checkable by tools, not only documented.

Prisma can model this in two ways:

- one `schema.prisma` that tags each model with its Postgres schema (`@@schema`), producing **one client that can see every table**;
- **one Prisma schema file and one generated client per context**, each pointed at its own Postgres schema.

There is also the question of who generates ids.

## Decision

- **One Prisma schema per context:** `src/modules/<context>/db/schema.prisma` (`contribution`: `src/modules/contribution/infra/db/schema.prisma`). Each context generates its own client into a gitignored `generated/` folder inside its own module, and the client is wrapped in one Nest provider (`client.ts`).
- **One migration history per context:** `.../db/migrations/<timestamp>_<name>/migration.sql`. Each context connects with `?schema=<its schema>`, so `_prisma_migrations` lives in that context's schema and the five histories never collide. `pnpm db:migrate` applies all five in a fixed order (`identity`, `integrations`, `contribution`, `bonus_review`, `billing`). No order is required, since there are no cross-schema FKs; the order only keeps output deterministic.
- **One `DATABASE_URL`** (one database, one role for the MVP). The schema parameter is appended per context in code and in the migration script.
- **Rollback:** Prisma Migrate is forward-only, so each migration folder also holds a hand-checked `down.sql`. A rollback is `prisma db execute --file down.sql` followed by `prisma migrate resolve --rolled-back <name>`.
- **Outbox:** each context's schema has its own `outbox` table (`eventId` UNIQUE). It is written in the same transaction as the state change, through that context's client.
- **IDs:** UUIDv7, generated in the application by `src/shared/ids` and stored as `uuid`. The database never generates primary keys.
- **"DB as dumb storage":** no triggers, no CHECK constraints carrying business rules, no business defaults in SQL. Business rules live in code, where they are tested.

## Alternatives considered

- **Single `schema.prisma` with `@@schema` (multiSchema).** Simpler tooling: one client, one migration history, one generate step. But the single client exposes every context's tables to every module, so "no context reads another context's schema" would be a convention only. A mistaken query would compile and pass the lint. Rejected because enforcement is the point of ADR 0001.
- **One Postgres role per context with grants.** Stronger isolation at runtime, but more setup (roles, grants, per-context URLs) for one developer. Can be added later without changing code layout.
- **Database-generated ids (`gen_random_uuid()`, serial).** Ids would only exist after insert, which makes deterministic `eventId`s, outbox writes and pure-domain tests harder. Serial ids also leak volume across tenants. UUIDv7 is time-sortable (good index locality) and needs no database round-trip.
- **UUIDv4.** Random order fragments B-tree indexes on high-insert tables (issue snapshots, outbox).

## Consequences

- The compiler and the boundaries lint rule (the client lives inside the module folder) both stop one context from querying another's tables.
- There are five `prisma generate` and five `migrate` runs. They are wrapped in `pnpm db:generate` / `pnpm db:migrate` / `pnpm db:migrate:dev <context> <name>`, and CI runs the same scripts.
- Prisma's multi-schema-file, multi-client setup on one database is **not yet verified** on the Prisma version that will be pinned. Scaffold task `S4` must prove it: five clients generate, five histories apply to a fresh database, and each `_prisma_migrations` sits in its own schema. If it fails, this ADR is revisited before any feature migration is written.
- Reports across contexts must use events or read models, never SQL joins (already a consequence of ADR 0001).
- Every `down.sql` must be written and reviewed by hand. `generate-data-model` stages paired up/down SQL that `implement-tasks` promotes into this layout.
