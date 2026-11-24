---
status: Approved
owner: "Denys Mokhrin"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-11-24"
feature_size: "M"
stage: "03"
ticket: "<TBD>"
---

# PRD — jira-activity-import

> **Inputs (required):** [idea-brief](./idea-brief.md) · [CONTEXT](./CONTEXT.md)
> **Reference module:** `src/modules/identity` (branch `feature-3/identity-reviewer`: `members/`, `teams/`, `reviewers/`) — code patterns used: typed domain errors with a stable code per rule, "not found or another company looks the same to the caller", trimmed names unique per Team, Clock-injected timestamps.
> **External context channels used:** architecture-map: `docs/architecture-map.md`; project docs: `docs/bc-map.md`, `.notes/decisions.md`, `.claude/rules/integrations.md`, `.claude/rules/integrations-jira.md`.

## 1. Context

Every later step of Bonus Ledger — Contribution Score, Justification, HR approval — needs the Team's Jira activity for the month, and today nothing brings it in. Without an import the product produces no value at all. The primary user is the Team Lead of a team that works in one Jira Cloud site, often across several Jira projects; the HR Reviewer depends on the import being complete when approving a Justification, and each Member's bonus depends on their work being imported. How much manual effort Team Leads spend today is a hypothesis, not a measurement: the product is pre-launch.

The feature blocks the whole MVP: scoring, justification drafts and HR review all consume imported activity, and SPEC goal 1 ("a team lead connects a Jira project and gets every member's monthly contribution score") starts here. There is no external deadline.

Committed approach (idea-brief §13, Approach C — scheduled import with health signal): the Team Lead connects the Team's Jira site once and picks its projects; activity is imported daily during the open Bonus Period plus a Final Pass after month end; the Team Lead sees a per-Team Import Health and receives Import Alerts for access loss, a missing story-point field, unmatched Jira Users and projects with no activity; imported data is frozen once the Bonus Period is closed.

Traceability: the existing system already separates contexts (Jira Integration owns Connections, Sync Runs and Imported Issues; Bonus Review owns the Bonus Period; Contribution Scoring consumes imported activity) and requires that a re-run of the same import window publishes no duplicate activity (`.claude/rules/integrations.md`). Import design proposals in `.notes/decisions.md` (stable issue identity, change detection, deletion detection) are not confirmed and are left to architecture-design. The reference module contributes the "unknown or another company's — same answer" pattern used in the authorization criteria.

Critic amendments accepted (sdlc:critic, 2026-11-24): a failed Final Pass is retried on schedule until it succeeds or the Bonus Period leaves Open (AC-12, AC-16, AC-23); the no-activity alert is raised by daily Sync Runs, not only at the Final Pass (AC-18); added AC-25 (unmatched Jira User alert) and AC-26 (no change while In Review); glossary extended with the neighbouring-context terms.

## 2. Goals

- A Team Lead connects the Team's Jira site once and, from then on, the open Bonus Period has its Jira activity without anyone copying it by hand.
- Import problems reach the Team Lead while the Bonus Period is still open and fixable, instead of surfacing on review day.
- Contribution Scoring and HR review work from one complete, final set of activity per Bonus Period that does not change after the period is closed.

## 3. Non-goals

- A manual "sync now" or re-import action — the import is scheduled only, so the zero-manual-steps outcome stays honest and Jira load stays predictable.
- Backfill of months before the Connection existed — the Team Baseline and trend stay empty for the first months; history import is a separate feature.
- Sprint import and sprint-based Capacity — Capacity falls back to working days until a follow-up feature.
- Jira sites other than Jira Cloud, or more than one Jira site per Team — the target segment works in one Jira Cloud site.
- Scoring, justification text and absences — this feature only copies activity; it never calculates or explains a bonus.
- Building the event-delivery groundwork between contexts (scaffold task S9) — it is a prerequisite, not part of this feature.
- Correcting imported activity by hand in Bonus Ledger — Jira stays the only source of truth, so a wrong number is fixed in Jira and reaches the product through the next Sync Run (added after US-07 was edited, see edits-log).

## 4. User stories

### US-01: Connect the team's Jira site

