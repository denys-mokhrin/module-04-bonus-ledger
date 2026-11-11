# Capstone log: feature 1 by hand vs feature 2 with the plugin

Project: Bonus Ledger scaffold (NestJS 11, Prisma 7, one Postgres schema per bounded context).
Both features are the same vertical slice in the `identity` context: Prisma model + migration
with a rollback, HTTP endpoints, unit and integration tests.

- Feature 1: `Team`, branch `feature-1/identity-team`, built with free-form prompts, no plugin.
- Feature 2: `Member`, branch `feature-2/identity-member`, built with the plugin.

Times are wall-clock, taken from the timestamps of the Claude Code session log.
"Green" means `pnpm typecheck`, `pnpm lint`, `pnpm test` and `pnpm test:int` all pass.

## Before feature 1: the baseline was red

| When | What | Result |
|---|---|---|
| 2026-11-10 | `pnpm test:int` on untouched `main` | 6 of 14 tests failed: every Prisma query threw "A dynamic import callback was invoked without --experimental-vm-modules". CI on `main` had been failing on the same step since 2026-11-06. |
| 2026-11-10 | Fix: the `test:int` script now starts jest through `node --experimental-vm-modules` | 14 of 14 pass. Commit `3e2c5a7`. Not counted in the feature 1 time. |
| 2026-11-10 | Local database: Docker runs inside WSL; the WSL VM shut down when idle and took Postgres with it | Kept WSL alive with a background process. Not counted in the feature 1 time. |

## Feature 1: Team, by hand

Session `d46fa0c1`, 2026-11-10, 19:26:32 – 19:39:14 local time. One Claude Code session, free-form
prompts only. The prompt texts are kept verbatim in `.notes/capstone/f1-prompts/`.

### Metrics

| Metric | Value |
|---|---|
| First prompt → all four checks green | 10 min 28 s (end of prompt 4) |
| First prompt → end of the session | 12 min 42 s |
| Free-form prompts | 5 (plus 3 one-line answers folded into prompts 2, 3 and 4) |
| Time the agent was working | 7 min 25 s (1:11 + 1:54 + 1:44 + 1:46 + 0:50) |
| Time between prompts (waiting for the answer to settle, reading it, deciding, sending the next one) | 5 min 17 s |
| Tool calls made by the agent | 52, of them 13 runs of `pnpm` checks or database commands |
| Result | 12 new files, 484 lines; 4 changed files; `pnpm test` 53 passed, `pnpm test:int` 28 passed |

### Prompts, in order

| # | Prompt | What it was for | Agent time |
|---|---|---|---|
| 1 | `01-explore.md` | read the conventions, list files to create, list what the scaffold lacks | 1:11 |
| 2 | `02a-decisions.md` + `02-model-and-migration.md` | answer four questions, then model + migration + `down.sql`, prove the rollback | 1:54 |
| 3 | "Leave the ADR and a rollback script for a separate change" + `03-tests-first.md` | failing unit and integration specs | 1:44 |
| 4 | "Agreed on all four choices" + `04-implement.md` | controller, service, repo, wiring | 1:46 |
| 5 | "Update the identity README" + `05-verify.md` | README, four checks, `git status`, `git diff --stat` | 0:50 |

### What repeated (raw material for the plugin)

- **"Read the conventions first."** Prompt 1 exists only to make the agent read AGENTS.md,
  ARCHITECTURE.md, ADR 0002, the init migration and the shared primitives. Every new entity needs
  the same reading list.
- **The same four decisions.** Where `companyId` comes from, how the body is validated, which
  fields the entity has, whether the database pipeline works. Three of the four are now settled
  for the whole project and should never be asked again.
- **The same step order.** Model and migration → failing specs → implementation → checks. I typed
  it as four separate prompts with the same sentence shape each time.
- **The same checks by hand.** `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:int` ran at
  the end of steps 2, 4 and 5; `pnpm db:generate` and `pnpm db:migrate` after the schema change.
- **Rollback proof by hand.** Run `down.sql`, check the table is gone, repair the migration
  history, migrate again.

### Where I stumbled

| What happened | Cost | Follow-up |
|---|---|---|
| My prompt asked for `jiraProjectKeys` on Team. The agent objected: provider data must not leave `integrations/jira/` (AGENTS.md). | one extra decision round | removed the field; a plugin should carry this rule so the question is not asked |
| The rollback procedure in ADR 0002 does not work: `prisma migrate resolve --rolled-back` refuses a migration that succeeded (P3012), so the history said "applied" while the table was gone. | manual repair: delete the history row, migrate again | documented in the header of `down.sql`; ADR and a `rollback` command left for a separate change |
| ESLint `no-useless-assignment` flagged a zod schema used only inside a parameter decorator. | one rewrite | schema written inline in the decorator, rule not disabled |
| No request validation existed in the scaffold. | a new shared primitive | `src/shared/validation/` with `ZodValidationPipe` and its own spec; reusable for the next entity |
| A non-uuid `:id` would have returned `HTTP_400` from Nest's `ParseUUIDPipe` instead of the project code. | caught by the spec written first | the id goes through the zod pipe |

### Not covered by a test

- Two concurrent requests with the same team name: the unique index rejects the second and the
  repo maps it to `TEAM_NAME_TAKEN`, but no spec exercises that path.
- `leadMemberId: null` in the body is accepted; no spec covers it.

## Feature 2: Member, with the plugin

_Filled in after stage 3._
