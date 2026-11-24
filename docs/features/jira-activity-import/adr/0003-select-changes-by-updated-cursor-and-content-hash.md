---
status: Accepted
owner: "Denys Mokhrin"
reviewers: ["Tech Lead"]
updated_at: "2026-11-24"
feature_size: M
stage: "04-05"
ticket: "<TBD>"
---

# 0003 — Select changes by updated cursor and content hash

- **Status:** Accepted
- **Date:** 2026-11-24
- **Deciders:** Denys Mokhrin (Architect) with Claude during the architecture-design walk

## Context

Each Sync Run must refresh the period without duplicating anything and must resume after a crash (CONTEXT Sync Run: idempotent and resumable). Contribution Scoring must receive each change exactly once (AC-10) through the at-least-once outbox.

## Decision drivers

- Idempotency NFR: 0 duplicated reported changes (PRD §6)
- Sync Run p95 ≤ 15 min for ≤ 5,000 changed issues (PRD §6)
- Outbox delivery is at-least-once; consumers deduplicate by `eventId` (SAD §2)

## Considered options

1. **`updated` cursor with a boundary margin + content hash + deterministic `eventId`** — fetch issues updated since the checkpoint, skip unchanged snapshots by hash, publish changes with an id derived from (entity id, hash).
2. **Full re-import of the period every run** — fetch every issue of the period each time and publish all of them.
3. **Delete and insert the period each run** — drop the period's snapshots and write them again.

## Decision outcome

**Chosen:** Option 1. It reads only what changed, so the duration target holds on large sites, and the hash plus deterministic `eventId` make repeated runs publish nothing new. A full re-import burns rate limit and republishes everything; delete-and-insert loses the stable identity of ADR 0002.

## Consequences

**Positive**
- Repeated windows publish no duplicates by construction
- A crashed run resumes from its checkpoint

**Negative**
- The boundary margin re-reads a few minutes of issues every run
- JQL minute precision is assumed, not yet checked (SAD §11)

**Neutral**
- Issues moved into the Team's project are caught because the move updates `updated`

## Links

- PRD: [[../PRD.md]] AC-08, AC-10, §6
- SAD: [[../sad.md]] §4 (pillar 3), §8
- Related ADR: [[0002-identify-imported-issues-by-jira-issue-id]], [[0004-detect-deletions-by-period-id-reconciliation]]
