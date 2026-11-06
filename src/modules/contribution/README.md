# Contribution Scoring

**Why it exists.** It is the core domain: the weighting rules that turn imported work into a fair monthly score are what make the product different, and a wrong rule silently changes people's bonuses. It is kept apart so the rules stay pure, versioned and testable without a database.

**Glossary** (from `docs/bc-map.md`):
- **Contribution Score** (`ContributionScore`): a member's weighted result for a month (0–100).
- **Weighting Policy** (`WeightingPolicy`): the versioned rules that turn story points, issue type and role into Weighted Effort.
- **Weighted Effort**: the intermediate per-issue value the policy produces; never called "points".
- **Capacity**: a member's available working days in the sprint, adjusted for absences.
- **Team Baseline**: the team median used for relative comparison and the trend over previous months.

**Events**
- Publishes: `ContributionScored` (→ Bonus Review)
- Listens to: `IssuesImported`, `WorklogsImported`, `SprintClosed`, `TeamMemberInvited`

**Public facade:** `public/`: `ScoreQuery` (scores and evidence for a member and month), not built yet.
**Schema:** `contribution`. Layout: `domain/` (pure scoring, no I/O), `app/` (use cases, listeners), `infra/` (Prisma client in `infra/db/`). Rules: `.claude/rules/contribution.md`.
