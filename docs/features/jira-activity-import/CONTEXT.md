---
status: Living
updated_at: "2026-11-11"
---

# Domain Context — jira-activity-import

<!--
CONTEXT.md is the domain glossary — not a PRD and not a scratch pad. NO implementation
detail here (no datastore/broker/framework names, no API contracts) — only domain words
and the boundaries between them. Implementation choices live in the SAD and ADRs;
behaviour lives in PRD.md.

Multi-context repos: each bounded context has its own CONTEXT.md at its root path
(registered in CONTEXT-MAP.md). System-wide terms that span all contexts live in the
repo-root CONTEXT.md. Never duplicate a term across files — pick one owner.

Terms get fixed inline, the moment they surface in an interview / PRD / review — never
batched «I'll consolidate later». Empty H2 → prune before commit; keep only the sections
that carry real content. ## Glossary is mandatory; the other two are optional.
-->

## Glossary

<!-- One line per term: name · one-sentence canonical definition · one-sentence boundary
     (what it is NOT / the concept it gets confused with). Alphabetical once there are a few. -->
- Connection — an authorised link between one Team and one Jira site that lets Bonus Ledger read that site. NOT a personal Jira account or login: a Connection belongs to the Team and survives when the person who created it leaves.
- Imported Issue — a snapshot of a Jira issue as it was at import time, with key, type, story points, assignee and status history. NOT the live Jira issue: later changes in Jira reach it only through the next Sync Run.
- Sync Run — one import pass over a Connection for a period; it is idempotent and resumable. NOT a scoring run: a Sync Run only copies activity and never calculates a Contribution Score.
- Worklog — time a Member logged on an issue in Jira, imported as is. NOT Capacity, which is the available working days of a Member in a sprint.
