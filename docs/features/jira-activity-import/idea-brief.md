---
status: Confirmed
owner: "Denys Mokhrin"
reviewers: []
updated_at: "2026-11-11"
feature_size:                   # set by sdlc:classify-size, not here
stage: "01"
depth: medium
ticket: ""
value_score:
  rice: 2.5
  state: confirmed              # defaults taken without validation, see §15
  confirmed_at: "2026-11-11"
feasibility_state: confirmed    # defaults taken without validation, see §15
---

# Idea Brief — Jira Activity Import

## 1. Raw idea
A team lead connects the Jira site of the team once, and Bonus Ledger imports issues, story points, assignees and worklogs for the bonus period on a schedule, so nobody copies Jira activity by hand before the monthly bonus review.

## 2. Problem
Every downstream step of Bonus Ledger (Contribution Score, Justification, HR Approval) needs the team's Jira activity for the month, and today nothing brings it in: without import the product produces no value at all. The size of the manual effort teams spend today is a **hypothesis, not measured**: the product is pre-launch and no team lead has been interviewed yet (§15).

## 3. Users
- **Team lead** (primary): connects the Jira site once, expects data for the open Bonus Period without further action, uses it at the monthly bonus review. Frequency: one connection, then monthly.
- **HR reviewer** (secondary): never touches the import, but relies on its completeness when approving a Justification.
- **Member** (affected): their bonus depends on whether their work was imported; does not interact with the feature.
- Segment: teams working in one Jira Cloud site, often across **several Jira projects** on that site.

## 4. Why now
It blocks the whole MVP. Scoring, justification drafts and HR review all consume imported activity; SPEC goal 1 ("a team lead connects a Jira project and gets every member's monthly contribution score") starts with this feature. There is no external deadline.

## 5. Out of scope
- Sprints and the `SprintClosed` event (Capacity falls back to working days until a follow-up feature).
- Backfill of previous months (Team Baseline and trend stay empty for the first months after connecting).
- A manual "sync now" action.
- Jira sites other than Jira Cloud; more than one Jira site per Team.
- Scoring, justification text, absences (`MemberAbsenceRecorded` stays unassigned).
- Building the event-delivery groundwork (scaffold task S9). It is a prerequisite, not part of this feature.

## 6. Competitive analysis
| # | Product · URL | Features | Value (1-5) | Gap |
|---|---|---|---|---|
| 1 | LinearB · linearb.helpdocs.io (Jira Cloud OAuth article) | One-time admin connection (dedicated service account advised), hourly sync after 3-month first load, story-point sums | 3 | No per-person monthly evidence, no frozen period, no verified sync-health surface |
| 2 | Swarmia · help.swarmia.com/getting-started/integrations/jira | Admin installs app, issues appear once assigned to a team, statuses must be mapped | 2 | **Silent omission**: unmapped statuses and unassigned issues just don't show |
| 3 | Jellyfish · jellyfish.co/integration/jira | Cloud and self-hosted, captures ticket movement and custom fields | 2 | Built for investment allocation, positioned against story points; cadence unverified |
| 4 | Tempo Timesheets · help.tempo.io/timesheets/latest/timesheet-approvals | Worklog approval, periods close and worklogs lock, scheduled auto-close | 3 | Period lock covers worklogs only; manual logging and approval; lives inside Jira |
| 5 | Span · span-knowledge-base.help.usepylon.com (Jira integration article) | Scheduled incremental pulls, story-point field matched by name or picked manually | 2 | No period freezing, health surface unverified |

Footnotes: all rows researched 2026-11-11. Queries: "LinearB Jira integration connect sync issues story points" (1), "Swarmia Jira Cloud integration setup sync data issues" (2), "Jellyfish Jira integration data sync frequency issues story points worklogs" (3, 5), "Tempo Timesheets Jira worklog reports approval lock period" (4). Claims rest on search-result text; pages were not fetched. Screenful, Haystack, Lattice and 15Five were dropped as unverified.

**Key gap:** no verified tool combines a one-time connection, scheduled import of issues, story points and worklogs, a visible per-period completeness state, and a frozen month-end snapshot.

## 7. Strategic approaches

### Approach A — Connect once, nightly import
- **Thesis**: the lead grants access once, picks the team's projects, and activity is refreshed daily plus one final pass after month end; the only visible state is "last imported at".
- **For whom**: team leads of small teams in one project with a tidy Jira.
- **Outcome metric**: periods imported with zero manual action: 0% → 90%.
- **Key trade-off**: fastest to ship, but failures and gaps are invisible until review day.
- **Effort signal**: M (3 person-weeks)
- **Recommended?** ◯

### Approach B — Evidence-grade activity ledger
- **Thesis**: A plus a per-period data-health report (unestimated issues, unassigned work, unmatched Jira users, missing worklogs) that the lead signs off, a change history since the last import, and a frozen snapshot at period close.
- **For whom**: HR reviewers and companies that need audit-grade bonus evidence.
- **Outcome metric**: Justifications returned by HR for data reasons: unknown → near 0.
- **Key trade-off**: strongest trust and anti-gaming story, but the mandatory sign-off is a manual step that contradicts the success metric.
- **Effort signal**: L (7 person-weeks)
- **Recommended?** ◯