**As a** Team Lead
**I want** to authorise read access to the Team's Jira Cloud site once and pick the Jira projects the Team works in
**So that** the Team's activity can be imported without me copying it

### US-02: Change the team's Jira projects

**As a** Team Lead
**I want** to add or remove Jira projects of the connected site while the Bonus Period is open
**So that** the import follows the Team when it starts or stops working in a project

### US-03: Import activity daily without action

**As a** Team Lead
**I want** Imported Issues and Worklogs of the open Bonus Period refreshed every day and finalised by a Final Pass after month end
**So that** the monthly bonus review starts from complete data with zero manual steps

### US-04: See the team's import health

**As a** Team Lead
**I want** to see the Team's Import Health — when the last successful Sync Run finished, which Import Alerts are open and how much activity each project returned
**So that** I know the data is complete before the bonus review

### US-05: Get alerted about import problems

**As a** Team Lead
**I want** an Import Alert when Jira access is lost, the story-point field is not found, Jira Users are not matched to Members, or a project returned no activity
**So that** I fix the problem while the Bonus Period is still open

### US-06: Match Jira users to members

**As a** Team Lead
**I want** to match each unmatched Jira User to a Member of the Team
**So that** every Member's work counts for their bonus

### US-07: Review frozen, final activity

**As an** HR Reviewer
**I want** the activity of a Bonus Period to be final after the Final Pass and frozen once the period is Closed, and to see whether the Final Pass succeeded
**So that** I approve Justifications against data that will not change underneath me

### US-08: Have my Jira work counted

**As a** Member
**I want** work logged and done under my Jira User attributed to me once I am matched
**So that** my bonus reflects the work I actually did

## 5. Acceptance criteria

### AC-01 (US-01) — happy path

**Given** a Team Lead whose Team has no Connection
**When** the Team Lead authorises read access to the Team's Jira Cloud site and picks two Jira projects
**Then** the system records a Connection that belongs to the Team, shows the connected site and the two projects, and schedules the first Sync Run for the open Bonus Period

### AC-02 (US-01) — error

**Given** a Team Lead who has authorised access to a Jira site
**When** the Team Lead tries to finish the connection without picking any Jira project
**Then** the system does not create the Connection and tells the Team Lead that at least one project must be picked

### AC-03 (US-01) — authorization

**Given** a Team Lead of another Team, or a Member, in the same company
**When** that person tries to view or change this Team's Connection
**Then** the system denies the action and answers exactly as if the Connection did not exist, so its existence and its site are not revealed

### AC-04 (US-01) — domain invariant

**Given** a Team that already has a Connection
**When** the Team Lead tries to connect a second Jira site
**Then** the system blocks it and explains that a Team can have only one Jira site, pointing to the existing Connection

### AC-05 (US-02) — happy path

**Given** a Team with a Connection and an open Bonus Period
**When** the Team Lead adds a project of the connected site to the Team
**Then** the next daily Sync Run imports that project's activity for the whole open Bonus Period, not only from the day it was added

### AC-06 (US-02) — domain invariant

**Given** a Team whose Connection covers exactly one Jira project
**When** the Team Lead tries to remove that last project
**Then** the system blocks it and explains that a Connection must cover at least one project

### AC-07 (US-03) — happy path

**Given** a Team with a healthy Connection and an open Bonus Period
**When** the daily Sync Run finishes
**Then** the Imported Issues and Worklogs of the Team's projects reflect Jira as of that run, and Import Health shows the time of this successful Sync Run

### AC-08 (US-03) — domain invariant

**Given** a Sync Run already imported a Bonus Period and nothing changed in Jira since
**When** the same period is imported again
**Then** no Imported Issue or Worklog is duplicated and no activity is reported twice to other parts of the product

### AC-09 (US-03) — domain invariant

**Given** an Imported Issue in one of the Team's projects
**When** the issue is moved in Jira to another project of the same Team
**Then** after the next Sync Run it still counts as one Imported Issue with its activity, not as a new issue

### AC-10 (US-03) — cross-context

**Given** a daily Sync Run imported new or changed activity for an open Bonus Period
**When** the Sync Run finishes
**Then** Contribution Scoring receives that activity for that Bonus Period, each change exactly once

### AC-11 (US-03) — cross-context

