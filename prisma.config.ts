import { existsSync } from 'node:fs';
import { defineConfig } from 'prisma/config';
import { findContext, urlForSchema } from './scripts/db-contexts';

// One config for five contexts: scripts/db.ts sets PRISMA_CONTEXT for each Prisma CLI run (ADR 0002).
if (existsSync('.env')) process.loadEnvFile('.env');
const context = findContext(process.env.PRISMA_CONTEXT);
const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
  schema: `${context.dir}/schema.prisma`,
  migrations: { path: `${context.dir}/migrations` },
  // `prisma generate` needs no database; migrate commands fail with a clear message if the URL is missing.
  datasource: databaseUrl ? { url: urlForSchema(databaseUrl, context.schema) } : undefined,
});
