# Architecture

## Pattern

Feature-first **modular monolith** on NestJS: one deployable, one PostgreSQL database. There is one module per bounded context (see `docs/bc-map.md`):

```
src/
  modules/
    identity/        Identity & Teams
    integrations/    Jira Integration (anti-corruption layer)
    contribution/    Contribution Scoring (core domain)
    bonus-review/    Bonus Review
    billing/         Billing
  shared/            ids, clock, money, event bus — no business rules
  main.ts            composition root
```

Inside a module, code is grouped by feature (`scoring/`, `baseline/`, …). Each module exposes one `public/` folder that holds its facade service and its published event types.

## Dependency rule

1. `modules/A` may import from `modules/B/public/**` and from `shared/**`, and from nothing else in another module.
2. `shared/` imports nothing from `modules/`.
3. Each context owns its own Postgres schema. Cross-schema joins and foreign keys are forbidden. A context references other contexts' data only by id.
4. Integration between contexts is event-first: a publisher emits a past-tense domain event on the in-process bus, and subscribers keep their own read model. A synchronous facade call is allowed only for queries that need fresh data.
5. Types, field names and HTTP clients of an external system (Jira, GitHub, …) live only in its anti-corruption layer inside `integrations/`. Other contexts see only product terms from `docs/bc-map.md`.

The rule will be enforced by `eslint-plugin-boundaries` in CI (module 5). A cyclic dependency between modules fails the build.

## Runtime

- API: NestJS HTTP (REST, OpenAPI generated in module 6).
- Jobs: Jira sync and scoring run as queued jobs (BullMQ on Redis), triggered by schedule and by events.
- Event bus: `@nestjs/event-emitter` in process, with an outbox table per context, so that events survive restarts.

## Growth path

When a module needs to scale independently, its events go to a real broker, and the module can be extracted without changing other modules' code. Contribution Scoring is the first candidate for internal hexagonal layering.
