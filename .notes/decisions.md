# Decisions

## 2026-11-06 — Idempotent Jira import in `integrations`

Status of every entry below: proposed in discussion; the user has not confirmed any of them yet. The repository has no code yet, only docs and READMEs.

### 1. Import data: upsert by natural key

- Decision: `Imported Issue` is updated with an upsert by key (`connectionId` + Jira issue key), not deleted and re-inserted. Older data never overwrites newer data (compare `jiraUpdatedAt`), and `contentHash` skips changes that do not affect the data. A closed `Bonus Period` is read-only for sync (this rule is not in the plan yet).
- Why: delete+insert does not solve duplicate events, loses row identity (other contexts refer to rows by id), contradicts the "resumable" requirement in `docs/bc-map.md`, and can erase the snapshot of an issue updated later inside an already approved period.
- Rejected: deleting and re-inserting all issues of the window. It is simpler and detects deletions in Jira by itself, but has the problems above. Not rejected for good: with small volumes it could work (data volume is unknown).

### 2. Events: transactional outbox and deterministic `eventId`

- Decision: the upsert and the outbox write happen in one transaction. `eventId` is derived from the connection, window, event type and batch hash; it is UNIQUE in the outbox (`ON CONFLICT DO NOTHING`). Consumers (`contribution`) also deduplicate by `eventId`.
- Why: `.claude/rules/integrations.md` requires that re-running a sync for the same window publishes no duplicate events. Consumers deduplicate because delivery is at-least-once.
- Rejected: no separate alternatives were discussed (only delete+insert, see item 1, which does not solve the event problem).

### 3. Sync cursor on `updated`

- Decision: a JQL cursor on the `updated` field within the window (month `YYYY-MM` in the company's timezone, converted to UTC), with a margin at the boundary (cursor minus a few minutes) and a cursor checkpoint for resuming. Whether an issue belongs to a `Bonus Period` must be decided separately, not via `updated`. Open question: the membership rule is not defined.
- Why: `updated` catches changes to existing issues (story points, status); `created` and the issue number do not see them. The boundary margin is needed because JQL precision is one minute (from memory, not checked in the Atlassian docs).
- Rejected: `created` (misses changes to old issues) and the issue number (misses edits, the key changes on move, there are gaps).

### 4. Stable issue identifier

- Decision: `jiraIssueId` proposed as the primary key and `issueKey` as secondary. The user has not answered yet (the project rule says "issue key + window").
- Why: Jira changes the key when an issue moves between projects, so a moved issue would become a duplicate.
- Rejected: `issueKey` only, as the project rule says, because of the duplicate risk on moves.

### 5. Detecting deletions in Jira

- Decision: detect deletions separately (the deleted-worklogs API and a periodic id reconciliation), not by an issue missing from the window. Jira API details are not checked in the docs.
- Why: earlier in the same discussion a "mark and sweep" hybrid was proposed, but it is wrong: an issue updated later does not fall into the previous month's window, and the sweep would delete it by mistake.
- Rejected: the hybrid "upsert with `lastSeenRunId` and sweep rows not seen in the run" (reason above). Delete+insert was also considered and detects deletions by itself, but was rejected for other reasons (item 1).
