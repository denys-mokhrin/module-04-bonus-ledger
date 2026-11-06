# Contribution Scoring

The core domain. It turns imported work into a monthly **Contribution Score** per member, using a versioned **Weighting Policy** (story points × issue type × role), sprint **Capacity** and the **Team Baseline** with trend.

- Publishes: `ContributionScored`
- Listens to: `IssuesImported`, `WorklogsImported`, `SprintClosed`, `TeamMemberInvited`
- Public facade: `public/` — `ScoreQuery` (scores and evidence for a member and month)
- Schema: `contribution`
