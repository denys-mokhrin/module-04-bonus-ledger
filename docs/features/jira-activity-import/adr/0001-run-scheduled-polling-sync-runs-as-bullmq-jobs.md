---
status: Accepted
owner: "Denys Mokhrin"
reviewers: ["Tech Lead"]
updated_at: "2026-11-24"
feature_size: M
stage: "04-05"
ticket: "<TBD>"
---

# 0001 — Run scheduled polling Sync Runs as BullMQ jobs

- **Status:** Accepted
- **Date:** 2026-11-24
- **Deciders:** Denys Mokhrin (Architect) with Claude during the architecture-design walk

## Context

PRD US-03 needs the open Bonus Period refreshed daily and finalised by a Final Pass after month end, with no manual trigger (PRD §3). The foundation already runs Jira sync as BullMQ jobs inside the one NestJS deployable (`docs/architecture-map.md` §Conventions, Jobs). We must decide how Sync Runs are triggered and where they run.

## Decision drivers

- Freshness: last successful Sync Run ≤ 26 h old for ≥ 99% of healthy Connections (PRD §6)
- Final Pass finished ≤ 12 h after month end, retried while the period is Open (PRD AC-12, CONTEXT Final Pass)
- One deployable, Redis is a queue only (SAD §2)
- ≤ 1% of Sync Runs fail because of throttling (PRD §6)

## Considered options

1. **Repeatable BullMQ job per Connection, polling Jira** — a daily job per Connection plus a Final Pass job with scheduled retries, in the same deployable.
2. **Jira webhooks plus a nightly polling safety net** — near-real-time changes pushed by Jira, polling only to repair gaps.
3. **In-process scheduler without a queue** — a timer in the NestJS app starts Sync Runs directly, without BullMQ.

## Decision outcome

**Chosen:** Option 1. It meets the daily freshness target with the infrastructure that already exists, keeps Jira load predictable (no manual sync, PRD §3) and makes the Final Pass retry a plain scheduled job. Webhooks add a public inbound endpoint and missed-delivery repair for no PRD gain; an in-process timer has no persisted retries or resumable jobs, so a crash during the Final Pass would be lost.

## Consequences

**Positive**
- No new infrastructure or public inbound endpoint
- Freshness and Final Pass timeliness are easy to measure from job timestamps

**Negative**
- Data is up to a day old; near-real-time needs a later webhook ADR
- A long Sync Run competes with HTTP handling in the same process

**Neutral**
- Moving the processors to a separate deployable later needs no data change

## Links

- PRD: [[../PRD.md]] US-03, AC-07, AC-12, §6
- SAD: [[../sad.md]] §4 (pillar 1), §6
- Related ADR: [[0003-select-changes-by-updated-cursor-and-content-hash]]
