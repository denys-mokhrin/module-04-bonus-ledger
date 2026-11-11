# Changelog

All notable changes to Bonus Ledger are listed here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The `Unreleased` section is drafted by `pnpm release:notes` (see `scripts/release-notes.mjs`)
and reviewed by a person before it is committed.

## [Unreleased]

### Added

- `POST /teams` and `GET /teams/:id` to create and read a Team
- `POST /members` and `GET /members/:id` to create and read a Member
- `POST /reviewers` and `GET /reviewers/:id` to create and read a Reviewer

### Fixed

- Integration tests start with `--experimental-vm-modules` enabled

## [0.1.0] - 2026-11-06

### Added

- NestJS skeleton with one module per bounded context: identity, integrations, contribution, bonus-review, billing
- `GET /health` reporting Postgres and Redis
- Environment validation at start-up
- Prisma with one Postgres schema, client and migration history per context
- Shared primitives: ids, clock, money, error envelope, event bus and job wiring
- Lint rules that forbid imports across bounded contexts, with a self-test
- CI: typecheck, lint, unit and integration tests
