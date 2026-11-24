---
id: T2
title: "Promote staged migrations for connections, projects, period states and checkpoints"
layer: "migration"
deps: []
acs: ["AC-01", "AC-04", "AC-05", "AC-06"]
files_hint: ["docs/features/jira-activity-import/migrations/20261124120000_*", "docs/features/jira-activity-import/migrations/20261124120100_*", "docs/features/jira-activity-import/migrations/20261124120200_*", "docs/features/jira-activity-import/migrations/20261124120300_*", "src/modules/integrations/db/"]
owner: "Denys Mokhrin"
estimate: "S"
status: "todo"
---

# T2 — Promote staged migrations for connections, projects, period states and checkpoints

## Why

Derives from [PRD §AC-01](../PRD.md), [PRD §AC-04](../PRD.md), [PRD §AC-05](../PRD.md), [PRD §AC-06](../PRD.md); [data-model](../data-model.md).

## What

Tables `connections`, `connection_projects`, `bonus_period_states`, `sync_checkpoints`.

Files: `docs/features/jira-activity-import/migrations/20261124120000_*`, `docs/features/jira-activity-import/migrations/20261124120100_*`, `docs/features/jira-activity-import/migrations/20261124120200_*`, `docs/features/jira-activity-import/migrations/20261124120300_*`, `src/modules/integrations/db/`

## Definition of Done

- [ ] the four staged pairs are promoted to Prisma migrations, apply and revert cleanly on a fresh integrations schema
- [ ] `pnpm lint` and `pnpm typecheck` clean
- [ ] tests start red, then green (CLAUDE.md §Conventions)

## Notes

Hard rules: only `integrations` schema and `public/` imports (except T1/T16 by scope); no tokens or payloads in logs; staged migrations are promoted, never hand-written in the live tree.
