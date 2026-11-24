---
id: T5
title: "Implement Connection and Jira Project use cases with authorization and domain errors"
layer: "app"
deps: ["T2", "T4"]
acs: ["AC-01", "AC-02", "AC-03", "AC-04", "AC-05", "AC-06", "AC-16"]
files_hint: ["src/modules/integrations/connections/"]
owner: "Denys Mokhrin"
estimate: "M"
status: "todo"
---

# T5 — Implement Connection and Jira Project use cases with authorization and domain errors

## Why

Derives from [PRD §AC-01](../PRD.md), [PRD §AC-02](../PRD.md), [PRD §AC-03](../PRD.md), [PRD §AC-04](../PRD.md), [PRD §AC-05](../PRD.md), [PRD §AC-06](../PRD.md), [PRD §AC-16](../PRD.md); [sad §6 Connect the Team's Jira Site](../sad.md), [Change the Team's Jira Projects](../sad.md), [Re-authorise a Connection](../sad.md).

## What

DomainErrors `INTEGRATIONS_CONNECTION_EXISTS`, `INTEGRATIONS_LAST_PROJECT`, `INTEGRATIONS_NO_PROJECT_PICKED`, `INTEGRATIONS_DIFFERENT_JIRA_SITE`, … (api-sync-report deferral).

Files: `src/modules/integrations/connections/`

## Definition of Done

- [ ] unit tests: one Connection per Team, at least one project, same-site re-authorisation resets checkpoints, other Team/Company answers like not found
- [ ] `pnpm lint` and `pnpm typecheck` clean
- [ ] tests start red, then green (CLAUDE.md §Conventions)

## Notes

Hard rules: only `integrations` schema and `public/` imports (except T1/T16 by scope); no tokens or payloads in logs; staged migrations are promoted, never hand-written in the live tree.
