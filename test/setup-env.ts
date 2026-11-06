import { existsSync } from 'node:fs';

// Tests read .env if present (local docker compose), else fall back to the compose defaults.
// These are throwaway local-dev values, never real credentials.
if (existsSync('.env')) process.loadEnvFile('.env');
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??= 'postgresql://bonus_ledger:bonus_ledger@localhost:5432/bonus_ledger';
process.env.REDIS_URL ??= 'redis://localhost:6379';
