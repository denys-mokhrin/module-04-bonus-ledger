---
id: T13
title: "Implement Jira User match, unmatch and not-on-this-Team with audit and events"
layer: "app"
deps: ["T3", "T1"]
acs: ["AC-19", "AC-20", "AC-21", "AC-24", "AC-28", "AC-29"]
files_hint: ["src/modules/integrations/matching/"]
owner: "Denys Mokhrin"
estimate: "M"
status: "todo"
---

# T13 — Implement Jira User match, unmatch and not-on-this-Team with audit and events

## Why

Derives from [PRD §AC-19](../PRD.md), [PRD §AC-20](../PRD.md), [PRD §AC-21](../PRD.md), [PRD §AC-24](../PRD.md), [PRD §AC-28](../PRD.md), [PRD §AC-29](../PRD.md); [ADR 0005](../adr/0005-publish-jira-user-matches-as-events-for-immediate-attribution.md), [sad §6 Match Jira Users to Members](../sad.md).

## What

See the linked sections; scope = files_hint.

Files: `src/modules/integrations/matching/`

## Definition of Done

- [ ] unit + integration tests: one Member per Jira User, cross-Team Member answers not found, every change is audited and emits JiraUserMatched, alert closes
- [ ] `pnpm lint` and `pnpm typecheck` clean
- [ ] tests start red, then green (CLAUDE.md §Conventions)

## Notes

Hard rules: only `integrations` schema and `public/` imports (except T1/T16 by scope); no tokens or payloads in logs; staged migrations are promoted, never hand-written in the live tree.
