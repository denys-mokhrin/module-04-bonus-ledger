# Identity & Teams

**Why it exists.** Every other context needs to know who the tenant is and who belongs to which team, but none of them should own that. Identity owns companies (tenants), teams, members, roles and HR reviewers, plus authentication and invitations, so the rest of the product can refer to people and teams by id only.

**Glossary** (from `docs/bc-map.md`):
- **Company**: the paying tenant; every record belongs to one company.
- **Team**: a group of members with one team lead, mapped to one or more Jira projects.
- **Member**: a person whose contribution is scored; has a role (Dev, QA, Lead, PM).
- **Reviewer**: an HR user who approves justifications; is not scored.

**Events**
- Publishes: `CompanyRegistered` (→ Billing), `TeamMemberInvited` (→ Contribution Scoring)
- Listens to: nothing

**Public facade:** `public/`: `TeamDirectory` (look up a team's members and roles by id), not built yet.
**Schema:** `identity`. Layout: handler / service / repo, grouped by feature; Prisma client in `db/`.
