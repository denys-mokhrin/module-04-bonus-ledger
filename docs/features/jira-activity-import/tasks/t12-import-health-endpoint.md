---
id: T12
title: "Expose Import Health for the Team Lead and HR Reviewers"
layer: "ports"
deps: ["T10", "T11"]
acs: ["AC-13", "AC-14", "AC-23"]
files_hint: ["src/modules/integrations/health/", "test/integrations/import-health.e2e-spec.ts"]
owner: "Denys Mokhrin"
estimate: "M"
status: "todo"
---

# T12 — Expose Import Health for the Team Lead and HR Reviewers

## Why

Derives from [PRD §AC-13](../PRD.md), [PRD §AC-14](../PRD.md), [PRD §AC-23](../PRD.md); [openapi.yaml getImportHealth](../contracts/openapi.yaml).

## What

See the linked sections; scope = files_hint.

Files: `src/modules/integrations/health/`, `test/integrations/import-health.e2e-spec.ts`

## Definition of Done

- [ ] e2e test: counts per project for each Open period, open alerts, Final Pass status; HR Reviewer read-only; another Company gets not found; p95 ≤ 300 ms on seeded data
- [ ] `pnpm lint` and `pnpm typecheck` clean
- [ ] tests start red, then green (CLAUDE.md §Conventions)

## Notes

Hard rules: only `integrations` schema and `public/` imports (except T1/T16 by scope); no tokens or payloads in logs; staged migrations are promoted, never hand-written in the live tree.
