---
id: T16
title: "Consume activity, withdrawals and JiraUserMatched in contribution (separate context work)"
layer: "app"
deps: ["T1", "T8", "T13"]
acs: ["AC-10", "AC-24", "AC-27"]
files_hint: ["src/modules/contribution/app/"]
owner: "Contribution owner (TBD)"
estimate: "M"
status: "todo"
---

# T16 — Consume activity, withdrawals and JiraUserMatched in contribution (separate context work)

## Why

Derives from [PRD §AC-10](../PRD.md), [PRD §AC-24](../PRD.md), [PRD §AC-27](../PRD.md); [sad §11](../sad.md), [events.md](../contracts/events.md).

## What

Owned by the contribution context; not an integrations change.

Files: `src/modules/contribution/app/`

## Definition of Done

- [ ] contribution listener tests: duplicate eventId ignored, re-attribution touches Open periods only, withdrawals stop counting
- [ ] `pnpm lint` and `pnpm typecheck` clean
- [ ] tests start red, then green (CLAUDE.md §Conventions)

## Notes

Hard rules: only `integrations` schema and `public/` imports (except T1/T16 by scope); no tokens or payloads in logs; staged migrations are promoted, never hand-written in the live tree.
