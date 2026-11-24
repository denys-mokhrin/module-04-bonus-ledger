---
id: T7
title: "Follow Bonus Period and subscription state from events"
layer: "app"
deps: ["T1", "T2"]
acs: ["AC-11", "AC-22", "AC-26"]
files_hint: ["src/modules/integrations/sync/period-state.listener.ts", "src/modules/integrations/sync/period-state.repo.ts"]
owner: "Denys Mokhrin"
estimate: "S"
status: "todo"
---

# T7 — Follow Bonus Period and subscription state from events

## Why

Derives from [PRD §AC-11](../PRD.md), [PRD §AC-22](../PRD.md), [PRD §AC-26](../PRD.md); [ADR 0006](../adr/0006-follow-bonus-period-state-through-bonus-review-events.md), [sad §6 Follow Bonus Period state](../sad.md).

## What

Writes `bonus_period_states`, `processed_events`.

Files: `src/modules/integrations/sync/period-state.listener.ts`, `src/modules/integrations/sync/period-state.repo.ts`

## Definition of Done

- [ ] listener tests: duplicate eventId ignored, period leaving Open cancels pending runs, suspension pauses runs
- [ ] `pnpm lint` and `pnpm typecheck` clean
- [ ] tests start red, then green (CLAUDE.md §Conventions)

## Notes

Hard rules: only `integrations` schema and `public/` imports (except T1/T16 by scope); no tokens or payloads in logs; staged migrations are promoted, never hand-written in the live tree.
