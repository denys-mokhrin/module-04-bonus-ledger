---
id: T8
title: "Implement the daily Sync Run: cursor, content hash, versioned upsert, outbox events"
layer: "app"
deps: ["T3", "T4", "T7"]
acs: ["AC-07", "AC-08", "AC-09", "AC-10", "AC-15"]
files_hint: ["src/modules/integrations/sync/sync-run.service.ts", "src/modules/integrations/sync/sync-run.repo.ts", "test/integrations/sync-run.int-spec.ts"]
owner: "Denys Mokhrin"
estimate: "L"
status: "todo"
---

# T8 — Implement the daily Sync Run: cursor, content hash, versioned upsert, outbox events

## Why

Derives from [PRD §AC-07](../PRD.md), [PRD §AC-08](../PRD.md), [PRD §AC-09](../PRD.md), [PRD §AC-10](../PRD.md), [PRD §AC-15](../PRD.md); [ADR 0001](../adr/0001-run-scheduled-polling-sync-runs-as-bullmq-jobs.md), [ADR 0003](../adr/0003-select-changes-by-updated-cursor-and-content-hash.md), [sad §6 Scheduled daily Sync Run](../sad.md).

## What

Depends on scaffold S8/S9 (jobs, outbox).

Files: `src/modules/integrations/sync/sync-run.service.ts`, `src/modules/integrations/sync/sync-run.repo.ts`, `test/integrations/sync-run.int-spec.ts`

## Definition of Done

- [ ] integration test on fixtures: a re-run of the same window publishes nothing new, a moved issue stays one Imported Issue, a crashed run resumes from its checkpoint, access loss keeps data
- [ ] `pnpm lint` and `pnpm typecheck` clean
- [ ] tests start red, then green (CLAUDE.md §Conventions)

## Notes

Hard rules: only `integrations` schema and `public/` imports (except T1/T16 by scope); no tokens or payloads in logs; staged migrations are promoted, never hand-written in the live tree.