### Approach C — Scheduled import with health signal
- **Thesis**: A plus a visible per-team import status, actionable alerts (access lost, story-point field not found, Jira users not matched to Members, projects that returned no activity), and imported data frozen when the Bonus Period closes.
- **For whom**: team leads of multi-project teams, with HR as indirect beneficiary.
- **Outcome metric**: periods imported with zero manual action: 0% → 90%.
- **Key trade-off**: the lead acts only when something is wrong, but alerts catch hard failures better than partial visibility.
- **Effort signal**: M (4 person-weeks)
- **Recommended?** ●

## 8. Multi-perspective feedback
Written in one pass (not by separate reviewers), to limit cost; the devil's advocate review in §10 was done independently.

### Engineer
- A has the smallest integration surface but no way to tell "nothing happened" from "import failed".
- B multiplies surface: change history and health rules per field, each a source of false alarms.
- C's extra cost is concentrated in failure classification and notification, which is bounded and testable.
- All approaches share the hard parts: month-boundary timezone handling, late Jira edits, throttling at month start.
- Freezing at period close needs a clear owner of "closed" outside this feature (Bonus Review).

### Executive
- The feature is pure enabler: its value is that scoring and review can exist at all.
- A ships value earliest but risks the first customers' trust on the first broken month.
- B is a differentiator ("bonus evidence HR can defend") but delays the whole MVP by about a month.
- C protects the first-month experience at a small premium over A.

### UX-researcher
- Leads won't check a status page proactively; problems must reach them.
- B's sign-off becomes a rubber stamp if warnings are noisy.
- Unmatched Jira users is the most likely first-week confusion; it needs a plain fix path.
- "Last imported at" alone (A) gives false confidence.

### Synthesis matrix
|         | Engineer | Executive | UX |
|---------|:--------:|:---------:|:--:|
| App. A  | + smallest surface, blind to failures | 0 earliest value, fragile trust | − false confidence, silent gaps |
| App. B  | − broad surface, noisy health rules | + defensible evidence, delays MVP | 0 rich insight, sign-off fatigue |
| App. C  | + bounded extra cost, testable alerts | + protects first months cheaply | + acts only when something breaks |

## 9. Trade-offs and edge cases

### Trade-offs per approach
| Approach | Pros | Cons |
|---|---|---|
| A | Shortest path; least to maintain | Silent failures; lead learns on review day |
| B | Audit-grade evidence; exposes gaming | Manual sign-off; ~2× effort; delays MVP |
| C | Zero-touch when healthy; failures surface early | Partial visibility (restricted projects) still hard to detect |

### Edge cases
- Connecting person leaves the company or loses access mid-month (the Connection belongs to the Team, not the person).
- Worklogs logged late or story points re-estimated after the final pass.
- Activity near midnight at month boundaries in the company's timezone.
- Story-point field differs between projects, or several candidate fields exist.
- Jira users with hidden emails, contractors, renamed or deactivated accounts.
- Issue moved between configured projects (its key changes) or into an unconfigured project.
- Many companies running their month-end pass at the same time; Jira throttling.
- Project renamed, archived or added to the team mid-month.

## 10. Risks
- **Top: import reports success but data is incomplete.** The connecting account cannot see some issues (restricted projects, issue-level security, issues moved outside the configured projects). Members are under-counted, data looks healthy, and the problem appears only as disputes after the period is read-only. High severity; A is hit hardest, C only partly covered (mitigation: flag configured projects or Members with no activity, compare against what the lead expects).
- Connection dies quietly mid-month; with no backfill and no manual sync the month is unrecoverable.
- Late Jira changes after the final pass get frozen into the closed period.
- Wrong or missing story-point field distorts a whole team's scores.
- Over-broad stored access to a customer's Jira (security reviews may block sales).
- Scored people can edit Jira (reassigning, re-estimating before month end); only B exposes it.

## 11. RICE — Claude proposed
- **Reach (R)**: 10 team leads per quarter: assumed pilot volume for a pre-launch product (§3, §15).
- **Impact (I)**: 2: blocks the whole MVP (§4), but the pain is an unvalidated hypothesis (§2); Executive view rates it an enabler (§8).
- **Confidence (C)**: 0.5: pain unvalidated, reach assumed, many unvalidated defaults (§15).
- **Effort (E)**: 4 person-weeks: Approach C signal M (§7), excluding the S9 prerequisite.
- **RICE = 10 × 2 × 0.5 / 4 = 2.5** (for comparison: A = 10 × 1 × 0.5 / 3 ≈ 1.7, impact lowered for silent failures; B = 10 × 3 × 0.5 / 7 ≈ 2.1)
- **State**: confirmed (defaults, see §15)

