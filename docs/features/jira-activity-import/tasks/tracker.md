# Tracker — jira-activity-import

| ID | Title | Layer | Deps | ACs | Owner | Est. | Status |
|---|---|---|---|---|---|---|---|
| T1 | [Add JiraUserMatched, BonusPeriodReviewStarted and SubscriptionActivated→integrations to the bc-map and public event types](./t1-bc-map-events.md) | docs | — | AC-11, AC-19, AC-26 | Denys Mokhrin | S | todo |
| T2 | [Promote staged migrations for connections, projects, period states and checkpoints](./t2-migrate-connections.md) | migration | — | AC-01, AC-04, AC-05, AC-06 | Denys Mokhrin | S | todo |
| T3 | [Promote staged migrations for sync runs, imported issues, worklogs, Jira users, alerts and processed events](./t3-migrate-activity.md) | migration | T2 | AC-07, AC-08, AC-09, AC-13, AC-19, AC-25 | Denys Mokhrin | S | todo |
| T4 | [Build the Jira ACL: OAuth 3LO client, REST client with retry-hint back-off, issue/Worklog mapper](./t4-jira-acl-client.md) | infra | — | AC-09, AC-15, AC-17 | Denys Mokhrin | L | todo |
| T5 | [Implement Connection and Jira Project use cases with authorization and domain errors](./t5-connection-service.md) | app | T2, T4 | AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-16 | Denys Mokhrin | M | todo |
| T6 | [Expose Connection, authorization, re-authorisation and project endpoints](./t6-connection-endpoints.md) | ports | T5 | AC-01, AC-02, AC-03, AC-04, AC-06, AC-16 | Denys Mokhrin | M | todo |
| T7 | [Follow Bonus Period and subscription state from events](./t7-period-state-listener.md) | app | T1, T2 | AC-11, AC-22, AC-26 | Denys Mokhrin | S | todo |
| T8 | [Implement the daily Sync Run: cursor, content hash, versioned upsert, outbox events](./t8-daily-sync-run.md) | app | T3, T4, T7 | AC-07, AC-08, AC-09, AC-10, AC-15 | Denys Mokhrin | L | todo |
| T9 | [Detect deletions and scope exits by period reconciliation and publish withdrawals](./t9-reconciliation.md) | app | T8 | AC-27 | Denys Mokhrin | M | todo |
| T10 | [Schedule the Final Pass with retries while the period is Open](./t10-final-pass.md) | app | T8 | AC-12, AC-23, AC-26 | Denys Mokhrin | M | todo |
| T11 | [Raise and close Import Alerts for access, missing field, unmatched users and quiet projects](./t11-import-alerts.md) | app | T8 | AC-15, AC-17, AC-18, AC-25 | Denys Mokhrin | M | todo |
| T12 | [Expose Import Health for the Team Lead and HR Reviewers](./t12-import-health-endpoint.md) | ports | T10, T11 | AC-13, AC-14, AC-23 | Denys Mokhrin | M | todo |
| T13 | [Implement Jira User match, unmatch and not-on-this-Team with audit and events](./t13-jira-user-matching.md) | app | T3, T1 | AC-19, AC-20, AC-21, AC-24, AC-28, AC-29 | Denys Mokhrin | M | todo |
| T14 | [Expose Jira User list and matching endpoints](./t14-jira-user-endpoints.md) | ports | T13 | AC-19, AC-20, AC-21, AC-28, AC-29 | Denys Mokhrin | M | todo |
| T15 | [Wire the integrations module, BullMQ schedules and metrics](./t15-wiring-and-schedules.md) | wiring | T6, T9, T10, T12, T14 | AC-07, AC-12 | Denys Mokhrin | S | todo |
| T16 | [Consume activity, withdrawals and JiraUserMatched in contribution (separate context work)](./t16-contribution-attribution.md) | app | T1, T8, T13 | AC-10, AC-24, AC-27 | Contribution owner (TBD) | M | todo |

AC coverage: 29/29 PRD §5 ACs covered by ≥1 task.
