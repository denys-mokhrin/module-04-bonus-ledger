---
id: T10
title: "Schedule the Final Pass with retries while the period is Open"
layer: "app"
deps: ["T8"]
acs: ["AC-12", "AC-23", "AC-26"]
files_hint: ["src/modules/integrations/sync/final-pass.service.ts", "test/integrations/final-pass.int-spec.ts"]
owner: "Denys Mokhrin"
estimate: "M"
status: "todo"
---

# T10 — Schedule the Final Pass with retries while the period is Open

## Why

Derives from [PRD §AC-12](../PRD.md), [PRD §AC-23](../PRD.md), [PRD §AC-26](../PRD.md); [sad §6 Final Pass with scheduled retry](../sad.md).

## What

See the linked sections; scope = files_hint.

Files: `src/modules/integrations/sync/final-pass.service.ts`, `test/integrations/final-pass.int-spec.ts`

## Definition of Done

- [ ] integration test: Final Pass imports late Worklogs, a failure is retried until success or period leaves Open, no run after success
- [ ] `pnpm lint` and `pnpm typecheck` clean
- [ ] tests start red, then green (CLAUDE.md §Conventions)

## Notes

Hard rules: only `integrations` schema and `public/` imports (except T1/T16 by scope); no tokens or payloads in logs; staged migrations are promoted, never hand-written in the live tree.
