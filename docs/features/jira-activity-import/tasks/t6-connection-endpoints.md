---
id: T6
title: "Expose Connection, authorization, re-authorisation and project endpoints"
layer: "ports"
deps: ["T5"]
acs: ["AC-01", "AC-02", "AC-03", "AC-04", "AC-06", "AC-16"]
files_hint: ["src/modules/integrations/connections/connections.controller.ts", "test/integrations/connections.e2e-spec.ts"]
owner: "Denys Mokhrin"
estimate: "M"
status: "todo"
---

# T6 — Expose Connection, authorization, re-authorisation and project endpoints

## Why

Derives from [PRD §AC-01](../PRD.md), [PRD §AC-02](../PRD.md), [PRD §AC-03](../PRD.md), [PRD §AC-04](../PRD.md), [PRD §AC-06](../PRD.md), [PRD §AC-16](../PRD.md); [openapi.yaml](../contracts/openapi.yaml).

## What

Operations `startJiraAuthorization` … `removeJiraProject`.

Files: `src/modules/integrations/connections/connections.controller.ts`, `test/integrations/connections.e2e-spec.ts`

## Definition of Done

- [ ] e2e tests return the openapi.yaml responses incl. 409 for an existing Connection and the last project, 404 for another Team, 429 after 10 attempts per hour
- [ ] `pnpm lint` and `pnpm typecheck` clean
- [ ] tests start red, then green (CLAUDE.md §Conventions)

## Notes

Hard rules: only `integrations` schema and `public/` imports (except T1/T16 by scope); no tokens or payloads in logs; staged migrations are promoted, never hand-written in the live tree.
