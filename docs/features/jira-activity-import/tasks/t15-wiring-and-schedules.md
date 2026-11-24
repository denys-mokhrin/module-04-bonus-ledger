---
id: T15
title: "Wire the integrations module, BullMQ schedules and metrics"
layer: "wiring"
deps: ["T6", "T9", "T10", "T12", "T14"]
acs: ["AC-07", "AC-12"]
files_hint: ["src/modules/integrations/integrations.module.ts", "src/app.module.ts"]
owner: "Denys Mokhrin"
estimate: "S"
status: "todo"
---

# T15 — Wire the integrations module, BullMQ schedules and metrics

## Why

Derives from [PRD §AC-07](../PRD.md), [PRD §AC-12](../PRD.md); [sad §8 Observability](../sad.md).

## What

See the linked sections; scope = files_hint.

Files: `src/modules/integrations/integrations.module.ts`, `src/app.module.ts`

## Definition of Done

- [ ] app boots with the module; daily and Final Pass schedules registered; freshness metric and >26 h alert exposed
- [ ] `pnpm lint` and `pnpm typecheck` clean
- [ ] tests start red, then green (CLAUDE.md §Conventions)

## Notes

Hard rules: only `integrations` schema and `public/` imports (except T1/T16 by scope); no tokens or payloads in logs; staged migrations are promoted, never hand-written in the live tree.