**Given** a Company whose subscription is suspended
**When** the next daily Sync Run is due for any of its Teams
**Then** no Sync Run starts, and Import Health shows that the import is paused because of the subscription

### AC-12 (US-03) — happy path

**Given** a Bonus Period whose month has ended in the company's timezone
**When** the Final Pass runs
**Then** it imports the period's activity one last time, including Worklogs logged late for days inside the month, and Import Health shows when the Final Pass finished; if it fails, it is retried on schedule while the Bonus Period is Open

### AC-13 (US-04) — happy path

**Given** a Team with a Connection
**When** the Team Lead opens the Team's Import Health
**Then** the Team Lead sees the time of the last successful Sync Run, every open Import Alert, and the number of Imported Issues and Worklogs per project for the open Bonus Period

### AC-14 (US-04) — authorization

**Given** an HR Reviewer of the same company
**When** the HR Reviewer opens a Team's Import Health
**Then** the HR Reviewer can read it but cannot change the Connection, its projects or Jira User matches

### AC-15 (US-05) — error

**Given** a Team whose Connection lost access to Jira (revoked authorisation or the connecting account lost its rights)
**When** the daily Sync Run tries to import
**Then** the Sync Run fails without removing any activity already imported, and the Team Lead gets an Import Alert that access is lost and the Team must reconnect

### AC-16 (US-05) — happy path

**Given** a Connection that lost access during the open Bonus Period
**When** the Team Lead restores access before the Bonus Period leaves Open
**Then** the next scheduled Sync Run (a daily Sync Run, or the Final Pass retry if the month has already ended) imports the whole Bonus Period again, the access-lost Import Alert closes, and no month of activity is lost

### AC-17 (US-05) — error

**Given** a Team project in which the story-point field cannot be found
**When** a Sync Run imports that project
**Then** its issues are imported without story points and the Team Lead gets an Import Alert naming the project and the missing field

### AC-18 (US-05) — domain invariant

**Given** a Team project that has returned no issues and no Worklogs for the open Bonus Period for 7 days in a row
**When** the next daily Sync Run or the Final Pass finishes
**Then** the Team Lead gets an Import Alert naming the project while the Bonus Period is still Open, so a project the Connection cannot see is not mistaken for a quiet month

### AC-19 (US-06) — happy path

**Given** a Sync Run found activity of a Jira User who is not matched to any Member
**When** the Team Lead matches that Jira User to a Member of the Team
**Then** that Jira User's activity in the open Bonus Period is attributed to the Member from the next Sync Run, and the unmatched-user Import Alert closes

### AC-20 (US-06) — authorization

**Given** a Team Lead matching an unmatched Jira User
**When** the Team Lead tries to match it to a Member of another Team or another company
**Then** the system blocks the match and answers as if that Member did not exist

### AC-21 (US-06) — domain invariant

**Given** a Member already matched to one Jira User
**When** the Team Lead tries to match a second Jira User to the same Member
**Then** the system blocks it and explains that one Member is matched to one Jira User

### AC-22 (US-07) — cross-context

**Given** a Bonus Period that Bonus Review has Closed
**When** issues or Worklogs of that month change in Jira afterwards
**Then** no Sync Run changes the activity of the Closed period, and the HR Reviewer sees exactly the activity that existed when it was Closed

### AC-23 (US-07) — error

**Given** a Bonus Period whose Final Pass failed and had not succeeded on retry before the period left Open
**When** the HR Reviewer opens the Team's Import Health for that period
**Then** the HR Reviewer sees that the Final Pass did not succeed and when the last successful Sync Run finished

### AC-24 (US-08) — cross-context

**Given** activity in the open Bonus Period by a Jira User who is not matched to any Member
**When** Sync Runs import it
**Then** the activity is kept and not attributed to any Member until the Team Lead matches the Jira User, and it is never attributed to a Member by guess

### AC-25 (US-05) — error

**Given** a daily Sync Run found activity of a Jira User who is not matched to any Member of the Team
**When** the Sync Run finishes
**Then** the Team Lead gets an Import Alert naming that Jira User and how much activity is waiting, and the alert stays open until the Jira User is matched

### AC-26 (US-07) — domain invariant

