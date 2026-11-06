# Bonus Ledger

SaaS for team leads and HR: imports Jira activity, scores each member's monthly contribution and produces bonus justifications that HR approves. Modular monolith, one deployable.

## Stack

- TypeScript (strict), Node.js 22, NestJS 11
- PostgreSQL 16 via Prisma; one schema per bounded context (`identity`, `integrations`, `contribution`, `bonus_review`, `billing`)
- Jest for unit and integration tests, Supertest for HTTP
- pnpm (not npm, not yarn)
- Redis + BullMQ for queued jobs; `@nestjs/event-emitter` with an outbox table per context

## Commands

Work once `package.json` and `docker-compose.yml` are scaffolded.

- Dev: `docker compose up -d postgres` then `pnpm start:dev` (alias: `make dev`)
- All tests: `pnpm test` (alias: `make test`)
- Single test file: `pnpm test src/modules/contribution/<file>.spec.ts`
- Unit tests only (no Docker): `pnpm test:unit`
- Integration + e2e against Postgres and Redis: `docker compose up -d postgres redis`, `pnpm db:migrate`, then `pnpm test:int`
- Lint, including the cross-context import rules: `pnpm lint` (alias: `make lint`)
- Type-check: `pnpm typecheck` (alias: `make typecheck`); build: `pnpm build`
- Prisma: `pnpm db:generate` (all five clients), `pnpm db:migrate` (all contexts), `pnpm db:migrate:dev <context> <name>` (new migration; add a hand-written `down.sql` next to it)
- `pnpm test` needs no Docker: unit specs, the lint self-test and e2e specs with infra health checks stubbed. Specs that need a database or Redis are `test/**/*.int-spec.ts`.
- If `pnpm` is not on PATH, run it through Corepack: `corepack pnpm <script>` (version pinned by `packageManager` in `package.json`).

## Conventions

- Code, identifiers, commits and docs in English; domain terms exactly as in `docs/bc-map.md` (e.g. the score is `ContributionScore`, never `Rating` or `Points`; Jira story points stay `storyPoints`).
- Money representation rules (Billing and the shared `Money` primitive): `.claude/rules/money.md`.
- Dates are stored in UTC; a bonus period is a calendar month `YYYY-MM` in the company's timezone.
- Commits follow Conventional Commits: `feat(contribution): ...`.
- New behaviour starts with a failing test.
- Never put real Jira tokens, employee names or salaries in test data.

## Architecture

Feature-first modular monolith; each bounded context is a NestJS module in `src/modules/<context>/`: `identity`, `integrations`, `contribution`, `bonus-review` (schema `bonus_review`), `billing`.

Dependency rule:
- A context never imports another context's internals. Allowed cross-context imports: `src/modules/<other>/public/` (its facade and published event types) and `src/shared/` only.
- Contexts communicate through domain events (past tense, e.g. `SprintClosed`) on the in-process event bus; synchronous calls go only through the other context's public facade.
- No context reads another context's database schema.
- `src/shared/` holds technical primitives only (ids, clock, money, event bus) and contains no business rules.
- New context or new cross-context dependency → update `docs/bc-map.md` and add an ADR in `docs/adr/` first.

What may import what (enforced by `pnpm lint`: `eslint-plugin-boundaries` + `import-x/no-cycle`, self-tested in `test/lint/`):

| From | May import | Forbidden |
|---|---|---|
| `src/modules/<A>/**` | its own files; `src/modules/<B>/public/**`; `src/shared/**`; npm packages | any other path in `src/modules/<B>/` (services, repos, `db/`, its generated Prisma client); `src/*.ts` |
| `src/shared/**` | `src/shared/**`; npm packages | anything in `src/modules/` |
| `src/app.module.ts`, `src/main.ts` | `src/modules/<X>/<x>.module.ts`, `src/shared/**` | — |
| any module | — | an import cycle between modules; SQL against another context's schema; cross-schema joins or foreign keys |

- Provider types (Jira DTOs, `customfield_*` ids, HTTP clients) never leave `src/modules/integrations/jira/`.
- Do not silence a boundaries or no-cycle error with `eslint-disable`; if a dependency is really needed, it goes through `public/` or an event, after a `docs/bc-map.md` update and an ADR.

The architecture overview below is imported into every session; read the full map before adding a module, moving code between modules or touching runtime wiring (jobs, event bus, outbox).

@ARCHITECTURE.md

## Where the docs live

- `SPEC.md`: MVP goals, non-goals, key decisions, acceptance criteria
- `ARCHITECTURE.md`: style, dependency rule, where logic lives (short; imported above)
- `docs/architecture-map.md`: full architecture map: stack, commands, module inventory, conventions, datastores, constraints
- `docs/bc-map.md`: bounded contexts, ubiquitous language, events and who listens to them
- `docs/adr/`: architecture decision records (`0001` modular monolith, `0002` persistence per context)
- `docs/features/<slug>/`: per-feature PRD, design and `tasks/tasks.json`; the scaffold plan is `docs/features/_scaffold/tasks/tasks.json`
- `src/modules/<context>/README.md`: why the context exists, glossary, events published and consumed
- `.claude/rules/`: path-scoped rules (`contribution.md`, `integrations.md`, `integrations-jira.md`, `money.md`)
- `.notes/decisions.md`: unconfirmed proposals, input for future PRDs (not conventions)

## Scaffold status

- Built: NestJS skeleton, five context modules, `GET /health`, env validation, Prisma per context, shared primitives, error envelope, lint boundaries, BullMQ + event bus wiring, CI.
- Deferred: scaffold task S9 (per-context outbox, relay job, consumer dedup). Until it exists, do not publish cross-context events; build S9 first in a session with Docker.
- Verified only with Docker (not yet run): `docker compose` health, `pnpm db:migrate`, `pnpm test:int`.
