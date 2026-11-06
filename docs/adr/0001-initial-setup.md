# ADR 0001: Initial setup — feature-first modular monolith

- Status: Accepted
- Date: 2026-11-06

## Context

Bonus Ledger has five bounded contexts (`docs/bc-map.md`): Identity & Teams, Jira Integration, Contribution Scoring, Bonus Review and Billing. It is built by one developer together with Claude Code. Most of the code will be written by an agent, so the boundaries must be visible in the file system and checkable by tools, not just documented.

## Decision

- **One deployable NestJS app, organised feature-first:** `src/modules/<context>/` per context, plus `src/shared/` for technical primitives.
- **Dependency rule:** other contexts may import only a module's `public/` folder. Contexts talk through past-tense domain events. Each context owns its own Postgres schema.
- **Stack:** TypeScript strict, Node.js 22, NestJS, PostgreSQL 16 + Prisma, Jest, pnpm, Redis + BullMQ for jobs.
- **Developer entry points:** `make dev` and `make test`. Configuration comes from environment variables listed in `.env.example`.

## Alternatives considered

- **Flat structure:** simplest, but with 15+ entities the Jira mapping, the scoring rules and billing would mix in the same folders. Claude would cross boundaries without noticing.
- **Hexagonal in every context:** strong isolation, but too much ceremony for CRUD contexts with a solo developer.
- **Microservices:** separate deploys, network calls and distributed data, without a team or load that justifies them.

## Consequences

- Boundaries are enforced by a lint rule and by path-specific rules in `.claude/rules/`.
- Extracting a context into its own service later means replacing the in-process bus with a broker. Other modules' code does not change.
- Reporting across contexts must use events or read models, not SQL joins.
