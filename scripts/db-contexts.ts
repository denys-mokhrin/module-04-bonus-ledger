/**
 * The five persistence contexts (ADR 0002), in the fixed order db:migrate applies them.
 * `dir` is the folder holding schema.prisma and migrations/.
 */
export const DB_CONTEXTS = [
  { name: 'identity', schema: 'identity', dir: 'src/modules/identity/db' },
  { name: 'integrations', schema: 'integrations', dir: 'src/modules/integrations/db' },
  { name: 'contribution', schema: 'contribution', dir: 'src/modules/contribution/infra/db' },
  { name: 'bonus-review', schema: 'bonus_review', dir: 'src/modules/bonus-review/db' },
  { name: 'billing', schema: 'billing', dir: 'src/modules/billing/db' },
] as const;

export type DbContext = (typeof DB_CONTEXTS)[number];

export function findContext(name: string | undefined): DbContext {
  const found = DB_CONTEXTS.find((c) => c.name === name || c.schema === name);
  if (!found) {
    throw new Error(`Unknown context "${name}". Expected one of: ${DB_CONTEXTS.map((c) => c.name).join(', ')}`);
  }
  return found;
}

/** DATABASE_URL with ?schema=<context schema>, so _prisma_migrations lives in that schema. */
export function urlForSchema(databaseUrl: string, schema: string): string {
  const url = new URL(databaseUrl);
  url.searchParams.set('schema', schema);
  return url.toString();
}
