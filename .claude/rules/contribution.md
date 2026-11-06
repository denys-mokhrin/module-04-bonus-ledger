---
paths:
  - "src/modules/contribution/**"
---

# Contribution Scoring rules

This is the core domain: scores decide people's bonuses, so correctness beats speed.

- Every score is calculated by a pure function: (evidence, `WeightingPolicy` version) → `ContributionScore`. No I/O, no `Date.now()` (inject the clock).
- Never change an existing `WeightingPolicy` version. A new rule means a new version; closed periods keep the version they were scored with.
- A member with 0 capacity days is "not scored". Never return 0 for them.
- Scoring input comes only from events published in other contexts' `public/` folders, kept in this context's own read model. A new input event is fine if it is described in `docs/bc-map.md`: add it to the read model with a test. If no event carries the data you need, do not read another schema or make a synchronous call; stop and propose a new event and an ADR. Why: the rule is about the data source and the direction of the dependency, not about specific names; event names live in `bc-map.md` and a copy here goes stale.
- Do not draft justification text here. That belongs to `bonus-review`.
- Any change to the formula needs a table-driven unit test with worked examples (input → expected score).
