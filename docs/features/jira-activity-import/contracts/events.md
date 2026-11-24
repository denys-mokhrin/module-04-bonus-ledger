# Events — jira-activity-import

Async contract of the `integrations` context for this feature. Delivery: transactional outbox → BullMQ relay → in-process bus, at-least-once; every consumer deduplicates by `eventId` (`docs/architecture-map.md` §Conventions). Event names come from `docs/bc-map.md`; `JiraUserMatched` and `BonusPeriodReviewStarted` must be added there first (SAD §11, ADR 0005, ADR 0006).

## Published by integrations

| Event | Payload | Producer step | Consumers | Retry / dead-letter |
|---|---|---|---|---|
| `JiraConnected` | `eventId`, `companyId`, `teamId`, `connectionId`, `jiraSiteUrl`, `occurredAt` | Connect the Team's Jira Site | contribution (none yet, informational) | relay retries 5× with back-off, then dead-letter |
| `IssuesImported` | `eventId` = hash(connectionId, jiraIssueId, version), `connectionId`, `teamId`, `period`, `items[]`: `jiraIssueId`, `issueKey`, `issueType`, `storyPoints \| null`, `assigneeAccountId \| null`, `resolvedAt \| null`, `statusHistory`, `withdrawn` (AC-27) | Scheduled daily Sync Run, Final Pass, Change the Team's Jira Projects | contribution | same |
| `WorklogsImported` | `eventId` = hash(connectionId, jiraWorklogId, version), `connectionId`, `teamId`, `period`, `items[]`: `jiraWorklogId`, `jiraIssueId`, `authorAccountId`, `workDate`, `durationSeconds`, `withdrawn` | Scheduled daily Sync Run, Final Pass, Change the Team's Jira Projects | contribution | same |
| `JiraUserMatched` | `eventId`, `connectionId`, `teamId`, `jiraAccountId`, `memberId \| null`, `notOnTeam`, `actorMemberId`, `occurredAt` | Match Jira Users to Members | contribution (re-attributes Open periods only) | same |

Activity events carry the Jira account id, never a guessed Member (AC-24).

## Consumed by integrations

| Event | Producer | Effect | Idempotency |
|---|---|---|---|
| `BonusPeriodOpened`, `BonusPeriodReviewStarted`, `BonusPeriodClosed` | bonus-review | update `bonus_period_states`; cancel pending runs of a period that left Open | `processed_events` by `eventId` |
| `SubscriptionSuspended`, `SubscriptionActivated` | billing | pause or resume Sync Runs of the Company (AC-11) | `processed_events` by `eventId` |

Consumer retry: 5 attempts with exponential back-off, then dead-letter with an operational alert.
