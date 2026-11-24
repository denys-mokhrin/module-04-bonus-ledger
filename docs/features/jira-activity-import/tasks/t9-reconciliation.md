---
id: T9
title: "Detect deletions and scope exits by period reconciliation and publish withdrawals"
layer: "app"
deps: ["T8"]
acs: ["AC-27"]
files_hint: ["src/modules/integrations/sync/reconciliation.service.ts", "test/integrations/reconciliation.int-spec.ts"]
owner: "Denys Mokhrin"
estimate: "M"
status: "todo"
---

# T9 — Detect deletions and scope exits by period reconciliation and publish withdrawals

## Why

Derives from [PRD §AC-27](../PRD.md); [ADR 0004](../adr/0004-detect-deletions-by-period-id-reconciliation.md).

## What

See the linked sections; scope = files_hint.

Files: `src/modules/integrations/sync/reconciliation.service.ts`, `test/integrations/reconciliation.int-spec.ts`

## Definition of Done

- [ ] integration test: deleted Worklog, issue moved to a foreign project and removed project are withdrawn in Open periods only; Closed periods unchanged
- [ ] `pnpm lint` and `pnpm typecheck` clean
- [ ] tests start red, then green (CLAUDE.md §Conventions)

## Notes

Hard rules: only `integrations` schema and `public/` imports (except T1/T16 by scope); no tokens or payloads in logs; staged migrations are promoted, never hand-written in the live tree.
