---
status: Accepted
owner: "Denys Mokhrin"
reviewers: ["Tech Lead"]
updated_at: "2026-11-24"
feature_size: M
stage: "04-05"
ticket: "<TBD>"
---

# 0002 — Identify Imported Issues by Jira issue id

- **Status:** Accepted
- **Date:** 2026-11-24
- **Deciders:** Denys Mokhrin (Architect) with Claude during the architecture-design walk

## Context

SAD §2 records a known constraint: Jira changes the issue key when an issue moves between projects (`.notes/decisions.md` §4), while `.claude/rules/integrations-jira.md` still names the issue key as the upsert key. PRD AC-09 requires a moved issue to stay one Imported Issue, and the 0-duplicates NFR forbids a second copy. The §4 pillar 2 was first drafted on the issue key and edited after this constraint was applied.

## Decision drivers

- AC-09: a moved issue stays one Imported Issue with its activity
- Idempotency NFR: 0 duplicated Imported Issues across repeated imports (PRD §6)
- SAD §2 constraint: the issue key is not stable

## Considered options

1. **Jira issue id as the upsert key, issue key as a mutable attribute** — the numeric id Jira never changes, scoped by the Connection id, identifies the snapshot; the key is updated on every run.
2. **Jira issue key as the upsert key (current project rule)** — the human-readable key identifies the snapshot, as the rule file says.
3. **Issue key plus a move-detection step** — keep the key and merge the old and new snapshot when Jira reports a move.

## Decision outcome

**Chosen:** Option 1. Only the issue id survives a move without extra logic, so AC-09 and the 0-duplicates target hold by construction. Option 2 turns every move into a duplicate; option 3 depends on reading the change log for every issue, which costs requests and still misses moves done in bulk.

## Consequences

**Positive**
- Moves, renames and project re-keys never create duplicates
- Deterministic `eventId` can be derived from a stable id

**Negative**
- The project rule file must be updated (SAD §11)
- Fixtures and logs must show both id and key to stay readable

**Neutral**
- Worklogs already have their own stable Jira id; this ADR is about issues

## Links

- PRD: [[../PRD.md]] AC-09, §6 Idempotency
- SAD: [[../sad.md]] §2, §4 (pillar 2)
- Related ADR: [[0003-select-changes-by-updated-cursor-and-content-hash]]
