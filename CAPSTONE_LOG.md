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

Session `8d8ffc91`, 2026-11-10, 21:13:42 – 21:20:42 local time (the control check of the hook ran
after that, until 21:22:40, and is not counted). One Claude Code session started with
`claude --plugin-dir ../ledger-slice`, plugin version 0.1.0, same machine, same database, same
permission mode as feature 1. Times are measured the same way as for feature 1.

### Metrics, next to feature 1

| Metric | Feature 1, by hand | Feature 2, plugin | Ratio |
|---|---|---|---|
| First prompt → all four checks green | 10 min 28 s | 7 min 00 s | 1.5× faster |
| Time the agent was working | 7 min 25 s | 4 min 32 s (0:41 + 1:02 + 2:07 + 0:42) | 1.6× faster |
| Time between prompts | 5 min 17 s | 2 min 28 s | 2.1× less |
| What I typed | 5 free-form prompts written as files, plus 3 one-line answers | 3 plugin commands, plus 1 one-line answer | |
| Tool calls made by the agent | 52 | 31 | 1.7× fewer |
| Questions the agent asked before it could go on | 4 decisions | 0 decisions, 1 false stop (Docker) | |
| Result | 12 new files, 484 lines; `pnpm test` 53, `pnpm test:int` 28 | 9 new files, 575 lines; `pnpm test` 69, `pnpm test:int` 47 | |

**The target was 2× and I did not reach it: the slice was 1.5× faster.** The plugin removed the
exploration prompt, the four decisions and the hand-written step prompts. It did not shorten the
part that is real work: writing 358 lines of specs and running the database and the checks.
At least 54 s of the 7 minutes (the pause between steps 1 and 1a) went into the false stop
described below, plus the time the agent spent checking Docker and writing the stop report.
Without it the run would have taken about 6 minutes, still short of the 2× line (5 min 14 s).
That is an estimate, not a measurement.

### Steps, in order

| # | What I typed | What happened | Agent time |
|---|---|---|---|
| 1 | `/ledger-slice:slice-scaffold identity Member "teamId, displayName, role (Dev, QA, Lead, PM); displayName unique inside a team"` | model + enum written, then the agent stopped: "Docker isn't running" | 0:41 |
| 1a | "Postgres is already up on localhost:5432 … Continue from step 3." | migration, `down.sql`, rollback proven through `/ledger-slice:rollback-migration`, typecheck | 1:02 |
| 2 | `/ledger-slice:slice-build identity Member "POST /members, GET /members/:id; reject an unknown team"` | failing specs (unit: modules missing; integration: 19 of 19 got 404), then type, errors, repo, service, controller; 16 + 19 tests green | 2:07 |
| 3 | `/ledger-slice:slice-ship identity Member` | README, four checks green, `git status`, `git diff --stat`, commit message | 0:42 |

The plugin was used in four key steps: the three skills above and the `rollback-migration`
command, which the agent called by itself inside step 1a. In step 2 stray characters got into
the input line before the slash, so the text arrived as a plain message; the skill still started,
through its description (auto-activation), with the same arguments.

### Hooks: what they caught

| When | Hook | What it blocked | Verdict |
|---|---|---|---|
| 21:15:30 | `migration-guard` | a Bash heredoc that wrote `down.sql`; the header comment of that file mentions `prisma migrate resolve --rolled-back` | **false positive**: the hook matched text that was only being written to a file. The agent wrote the file with the Write tool instead. Fixed after the run: heredoc bodies, here-strings and comment lines are removed before matching; new self-test. |
| 21:22:27 | `boundary-guard` | an Edit adding `import { BillingDb } from '../../billing/db/client'` to `members.service.ts` | **control check, not a caught mistake**: after the slice was green I asked the agent to try this import on purpose. The hook rejected the edit before the file changed. |

During the real work the agent made no cross-context import and never tried the forbidden Prisma
commands, so no hook stopped a real mistake in this feature. Both entries are in
`.claude/ledger-slice-hook.log` (local, not committed).

### What the plugin got wrong, and the fix

| Problem | Cost | Fix in the plugin |
|---|---|---|
| `slice-scaffold` said the migration "needs a running Postgres (`docker compose up -d postgres redis`)". The agent checked Docker Desktop on Windows, which was not started, and stopped, although Postgres was running in the Docker engine inside WSL and `DATABASE_URL` was set. | one extra message and about 1 minute | the skill now says: run the migration command; do not check Docker or `.env` first; stop only if the command itself fails to connect |
| `migration-guard` false positive (above) | one retry by the agent | text that is only written is ignored |
| `/ledger-slice:rollback-migration` used `$1` and `$2`; the arguments landed in the wrong places and the agent had to take them from its own call | none in time; the procedure itself worked | switched to `$ARGUMENTS[0]` and `$ARGUMENTS[1]`; not yet re-run in a session |

