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

**Features**
- `teams/`: Team, table `identity.team` (`id`, `companyId`, `name`, `leadMemberId`, `createdAt`). The name is trimmed and unique within a company (case-sensitive). `companyId` and `leadMemberId` are ids only, with no foreign keys yet: Company does not exist yet, and the `leadMemberId` → `member` foreign key is a separate migration still to do.
  - `POST /teams` with body `{ companyId, name, leadMemberId? }` → `201` with the team. Errors: `400 VALIDATION_FAILED`, `409 TEAM_NAME_TAKEN`. `companyId` comes from the body until auth supplies the tenant.
  - `GET /teams/:id` → `200` with the team. Errors: `400 VALIDATION_FAILED` (id is not a uuid), `404 TEAM_NOT_FOUND`.
  - Errors use the shared envelope `{ error: { code, message, details? } }`.
- `members/`: Member, table `identity.member` (`id`, `companyId`, `teamId`, `displayName`, `role`, `createdAt`), enum `identity.MemberRole` (`Dev`, `QA`, `Lead`, `PM`). The displayName is trimmed and unique within a team (case-sensitive); the same displayName may exist in another team. `teamId` has a foreign key to `identity.team` (same schema, `ON DELETE RESTRICT`: a team with members cannot be deleted). The team must belong to the member's company. `companyId` is an id only, with no foreign key yet, because Company does not exist yet.
  - `POST /members` with body `{ companyId, teamId, displayName, role }` → `201` with the member. Errors: `400 VALIDATION_FAILED`, `422 MEMBER_TEAM_UNKNOWN` (no such team, or the team belongs to another company), `409 MEMBER_DISPLAY_NAME_TAKEN`. `companyId` comes from the body until auth supplies the tenant.
  - `GET /members/:id` → `200` with the member. Errors: `400 VALIDATION_FAILED` (id is not a uuid), `404 MEMBER_NOT_FOUND`.
  - The service also rejects, for callers that do not come through HTTP: `400 MEMBER_DISPLAY_NAME_REQUIRED`, `400 MEMBER_ROLE_INVALID`.
  - Errors use the shared envelope `{ error: { code, message, details? } }`.

**Public facade:** `public/`: `TeamDirectory` (look up a team's members and roles by id), not built yet.
**Schema:** `identity`. Layout: handler / service / repo, grouped by feature; Prisma client in `db/`.
