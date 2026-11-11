Decisions on your four points:

1. The database pipeline is proven: Postgres and Redis are up, pnpm db:migrate applied the five
   init migrations and pnpm test:int is green on this branch (commit 3e2c5a7 fixed the jest flag).
   DATABASE_URL is set in this shell.
2. companyId comes in the request body for now. Leave a short comment that auth will replace it.
3. Validation: a small zod pipe in src/shared/, as you suggest.
4. Team fields: id, companyId, name, leadMemberId (nullable, id only), createdAt. You are right
   about Jira project keys: leave them out, that mapping belongs to integrations.

Now read .notes/capstone/f1-prompts/02-model-and-migration.md and do that step with these
decisions applied (so: no jiraProjectKeys).
