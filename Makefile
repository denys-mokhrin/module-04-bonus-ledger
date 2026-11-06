.PHONY: dev test db-up db-down

# Start Postgres in Docker and the API in watch mode
dev: db-up
	pnpm start:dev

# Run the whole test suite
test:
	pnpm test

db-up:
	docker compose up -d postgres

db-down:
	docker compose down
