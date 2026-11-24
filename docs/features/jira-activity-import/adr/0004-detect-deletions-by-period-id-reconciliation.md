---
status: Accepted
owner: "Denys Mokhrin"
reviewers: ["Tech Lead"]
updated_at: "2026-11-24"
feature_size: M
stage: "04-05"
ticket: "<TBD>"
---

# 0004 — Detect deletions by period id reconciliation

- **Status:** Accepted
- **Date:** 2026-11-24
- **Deciders:** Denys Mokhrin (Architect) with Claude during the architecture-design walk

## Context

AC-27 requires activity that is deleted in Jira, moved out of the Team's projects or belongs to a removed project to stop counting in Open Bonus Periods. SAD §2 records a past design incident: a "mark and sweep" of rows not seen in a run would delete good data, because an issue updated later falls outside the earlier month's window.

## Decision drivers

- AC-27: withdrawals reach Contribution Scoring once; In Review and Closed periods never change
- SAD §2 past incident: unseen-in-run ≠ deleted
- Idempotency NFR (PRD §6)

## Considered options

1. **Deleted-worklog feed + id reconciliation of each Open period** — ask Jira which Worklogs were deleted since the checkpoint and compare the issue ids returned by the period's membership query (ADR 0003) with the imported set.
2. **Delete and re-insert the period each run** — drop the period's snapshots and write what Jira returns now, which removes deleted items by itself.
3. **Jira deletion webhooks** — subscribe to issue and Worklog deletion events and withdraw on delivery.

## Decision outcome

**Chosen:** Option 1. It is the only option that withdraws real deletions without deleting good data; delete-and-insert loses the stable identity of ADR 0002 and republishes everything; webhooks need a public inbound endpoint and still miss events during downtime, so reconciliation would be needed anyway. The §2 mark-and-sweep incident was not reconsidered.

## Consequences

**Positive**
- Withdrawals are explicit events, so scoring stays explainable
- Closed and In Review periods are never touched (ADR 0006)

**Negative**
- Reconciliation adds one id-only query per project per run
- The deleted-worklog feed is not yet checked in Atlassian docs (SAD §11)

**Neutral**
- Removing a Jira Project from the Team is handled locally without asking Jira

## Links

- PRD: [[../PRD.md]] AC-27
- SAD: [[../sad.md]] §2, §4 (pillar 4), §8
- Related ADR: [[0003-select-changes-by-updated-cursor-and-content-hash]], [[0006-follow-bonus-period-state-through-bonus-review-events]]
