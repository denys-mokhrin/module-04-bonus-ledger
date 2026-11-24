---
status: Accepted
owner: "Denys Mokhrin"
reviewers: ["Tech Lead"]
updated_at: "2026-11-24"
feature_size: M
stage: "04-05"
ticket: "<TBD>"
---

# 0005 — Publish Jira User matches as events for immediate attribution

- **Status:** Accepted
- **Date:** 2026-11-24
- **Deciders:** Denys Mokhrin (Architect) with Claude during the architecture-design walk

## Context

Clarified PRD AC-19, AC-28 and AC-29 say a match, unmatch or "not on this Team" mark changes attribution in every Open Bonus Period right away, also after a successful Final Pass, when no Sync Run will follow. Matches live in `integrations` (it owns Jira Users); Contribution Scoring owns attribution of scored activity.

## Decision drivers

- AC-19 / AC-29: attribution changes right away, In Review and Closed periods do not change
- Contexts talk through outbox events (SAD §2)
- AC-24: activity is never attributed by guess

## Considered options

1. **Match events from `integrations`, re-attribution in `contribution`** — write the match with a `JiraUserMatched` outbox event; Contribution Scoring re-attributes the Jira User's activity in its Open periods.
2. **Attribute inside `integrations` and republish all activity** — on every match, re-emit every affected IssuesImported/WorklogsImported with the Member id.
3. **Wait for the next Sync Run** — store the match and let the next run carry it.

## Decision outcome

**Chosen:** Option 1. One small event per match keeps the change immediate and auditable and keeps attribution next to scoring. Republishing all activity multiplies events for one click; waiting for a Sync Run breaks AC-19 after the Final Pass.

## Consequences

**Positive**
- Immediate attribution without a Sync Run
- Match history is an audit trail (PRD §6.1)

**Negative**
- Adds the `JiraUserMatched` event to `docs/bc-map.md`
- Contribution must know which periods are Open (it already consumes Bonus Period events)

**Neutral**
- Activity events carry the Jira account id, never a guessed Member

## Links

- PRD: [[../PRD.md]] US-06, US-08, AC-19, AC-24, AC-28, AC-29
- SAD: [[../sad.md]] §5
- Related ADR: [[0006-follow-bonus-period-state-through-bonus-review-events]]
