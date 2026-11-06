# Bounded Contexts Map — Bonus Ledger

## 1. Event Storming lite: 12 key events

| # | Event | Happens when |
|---|---|---|
| 1 | `CompanyRegistered` | A company owner signs up and creates a workspace |
| 2 | `TeamMemberInvited` | A team lead invites a member or an HR reviewer |
| 3 | `JiraConnected` | A team lead authorises the Jira integration for a project |
| 4 | `IssuesImported` | A sync pulls issues, story points and assignees from Jira |
| 5 | `WorklogsImported` | A sync pulls logged time from Jira |
| 6 | `SprintClosed` | A Jira sprint is closed and its final scope is frozen |
| 7 | `ContributionScored` | A member's monthly contribution score is calculated |
| 8 | `BonusPeriodOpened` | A new monthly bonus period starts for a team |
| 9 | `JustificationDrafted` | A bonus justification draft is generated for a member |
| 10 | `JustificationApproved` | HR approves the team lead's justification |
| 11 | `BonusPeriodClosed` | All justifications in a period are approved and the period is locked |
| 12 | `PaymentFailed` | The monthly subscription charge for a company fails |

Supporting events used in the map: `SubscriptionActivated`, `SubscriptionSuspended`.

## 2. Bounded Contexts and ubiquitous language

Five groups of events give five contexts.

### Identity & Teams (`identity`)
Events: `CompanyRegistered`, `TeamMemberInvited`.
- **Company**: the paying tenant; every record belongs to one company.
- **Team**: a group of members with one team lead, mapped to one or more Jira projects.
- **Member**: a person whose contribution is scored; has a role (Dev, QA, Lead, PM).
- **Reviewer**: an HR user who approves justifications; is not scored.

### Jira Integration (`integrations`)
Events: `JiraConnected`, `IssuesImported`, `WorklogsImported`, `SprintClosed`.
- **Connection**: an authorised link to a Jira site, stored with an encrypted token.
- **Sync Run**: one import pass; it is idempotent and resumable.
- **Imported Issue**: a snapshot of a Jira issue (key, type, story points, assignee, status history).
- **Sprint Snapshot**: the frozen scope and capacity of a closed sprint.

### Contribution Scoring (`contribution`)
Events: `ContributionScored`.
- **Contribution Score**: a member's weighted result for a month (0–100).
- **Weighting Policy**: the rules that turn story points, issue type and role into **Weighted Effort**.
- **Weighted Effort**: the intermediate per-issue value the policy produces; it is never called "points" (see section 5).
- **Capacity**: a member's available working days in the sprint, adjusted for absences.
- **Team Baseline**: the team median used for relative comparison and the trend over previous months.

### Bonus Review (`bonus_review`)
Events: `BonusPeriodOpened`, `JustificationDrafted`, `JustificationApproved`, `BonusPeriodClosed`.
- **Bonus Period**: one calendar month for one team, with states Open → In Review → Closed.
- **Justification**: the formal text that explains a member's bonus, with evidence links.
- **Recommendation**: the suggested bonus tier (None / Standard / High / Exceptional).
- **Approval**: HR's sign-off on one justification; it cannot be changed after the period is closed.

### Billing (`billing`)
Events: `SubscriptionActivated`, `PaymentFailed`, `SubscriptionSuspended`.
- **Plan**: the price per team per month.
- **Subscription**: the company's active plan and billing cycle.
- **Invoice**: the monthly charge; it is paid, failed or void.
- **Grace Period**: the days after `PaymentFailed` before features are suspended.

## 3. BC Map

Each arrow means "listens to": the context at the arrow's head reacts to the event named on the arrow.

```mermaid
flowchart LR
    ID["Identity & Teams"]
    INT["Jira Integration"]
    CON["Contribution Scoring"]
    REV["Bonus Review"]
    BIL["Billing"]

    ID -- "CompanyRegistered" --> BIL
    ID -- "TeamMemberInvited" --> CON
    INT -- "IssuesImported" --> CON
    INT -- "WorklogsImported" --> CON
    INT -- "SprintClosed" --> CON
    CON -- "ContributionScored" --> REV
    REV -- "BonusPeriodOpened" --> INT
    BIL -- "SubscriptionSuspended" --> INT
    BIL -- "SubscriptionSuspended" --> REV
```

Relationships:
- **Jira Integration** is an Anti-Corruption Layer: Jira's model (custom fields, statuses) never leaks past it. Other contexts see only the published events.
- **Contribution Scoring** is the core domain: it holds the weighting rules, which are what makes the product different.
- **Billing** is generic and can later be replaced by Stripe Billing behind the same events.

## 4. Structure level

**Chosen: feature-first (modular monolith)**, with one module per context in `src/modules/<context>/`.

Why: there is one developer, five contexts and about 15 core entities. That is too many for **flat** (the folders would mix scoring rules with Jira mapping and billing). **Hexagonal** in every context would mean a lot of ports and adapters for CRUD-heavy contexts like Identity and Billing. Feature-first keeps the boundaries visible and enforceable through `public/` facades.

Inside each module (one developer changes all of them today):

| Context | Entities | Inner structure now | Why |
|---|---|---|---|
| `identity` | 4 (Company, Team, Member, Reviewer) | one folder: handler / service / repo | plain CRUD plus invitations; layers would be empty ceremony |
| `integrations` | 4 (Connection, Sync Run, Imported Issue, Sprint Snapshot) | one subfolder per provider (`jira/`) with client / mapper / sync service | the complexity is in talking to Jira, not in domain rules; the mapper is the anti-corruption layer |
| `contribution` | 4 + versioned policies | domain / app / infra | core domain: pure scoring rules that must be unit-tested without a database, and the part that will change most |
| `bonus_review` | 4 (Bonus Period, Justification, Recommendation, Approval) | one folder: handler / service / repo | a small state machine; becomes domain / app / infra only if approval rules grow |
| `billing` | 4 (Plan, Subscription, Invoice, Grace Period) | one folder: handler / service / repo, Stripe behind one adapter | generic subdomain, may be replaced by Stripe Billing entirely |

First context to give a full domain / app / infra structure: **Contribution Scoring**. It holds the rules that make the product different, it needs fast tests without Postgres, and it is the only one where a wrong rule silently changes people's bonuses.

## 5. Polysemy: "points"

The word "points" means two different things:
- **Jira Integration**: `Imported Issue.storyPoints`, the estimate a team put on an issue in Jira (fields next to it: `issueKey`, `issueType`, `assignee`, `statusHistory`). It is Jira's number and is copied as is.
- **Contribution Scoring**: the old wording "the rules turn story points, issue type and role into points" meant the weighted result of the policy (fields next to it: `role`, `issueType`, `capacity`, `policyVersion`), which is our number and feeds the 0-100 `Contribution Score`.

Decision: rename, not split. The Jira meaning keeps the name `storyPoints` and lives only in `integrations` and in the events it publishes. The scoring meaning is renamed to **Weighted Effort**. "Points" on its own is not a domain term anywhere (CLAUDE.md already forbids `Points` as a name for the score).

## 6. Event without a home

`MemberAbsenceRecorded` (a member was on vacation or sick for some days). **Capacity** in Contribution Scoring is "adjusted for absences", so the event matters, but no context owns it: Jira has no absences, Identity knows who a member is but not their calendar, and it is not decided whether absences come from an HR system integration, from a calendar, or are entered by the team lead. Until that is decided, the event stays unassigned and Capacity uses working days only.