**Given** a Bonus Period whose Final Pass succeeded and which Bonus Review has moved to In Review
**When** issues or Worklogs of that month change in Jira
**Then** no Sync Run changes the period's activity, and the HR Reviewer sees exactly the activity of the successful Final Pass

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Freshness of the open Bonus Period | last successful Sync Run ≤ 26 h old for ≥ 99% of healthy Connections | age of the last successful Sync Run per Connection, checked hourly |
| Final Pass timeliness | finished ≤ 12 h after month end (company timezone) for ≥ 99% of Connections | Final Pass finish time vs month end, per Bonus Period |
| Sync Run duration | p95 ≤ 15 min for a Connection with ≤ 5,000 issues changed in the window | Sync Run start/finish times |
| Import Alert delay | an Import Alert is visible ≤ 15 min after the Sync Run that detected the problem | alert creation time vs Sync Run finish time |
| Import Health view latency | p95 ≤ 300 ms | request latency for the Import Health view |
| Idempotency | 0 duplicated Imported Issues, Worklogs or reported changes across repeated imports of the same window | automated re-run test in CI on recorded fixtures |
| Jira throttling | ≤ 1% of Sync Runs fail because the provider limited requests | Sync Run failure reasons, monthly |

## 6.1 Security / privacy

- **Data classification:** confidential — per-person work activity is used to decide bonuses and must not leak between Teams or companies.
- **Personal data touched:** Jira User account identifier and display name (internal), email address when Jira exposes it (personal), Worklog author, date and duration (personal, bonus-relevant), issue assignee history (internal). Raw issue comments are not imported.
- **AuthZ/AuthN impact:** new capabilities — manage the Team's Connection and projects (Team Lead of that Team only), match Jira Users to Members (Team Lead of that Team only), read Import Health (that Team Lead and HR Reviewers of the same company). The Jira access credential is never shown back to anyone after connecting and is stored encrypted.
- **Abuse cases:**
  - Cross-tenant access to another company's Connection or Import Health: denied with the same answer as "does not exist", so nothing about the other company is revealed.
  - Credential leak: the stored Jira credential is never returned, logged or included in alerts; access is read-only and limited to what import needs.
  - Over-broad access to a customer's Jira: only the picked projects are imported; asking for write access is not allowed.
  - Mis-attribution by matching a Jira User to the wrong Team's Member: blocked across Teams; every match and unmatch is recorded with who did it and when.
  - Spam connection attempts: at most 10 connection attempts per Team Lead per hour.
- **Security review:** Required — new external credential, new personal data (Worklogs, Jira identities) and a new authorization boundary per Team.

## 7. Metrics / KPIs

- **Bonus Periods imported with zero manual action** — baseline: 0% (no import exists), target: ≥ 90% of Bonus Periods of connected Teams within 3 months of the first pilot.
- **Time from connecting to first successful Sync Run** — baseline: 0 (new), target: ≤ 24 h for ≥ 95% of new Connections within the first month.
- **Activity attributed to Members at Final Pass** — baseline: 0 (new), target: ≥ 98% of imported Worklog time attributed to a Member at the Final Pass, within 2 months.
- **Access-lost Import Alerts still open at month end** — baseline: 0 (new), target: ≤ 5% of Connections per month, measured over the first quarter.
- **Justifications returned by HR for data reasons** — baseline: TBD (Bonus Review does not exist yet); measurement plan: Bonus Review records a return reason, counted monthly from the first reviewed period; target: ≤ 5% within 3 months.

## 8. Open questions

- [ ] Which Bonus Period does an issue's activity belong to when it spans months (Worklogs by the day they cover; story points by the day the issue was resolved)? Default now: Worklogs by the date they cover, story points by the resolution date in the company's timezone. — owner: Tech Lead, due: before /sdlc:architecture-design
- [ ] What happens when the Final Pass failed and Bonus Review moves the period to In Review — should it be held back? Default now: not held back; the HR Reviewer sees the failed Final Pass (AC-23). — owner: PM + HR, due: before /sdlc:clarify-prd
- [ ] Validate the import pain with 2–3 Team Leads (the problem is still a hypothesis). Default now: proceed on the hypothesis. — owner: PM, due: 2026-12-15
