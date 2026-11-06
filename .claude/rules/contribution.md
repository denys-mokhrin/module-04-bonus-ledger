---
paths:
  - "src/modules/contribution/**"
---

# Contribution Scoring rules

This is the core domain: scores decide people's bonuses, so correctness beats speed.

- Every score is calculated by a pure function: (evidence, `WeightingPolicy` version) → `ContributionScore`. No I/O, no `Date.now()` (inject the clock).
- Never change an existing `WeightingPolicy` version. A new rule means a new version; closed periods keep the version they were scored with.
- A member with 0 capacity days is "not scored". Never return 0 for them.
- Input comes only from events (`IssuesImported`, `WorklogsImported`, `SprintClosed`, `TeamMemberInvited`) stored in this context's own read model. Do not import anything from `src/modules/integrations/` except `public/`, and never touch Jira field names or the `integrations` schema.
- Do not draft justification text here. That belongs to `bonus-review`.
- Any change to the formula needs a table-driven unit test with worked examples (input → expected score).
