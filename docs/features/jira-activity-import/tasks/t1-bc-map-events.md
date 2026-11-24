---
id: T1
title: "Add JiraUserMatched, BonusPeriodReviewStarted and SubscriptionActivated→integrations to the bc-map and public event types"
layer: "docs"
deps: []
acs: ["AC-11", "AC-19", "AC-26"]
files_hint: ["docs/bc-map.md", "src/modules/integrations/public/", "src/modules/bonus-review/public/"]
owner: "Denys Mokhrin"
estimate: "S"
status: "todo"
---

# T1 — Add JiraUserMatched, BonusPeriodReviewStarted and SubscriptionActivated→integrations to the bc-map and public event types

## Why

Derives from [PRD §AC-11](../PRD.md), [PRD §AC-19](../PRD.md), [PRD §AC-26](../PRD.md); [sad §11](../sad.md), [ADR 0005](../adr/0005-publish-jira-user-matches-as-events-for-immediate-attribution.md), [ADR 0006](../adr/0006-follow-bonus-period-state-through-bonus-review-events.md).

## What

Event names + payload types from [events.md](../contracts/events.md); update `.claude/rules/integrations-jira.md` upsert key to the Jira issue id (ADR 0002).

Files: `docs/bc-map.md`, `src/modules/integrations/public/`, `src/modules/bonus-review/public/`

## Definition of Done

- [ ] bc-map lists the three event edges and the integrations/bonus-review public/ types compile; boundaries lint passes
- [ ] `pnpm lint` and `pnpm typecheck` clean
- [ ] tests start red, then green (CLAUDE.md §Conventions)

## Notes

Hard rules: only `integrations` schema and `public/` imports (except T1/T16 by scope); no tokens or payloads in logs; staged migrations are promoted, never hand-written in the live tree.
