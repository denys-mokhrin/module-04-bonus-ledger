.PHONY: dev test test-int lint typecheck db-up db-down

# Aliases only: every command is a pnpm script (make is not installed on every dev machine).

# Start Postgres and Redis in Docker and the API in watch mode
dev: db-up
	pnpm start:dev

# Run the whole test suite that needs no Docker (unit, lint self-test, e2e)
test:
	pnpm test

# Integration tests against Postgres + Redis (needs db-up and pnpm db:migrate)
test-int:
	pnpm test:int

# ESLint, including the cross-context import rules (eslint-plugin-boundaries + no-cycle)
lint:
	pnpm lint

typecheck:
	pnpm typecheck

db-up:
	docker compose up -d postgres redis

db-down:
	docker compose down
