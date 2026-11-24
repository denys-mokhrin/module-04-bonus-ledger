# Data-model audit — jira-activity-import — 2026-11-24

## Generated files

- `docs/features/jira-activity-import/data-model.md`
- 11 staged pairs in `docs/features/jira-activity-import/migrations/` (`20261124120000_create_connections` … `20261124121000_create_processed_events`).
- Migrations are **staged** — not yet in the live tree `src/modules/integrations/db/migrations/<timestamp>_<name>/migration.sql`; `implement-tasks` promotes them (re-stamping the timestamp, `down.sql` kept next to `migration.sql` per the architecture map).

## Convention divergences

- Course naming `<timestamp>_create_<table>.up.sql/.down.sql` vs the repo's Prisma Migrate folders `<timestamp>_<name>/migration.sql` + `down.sql`: resolved at promote time.
- `.claude/rules/migrations.md` bootstrapped from the course baseline in this run.
- `withdrawn_at` on `imported_issues`/`worklogs` looks like soft delete but is domain state: a withdrawal must not change Closed or In Review periods (AC-27), so the row stays.

## Drift findings

- Schema-vs-source: skipped — no `integrations` code exists yet (greenfield foundation).
- Model-vs-spec: every persist note in `sad.md` §6 has a table (Connection Project, Sync Checkpoint, Jira User Match → `jira_users` + `jira_user_match_events`, Import Alert, Bonus Period State, Processed Event). The outbox is owned by scaffold S9, not created here. Rate limiting of connection attempts (PRD §6.1) uses Redis counters, no table.

## Self-check

- Naming: plural snake_case tables, timestamp-prefixed filenames — pass.
- down.sql reversibility: every CREATE TABLE/INDEX has a DROP — pass.
- FK indexes: every FK column leads a unique or plain index — pass.
- Forbidden features (CHECK, TRIGGER, business DEFAULT): none found — pass.

## Breaking changes

None (greenfield tables).

## TBDs

None.