## 12. Feasibility — Claude proposed
- [☑] **Tech**: the scaffold already provides the `integrations` module with an empty `jira/` area, scheduled-job and in-process event wiring, and a recorded-fixture convention for provider tests. Caveat: publishing events to scoring waits on scaffold task S9.
- [☑] **Skills**: the team already worked through Jira import design (idempotent re-import, sync window, deleted-item detection) in `.notes/decisions.md`; the boundary rules for provider data are documented.
- [☐] **Time**: no feature has shipped in this repo yet, so there is no past delivery to compare with, and the estimate depends on S9 landing first.
- **State**: confirmed (defaults, see §15)

## 13. Recommendation
**Selected: Approach C — Scheduled import with health signal.** It scores highest on RICE (2.5 vs 1.7 for A and 2.1 for B, §11) because it keeps A's effort class while removing A's biggest weakness. The synthesis matrix (§8) rates C positive on all three lenses: Engineer "bounded extra cost, testable alerts", against A's UX cell "false confidence, silent gaps". It targets the competitive gap in §6: Swarmia silently omits unmapped data, and no verified tool shows a per-period completeness state. Feasibility (§12) is Tech ☑ and Skills ☑ but Time ☐, so delivery is conditional on S9 shipping first and the estimate is low-confidence. C is also the only option compatible with the "zero manual steps" metric that still surfaces failures before review day.

**Locked-in pointer**: the PRD should specify connect-once for one Jira Cloud site with several projects, a daily import plus a final pass after month end, a per-team import status, alerts for access loss, a missing story-point field, unmatched Jira users and projects with no activity, and frozen imported data after the Bonus Period closes.

## 14. Parked & rejected approaches
| # | Approach | Status | Reason | Revisit trigger |
|---|---|:---:|---|---|
| A | Connect once, nightly import | rejected | Silent failures defeat the zero-manual-steps metric; C costs only ~1 week more | Effort for C proves > 6 person-weeks |
| B | Evidence-grade activity ledger | parked | ~2× effort, delays MVP, sign-off contradicts metric | HR returns Justifications for data reasons, or customers raise gaming of Jira |
| - | Sprint import and history backfill | parked | Out of scope by owner decision (§5) | Scoring needs per-sprint Capacity or Team Baseline at launch |

## 15. Open questions
Defaults taken on 2026-11-11 without validation (only the problem, success metric, multi-project scope and why-now were decided explicitly; everything below is an assumption and needs review):
- [ ] Assumption: scaffold task S9 (event delivery between contexts) is a prerequisite built before this feature, not part of it. If wrong: Effort +~1 week, RICE drops. Owner: Tech Lead, due: before write-prd.
- [ ] Assumption: freshness is daily during the open period plus one final pass after month end. If wrong: more load on customer Jira or stale data at review. Owner: PM, due: before write-prd.
- [ ] Assumption: Reach is 10 team leads per quarter. Owner: PM, due: before roadmap.
- [ ] Assumption: RICE values I = 2, C = 0.5, E = 4 and the A/B comparison scores. Owner: PM + Tech Lead, due: before write-prd.
- [ ] Assumption: Feasibility marks (Tech ☑, Skills ☑, Time ☐). Owner: Tech Lead, due: before write-prd.
- [ ] Assumption: Approach C is the recommendation; A rejected, B parked. Owner: PM, due: before write-prd.
- [ ] Assumption: imported data freezes when the Bonus Period closes, and late Jira changes after that are not applied. Owner: PM + HR, due: write-prd.
- [ ] Assumption: the success target is 90% of periods with zero manual action. Owner: PM, due: write-prd.
- [ ] Validate the pain with 2–3 team leads (pain is a hypothesis, §2). Owner: PM, due: before PRD review.
- [ ] What should happen with the month when the Connection dies and the final pass fails, given no manual sync and no backfill? Owner: PM, due: write-prd.
- [ ] Rule for which Bonus Period an issue's activity belongs to (see `.notes/decisions.md` item 3). Owner: Tech Lead, due: architecture-design.
- [ ] Possible new glossary term for the per-team import status (e.g. "Sync Health"); not added to CONTEXT.md yet. Owner: PM, due: write-prd.

## Related
- `docs/features/jira-activity-import/CONTEXT.md` (Connection, Imported Issue, Sync Run, Worklog)
- `docs/bc-map.md` (Jira Integration context, `IssuesImported`, `WorklogsImported`)
- `SPEC.md` goal 1 and the idempotent-sync acceptance criterion
- `.notes/decisions.md` (unconfirmed import design proposals)
- `docs/features/_scaffold/tasks/tasks.json` (task S9)

## DoD self-check
- [x] 15 sections present
- [x] No anti-pattern terms (datastore/broker names, latency targets)
- [x] Length ≤ 5 pages (~2200 words)
- [x] Frontmatter status: Confirmed (defaults, see §15)
- [x] RICE confirmed (state: confirmed, defaults)
- [x] Feasibility confirmed (state: confirmed, defaults)
- [x] Recommendation present with rationale citing §6, §8, §11, §12
