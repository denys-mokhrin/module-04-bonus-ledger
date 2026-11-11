Step 1 of the Team slice: database only.

Add the Team model to the identity Prisma schema and create the migration the way the
project does it (pnpm db:migrate:dev identity <name>), with a hand-written down.sql next to it.

Team fields: id (the project's id primitive), companyId (id of the tenant, no foreign key yet
because Company does not exist), name, leadMemberId (nullable, id only), jiraProjectKeys
(list of strings), createdAt (UTC). Team name is unique inside a company.

Then run pnpm db:generate and pnpm db:migrate, and show me that the table exists in the
identity schema and that down.sql really undoes the migration. No endpoints or tests yet.
