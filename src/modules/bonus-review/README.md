# Bonus Review

**Why it exists.** A score is not a decision. This context owns the human workflow around it: the monthly period, the justification text the team lead edits, the recommended tier and HR's approval, and it locks everything once the period is closed. Keeping it apart from scoring means text and approvals can change without touching the formula.

**Glossary** (from `docs/bc-map.md`):
- **Bonus Period**: one calendar month for one team, with states Open → In Review → Closed.
- **Justification**: the formal text that explains a member's bonus, with evidence links (drafted via the Claude API from structured evidence only).
- **Recommendation**: the suggested bonus tier (None / Standard / High / Exceptional).
- **Approval**: HR's sign-off on one justification; it cannot be changed after the period is closed.

**Events**
- Publishes: `BonusPeriodOpened` (→ Jira Integration), `JustificationDrafted`, `JustificationApproved`, `BonusPeriodClosed`
- Listens to: `ContributionScored`, `SubscriptionSuspended`

**Public facade:** `public/`: event types only.
**Schema:** `bonus_review`. Layout: handler / service / repo, grouped by feature; Prisma client in `db/`.
