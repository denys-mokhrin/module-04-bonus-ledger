# Bonus Ledger

SaaS for team leads and HR: imports Jira activity, scores each member's monthly contribution and produces bonus justifications that HR approves. Modular monolith, one deployable.

## Stack

- TypeScript (strict), Node.js 22, NestJS 11
- PostgreSQL 16 via Prisma; one schema per bounded context (`identity`, `integrations`, `contribution`, `bonus_review`, `billing`)
- Jest for unit and integration tests, Supertest for HTTP
- pnpm (not npm, not yarn)

## Commands

- `make dev` — start Postgres in Docker and the API in watch mode (`pnpm start:dev`)
- `make test` — run all tests (`pnpm test`)
- Single test file: `pnpm test -- src/modules/contribution/...spec.ts`
- On Windows without `make`, run the pnpm commands directly.

## Conventions

- Code, identifiers, commits and docs in English; domain terms exactly as in `docs/bc-map.md` (e.g. `ContributionScore`, never `Rating` or `Points`).
- Money is integer minor units (`amountCents`) plus ISO currency code. Never floats.
- Dates are stored in UTC; a bonus period is a calendar month `YYYY-MM` in the company's timezone.
- Commits follow Conventional Commits: `feat(contribution): ...`.
- New behaviour starts with a failing test.
- Never put real Jira tokens, employee names or salaries in fixtures; use the factories in `test/factories`.

## Architecture

Feature-first modular monolith; each bounded context is a NestJS module in `src/modules/<context>/`.

Dependency rule:
- A context never imports another context's internals. Allowed cross-context imports: `src/modules/<other>/public/` (its facade and published event types) and `src/shared/` only.
- Contexts communicate through domain events (past tense, e.g. `SprintClosed`) on the in-process event bus; synchronous calls go only through the other context's public facade.
- No context reads another context's database schema.
- `src/shared/` holds technical primitives only (ids, clock, money, event bus) and contains no business rules.
- New context or new cross-context dependency → update `docs/bc-map.md` and add an ADR in `docs/adr/` first.

@ARCHITECTURE.md
