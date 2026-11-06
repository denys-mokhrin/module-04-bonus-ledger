# Identity & Teams

Owns companies (tenants), teams, members, roles and HR reviewers, plus authentication and invitations.

- Publishes: `CompanyRegistered`, `TeamMemberInvited`
- Listens to: nothing
- Public facade: `public/` — `TeamDirectory` (look up a team's members and roles by id)
- Schema: `identity`
