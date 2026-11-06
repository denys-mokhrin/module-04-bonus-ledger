# Architecture

Full map (stack, conventions, datastores, precedents): [docs/architecture-map.md](docs/architecture-map.md). Decisions: [docs/adr/](docs/adr/).

## Style

Feature-first **modular monolith** on NestJS 11: one deployable, one PostgreSQL 16 database, one module per bounded context (`docs/bc-map.md`):

```
src/
  modules/
    identity/        Identity & Teams
    integrations/    Jira Integration (anti-corruption layer)
    contribution/    Contribution Scoring (core domain)
    bonus-review/    Bonus Review (schema bonus_review)
    billing/         Billing
  shared/            config, ids, clock, money, errors, events, jobs: no business rules
  app.module.ts      composition root: imports the five <context>.module.ts files
  main.ts            entry point: validates env, boots Nest
```

Each module exposes one `public/` folder (its facade service and published event types) and owns `db/` (`contribution`: `infra/db/`) with its own `schema.prisma`, generated client and migration history.

## Dependency rule

1. `modules/A` may import from `modules/B/public/**` and from `shared/**`, and from nothing else in another module (including B's generated Prisma client).
2. `shared/` imports nothing from `modules/`.
3. No import cycles between modules.
4. Each context owns its own Postgres schema. Cross-schema joins and foreign keys are forbidden. A context references other contexts' data only by id.
5. Integration between contexts is event-first: a publisher emits a past-tense domain event on the in-process bus, and subscribers keep their own read model. A synchronous facade call is allowed only for queries that need fresh data.
6. Types, field names and HTTP clients of an external system (Jira, GitHub, …) live only in its anti-corruption layer inside `integrations/`. Other contexts see only product terms from `docs/bc-map.md`.

Rules 1–3 are enforced by `pnpm lint` (`eslint-plugin-boundaries` + `import-x/no-cycle`) from the scaffold on, with a self-test in `test/lint/`. CI runs it on every push.

## Where logic lives

| Kind of logic | Place |
|---|---|
| HTTP handlers, event listeners | `src/modules/<context>/<feature>/*.controller.ts`, `*.listener.ts` |
| Use cases, workflow rules | `<feature>/*.service.ts` (`contribution`: `app/`) |
| Scoring rules (pure, versioned) | `src/modules/contribution/domain/` |
| Database access | `<feature>/*.repo.ts` (`contribution`: `infra/`), only via the context's own client |
| Jira DTOs, field ids, HTTP client | `src/modules/integrations/jira/` |
| Facade for other contexts, event types | `src/modules/<context>/public/` |
| Technical primitives | `src/shared/` |
| Wiring | `src/app.module.ts`, `src/main.ts` |

## Runtime

- API: NestJS HTTP (REST); `GET /health` reports Postgres and Redis. Errors use one envelope `{ error: { code, message } }`.
- Jobs: Jira sync, scoring and the outbox relay run as BullMQ jobs on Redis, triggered by schedule and by events.
- Event bus: `@nestjs/event-emitter` in process, with an outbox table per context so events survive restarts (outbox: scaffold task S9, not built yet).

## Growth path

When a module needs to scale independently, its events go to a real broker, and the module can be extracted without changing other modules' code. Contribution Scoring is the first candidate for internal hexagonal layering.
