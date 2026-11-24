---
status: Accepted
owner: "Denys Mokhrin"
reviewers: ["Tech Lead"]
updated_at: "2026-11-24"
feature_size: M
stage: "04-05"
ticket: "<TBD>"
---

# 0006 — Follow Bonus Period state through Bonus Review events

- **Status:** Accepted
- **Date:** 2026-11-24
- **Deciders:** Denys Mokhrin (Architect) with Claude during the architecture-design walk

## Context

The import must stop changing a period when it leaves Open (AC-22, AC-26) and must retry a failed Final Pass only while the period is Open (CONTEXT Final Pass). Bonus Review owns the period state; `docs/bc-map.md` has `BonusPeriodOpened` and `BonusPeriodClosed` but no event for Open → In Review, and Bonus Review's facade exposes event types only.

## Decision drivers

- AC-22, AC-26: no Sync Run changes a period that is In Review or Closed
- Final Pass retry ends when the period leaves Open
- No synchronous call into a context without a query facade (SAD §2)

## Considered options

1. **Local read model from Bonus Review events, adding `BonusPeriodReviewStarted`** — `integrations` stores each Team's period state from three events and checks it before every write.
2. **Query Bonus Review synchronously before each Sync Run** — add a period-state facade to bonus-review and call it.
3. **Freeze command from Bonus Review** — bonus-review calls an `integrations` `public/` facade to freeze a period when it moves it to In Review.

## Decision outcome

**Chosen:** Option 1. It keeps contexts decoupled, works when Bonus Review is slow, and uses the event mechanism the foundation already mandates; the new event is a one-line bc-map change. A synchronous query adds a runtime dependency; a freeze command makes bonus-review depend on integrations and is lost if the call fails, unlike an outbox event.

## Consequences

**Positive**
- Sync Runs and match events never touch a period that left Open
- No runtime dependency on bonus-review

**Negative**
- A new event must be added to bc-map and published by bonus-review (SAD §11, High)
- A late event leaves a short window where a Sync Run could still write; guarded by a state check in the write transaction

**Neutral**
- The same read model tells Import Health which periods are Open

## Links

- PRD: [[../PRD.md]] US-07, AC-22, AC-23, AC-26
- SAD: [[../sad.md]] §5
- Related ADR: [[0004-detect-deletions-by-period-id-reconciliation]], [[0005-publish-jira-user-matches-as-events-for-immediate-attribution]]
