---
id: T14
title: "Expose Jira User list and matching endpoints"
layer: "ports"
deps: ["T13"]
acs: ["AC-19", "AC-20", "AC-21", "AC-28", "AC-29"]
files_hint: ["src/modules/integrations/matching/matching.controller.ts", "test/integrations/matching.e2e-spec.ts"]
owner: "Denys Mokhrin"
estimate: "M"
status: "todo"
---

# T14 — Expose Jira User list and matching endpoints

## Why

Derives from [PRD §AC-19](../PRD.md), [PRD §AC-20](../PRD.md), [PRD §AC-21](../PRD.md), [PRD §AC-28](../PRD.md), [PRD §AC-29](../PRD.md); [openapi.yaml](../contracts/openapi.yaml).

## What

See the linked sections; scope = files_hint.

Files: `src/modules/integrations/matching/matching.controller.ts`, `test/integrations/matching.e2e-spec.ts`

## Definition of Done

- [ ] e2e tests return the openapi.yaml responses incl. 409 for a Member already matched and cursor pagination
- [ ] `pnpm lint` and `pnpm typecheck` clean
- [ ] tests start red, then green (CLAUDE.md §Conventions)

## Notes

Hard rules: only `integrations` schema and `public/` imports (except T1/T16 by scope); no tokens or payloads in logs; staged migrations are promoted, never hand-written in the live tree.
