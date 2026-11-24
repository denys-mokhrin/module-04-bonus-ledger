---
status: Living
updated_at: "2026-11-24"
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
- Bonus Period — one calendar month for one Team in the company's timezone, with states Open → In Review → Closed; owned by Bonus Review. NOT the Sync Run window: a Sync Run imports activity for a Bonus Period but never opens, moves or closes it.
- Connection — an authorised link between one Team and one Jira site that lets Bonus Ledger read that site. NOT a personal Jira account or login: a Connection belongs to the Team and survives when the person who created it leaves.
- Company — the customer organisation and tenant; every Team, Member and Connection belongs to exactly one Company (owned by Identity). NOT a Jira site: one Company may use any Jira site, but each Team connects only one.
- Contribution Scoring — the part of Bonus Ledger that turns imported activity into a Member's monthly Contribution Score; it consumes what this feature imports. NOT part of this feature: a Sync Run never scores.
- Final Pass — the last successful Sync Run for a Bonus Period, scheduled after the month ends in the company's timezone; if it fails, it is retried on schedule until it succeeds or the Bonus Period leaves Open. NOT a manual re-import: nobody can start it by hand, and no Sync Run for that period follows a successful Final Pass.
- Bonus Review — the part of Bonus Ledger that owns the Bonus Period, Justifications and HR approval. NOT this feature: the import reads the Bonus Period state but never changes it.
- HR Reviewer — a person in the company who approves Justifications; reads import health but never changes a Connection. NOT a Team Lead: an HR Reviewer has no Team of their own to connect.
- Import Alert — a message to the Team Lead about one specific import problem that needs their action (access lost, story-point field not found, unmatched Jira user, project with no activity). NOT a log entry: an Import Alert stays open until the problem is gone.
- Import Health — the per-Team summary of the import: the last successful Sync Run, the open Import Alerts and the activity found per Jira project. NOT a score of the Team's work: it describes the data, not the people.
- Imported Issue — a snapshot of a Jira issue as it was at import time, with key, type, story points, assignee and status history. NOT the live Jira issue: later changes in Jira reach it only through the next Sync Run.
- Justification — the formal text that explains a Member's bonus with evidence links, approved by an HR Reviewer (owned by Bonus Review). NOT imported activity: a Justification cites it.
- Jira Project — a project on the connected Jira site that the Team Lead picked for import; a Team can have several. NOT the Team: projects are a source of activity, the Team is who is scored.
- Jira Site — one Jira Cloud instance of a company, reached through a Connection. NOT a Jira Project: a site holds many projects.
- Jira User — a person's account on the connected Jira site, as Jira identifies it. NOT a Member: a Jira User counts for a bonus only after it is matched to a Member of the Team.
- Member — a person in a Team whose contribution is scored, with a role (Dev, QA, Lead, PM). NOT a Jira User: one Member is matched to one Jira User of the connected site.
- Story-Point Field — the Jira field a Jira Project uses for story-point estimates; it can differ between projects. NOT Weighted Effort: story points are imported as Jira has them and only Contribution Scoring weighs them.
- Subscription — the Company's paid plan (owned by Billing); when it is suspended, Sync Runs stop. NOT a Connection: losing the subscription pauses the import without touching Jira access.
- Sync Run — one import pass over a Connection for a period; it is idempotent and resumable. NOT a scoring run: a Sync Run only copies activity and never calculates a Contribution Score.
- Team — a group of Members with one Team Lead, mapped to one or more Jira projects of one Jira site. NOT a Jira project: one Team can cover several projects.
- Team Baseline — the Team's typical monthly activity over past Bonus Periods, used by Contribution Scoring. NOT history imported by this feature: without backfill it stays empty for the first months.
- Team Lead — the person who leads a Team, owns its Connection and fixes its Import Alerts. NOT the Jira site administrator: the Team Lead only needs read access to the Team's projects.
- Worklog — time a Member logged on an issue in Jira, imported as is. NOT Capacity, which is the available working days of a Member in a sprint.
