---
id: T3
title: "Promote staged migrations for sync runs, imported issues, worklogs, Jira users, alerts and processed events"
layer: "migration"
deps: ["T2"]
acs: ["AC-07", "AC-08", "AC-09", "AC-13", "AC-19", "AC-25"]
files_hint: ["docs/features/jira-activity-import/migrations/20261124120400_*", "docs/features/jira-activity-import/migrations/2026112412050*", "docs/features/jira-activity-import/migrations/2026112412060*", "docs/features/jira-activity-import/migrations/2026112412070*", "docs/features/jira-activity-import/migrations/2026112412080*", "docs/features/jira-activity-import/migrations/2026112412090*", "docs/features/jira-activity-import/migrations/20261124121000_*", "src/modules/integrations/db/"]
owner: "Denys Mokhrin"
estimate: "S"
status: "todo"
---

# T3 — Promote staged migrations for sync runs, imported issues, worklogs, Jira users, alerts and processed events

## Why

Derives from [PRD §AC-07](../PRD.md), [PRD §AC-08](../PRD.md), [PRD §AC-09](../PRD.md), [PRD §AC-13](../PRD.md), [PRD §AC-19](../PRD.md), [PRD §AC-25](../PRD.md); [data-model](../data-model.md).

## What

Remaining tables of the data model; unique keys of ADR 0002/0003.

Files: `docs/features/jira-activity-import/migrations/20261124120400_*`, `docs/features/jira-activity-import/migrations/2026112412050*`, `docs/features/jira-activity-import/migrations/2026112412060*`, `docs/features/jira-activity-import/migrations/2026112412070*`, `docs/features/jira-activity-import/migrations/2026112412080*`, `docs/features/jira-activity-import/migrations/2026112412090*`, `docs/features/jira-activity-import/migrations/20261124121000_*`, `src/modules/integrations/db/`

## Definition of Done

- [ ] the seven remaining staged pairs apply and revert cleanly after T2
- [ ] `pnpm lint` and `pnpm typecheck` clean
- [ ] tests start red, then green (CLAUDE.md §Conventions)

## Notes

Hard rules: only `integrations` schema and `public/` imports (except T1/T16 by scope); no tokens or payloads in logs; staged migrations are promoted, never hand-written in the live tree.
