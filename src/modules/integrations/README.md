# Jira Integration

The anti-corruption layer around Jira Cloud. It owns connections (encrypted tokens), sync runs and snapshots of imported issues, worklogs and sprints. It translates Jira's model into the product's language. No Jira field name leaves this folder.

- Publishes: `JiraConnected`, `IssuesImported`, `WorklogsImported`, `SprintClosed`
- Listens to: `BonusPeriodOpened` (schedules a sync for the period), `SubscriptionSuspended` (stops syncing)
- Public facade: `public/` — event types only
- Schema: `integrations`
