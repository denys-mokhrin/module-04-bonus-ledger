---
id: T4
title: "Build the Jira ACL: OAuth 3LO client, REST client with retry-hint back-off, issue/Worklog mapper"
layer: "infra"
deps: []
acs: ["AC-09", "AC-15", "AC-17"]
files_hint: ["src/modules/integrations/jira/", "test/fixtures/jira/"]
owner: "Denys Mokhrin"
estimate: "L"
status: "todo"
---

# T4 — Build the Jira ACL: OAuth 3LO client, REST client with retry-hint back-off, issue/Worklog mapper

## Why

Derives from [PRD §AC-09](../PRD.md), [PRD §AC-15](../PRD.md), [PRD §AC-17](../PRD.md); [ADR 0002](../adr/0002-identify-imported-issues-by-jira-issue-id.md), [ADR 0007](../adr/0007-authorise-jira-with-oauth-3lo-and-encrypted-refresh-token.md).

## What

`customfield_*` only here; refresh token encrypted at rest, decrypted only in the client.

Files: `src/modules/integrations/jira/`, `test/fixtures/jira/`

## Definition of Done

- [ ] unit tests on recorded fixtures map issues by Jira issue id, find the story-point field or report it missing, detect a revoked grant, back off on throttling; no token in logs
- [ ] `pnpm lint` and `pnpm typecheck` clean
- [ ] tests start red, then green (CLAUDE.md §Conventions)

## Notes

Hard rules: only `integrations` schema and `public/` imports (except T1/T16 by scope); no tokens or payloads in logs; staged migrations are promoted, never hand-written in the live tree.