### Second run with the fixed plugin: Reviewer

Feature 2 missed the 2× target and exposed three plugin defects, so after fixing them I measured
once more on a new entity instead of repeating `Member` (a repeat would only measure a task that
is already solved). Entity: `Reviewer` in `identity` (`displayName`, `email`; email unique inside
a company), branch `feature-3/identity-reviewer`. Session `053a372e`, 2026-11-10,
21:26:36 – 21:31:57, same machine, database and permission mode.

| Metric | Feature 1, by hand | Feature 2, plugin 0.1.0 | Reviewer, fixed plugin |
|---|---|---|---|
| First prompt → all four checks green | 10 min 28 s | 7 min 00 s (1.5×) | 5 min 21 s (1.96×) |
| Time the agent was working | 7 min 25 s | 4 min 32 s | 4 min 01 s (1:07 + 2:20 + 0:34) |
| Time between prompts | 5 min 17 s | 2 min 28 s | 1 min 20 s |
| What I typed | 5 prompts + 3 answers | 3 commands + 1 answer | 3 commands, nothing else |
| Tool calls made by the agent | 52 | 31 | 22 |
| False stops, hook blocks | — | 1 stop, 1 false block | none |
| Result | 12 files, 484 lines | 9 files, 575 lines | 9 files, 491 lines; `pnpm test` 83, `pnpm test:int` 65 |

**1.96×: seven seconds short of 2× (5 min 14 s).** I report it as "about two times", not as the
target met. What to keep in mind when reading the numbers:

- `Reviewer` has the same shape as `Team` from feature 1 (two fields, one uniqueness rule, no
  reference to another table), so this pair is the fairest comparison. `Member` was a bit larger
  (an enum and a foreign key).
- The time between prompts includes a fixed wait of 20 to 30 s per step in which I make sure the
  agent has really finished. It is in all three runs.
- By the third entity the repository holds two finished slices to mirror, so part of the gain is
  the code base, not only the plugin.
- No hook fired in this run and the agent did the rollback by the written procedure without
  calling `/ledger-slice:rollback-migration`, so the argument fix of that command is still not
  exercised in a session.

Decision the agent raised and I accepted: the email is trimmed and lower-cased by the application
before saving and lookup; the database compares text exactly.

### Decisions the agent made that were not in the plugin

- An unknown team in the body of `POST /members` returns 422 `MEMBER_TEAM_UNKNOWN`, not 404; a
  team of another company gets the same answer. I kept it.
- `Member.teamId` is a real foreign key to `team` (same schema, `ON DELETE RESTRICT`).
- `Team.leadMemberId` still has no foreign key; that is a separate migration.

### Not covered by a test

- The repo's handling of `P2002` (duplicate name in a race) and `P2003` (team deleted between the
  check and the insert).
- That the `MemberRole` enum in `schema.prisma` matches `MEMBER_ROLES` in `member.ts`; only
  typecheck ties them together.

## SDK script: release notes

`scripts/release-notes.mjs` (`pnpm release:notes`), branch `feature-4/release-notes`. A headless
Claude Code pipeline that drafts the `Unreleased` section of `docs/CHANGELOG.md` from the commits
since the last tag (`v0.1.0`, the scaffold).

| Requirement | How it is met |
|---|---|
| Structured output | `--output-format json --json-schema` with `scripts/release-notes/schema.json`; the script re-checks version, date, tag and that every bullet of the JSON is in the changelog |
| Explicit turn limit | `--max-turns 10` |
| Suggestion only | tools limited to `Bash(git log *)`, `Read(docs/**)`, `Edit(docs/CHANGELOG.md)`; nothing is committed, tagged or pushed; a failed check restores the file |
| Secrets | `ANTHROPIC_API_KEY` only from the environment; in CI from a repository secret |

Runs on 2026-11-10, model `haiku`:

| Run | Result |
|---|---|
| normal | 6 turns of 10, 17 s, $0.006; three `Added` bullets (Team, Member, Reviewer endpoints) and one `Fixed`; all checks passed |
| `--check` | passed, file restored |
| `RELEASE_NOTES_MAX_TURNS=2` | stopped with "did not finish within --max-turns 2", exit 1, file restored |

In one run the agent tried `cat docs/bc-map.md` through Bash; the tool list denied it and it
used Read instead. The CI workflow (`release-notes.yml`, manual start) is written but has not
run: the repository has no `ANTHROPIC_API_KEY` secret yet.
