# Bonus Review

Owns the monthly **Bonus Period** workflow (Open → In Review → Closed). It drafts **Justifications** from score evidence (via the Claude API), stores the team lead's edits and the **Recommendation** tier, records HR **Approval** and exports the closed period.

- Publishes: `BonusPeriodOpened`, `JustificationDrafted`, `JustificationApproved`, `BonusPeriodClosed`
- Listens to: `ContributionScored`, `SubscriptionSuspended`
- Public facade: `public/` — event types only
- Schema: `bonus_review`
