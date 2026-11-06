# Jira Integration

**Why it exists.** It is the anti-corruption layer around Jira Cloud. Jira's model (custom fields, statuses, issue keys that change) must not leak into scoring or review, so this context owns connections, sync runs and snapshots, and translates Jira's data into the product's language. No Jira field name leaves this folder.

**Glossary** (from `docs/bc-map.md`):
- **Connection**: an authorised link to a Jira site, stored with an encrypted token.
- **Sync Run**: one import pass; it is idempotent and resumable.
- **Imported Issue**: a snapshot of a Jira issue (key, type, `storyPoints`, assignee, status history).
- **Sprint Snapshot**: the frozen scope and capacity of a closed sprint.

**Events**
- Publishes: `JiraConnected`, `IssuesImported`, `WorklogsImported`, `SprintClosed` (the last three → Contribution Scoring)
- Listens to: `BonusPeriodOpened` (schedules a sync for the period), `SubscriptionSuspended` (stops syncing)

**Public facade:** `public/`: event types only.
**Schema:** `integrations`. Layout: one folder per provider (`jira/`: client / mapper / sync service; the mapper is the ACL); Prisma client in `db/`.
