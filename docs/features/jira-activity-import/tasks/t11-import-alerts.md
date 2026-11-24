---
id: T11
title: "Raise and close Import Alerts for access, missing field, unmatched users and quiet projects"
layer: "app"
deps: ["T8"]
acs: ["AC-15", "AC-17", "AC-18", "AC-25"]
files_hint: ["src/modules/integrations/health/import-alerts.service.ts"]
owner: "Denys Mokhrin"
estimate: "M"
status: "todo"
---

# T11 — Raise and close Import Alerts for access, missing field, unmatched users and quiet projects

## Why

Derives from [PRD §AC-15](../PRD.md), [PRD §AC-17](../PRD.md), [PRD §AC-18](../PRD.md), [PRD §AC-25](../PRD.md); [sad §6 Scheduled daily Sync Run](../sad.md).

## What

See the linked sections; scope = files_hint.

Files: `src/modules/integrations/health/import-alerts.service.ts`

## Definition of Done

- [ ] unit tests: each alert kind opens once (partial unique), closes when fixed; quiet-project uses a rolling 7-day window
- [ ] `pnpm lint` and `pnpm typecheck` clean
- [ ] tests start red, then green (CLAUDE.md §Conventions)

## Notes

Hard rules: only `integrations` schema and `public/` imports (except T1/T16 by scope); no tokens or payloads in logs; staged migrations are promoted, never hand-written in the live tree.
