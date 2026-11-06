import type { AppConfig } from '../../src/shared/config';
import { loadConfig } from '../../src/shared/config';
import { BillingDb } from '../../src/modules/billing/db/client';
import { BonusReviewDb } from '../../src/modules/bonus-review/db/client';
import { ContributionDb } from '../../src/modules/contribution/infra/db/client';
import { IdentityDb } from '../../src/modules/identity/db/client';
import { IntegrationsDb } from '../../src/modules/integrations/db/client';

// Verifies ADR 0002 on a migrated database: needs
//   docker compose up -d postgres && pnpm db:migrate
// Each context's client connects, and its schema holds its own migration history.
const clients = [
  ['identity', IdentityDb],
  ['integrations', IntegrationsDb],
  ['contribution', ContributionDb],
  ['bonus_review', BonusReviewDb],
  ['billing', BillingDb],
] as const;

describe('one Postgres schema and one Prisma client per context (int)', () => {
  const config: AppConfig = loadConfig(process.env);

  it.each(clients)('%s: client connects and the schema has its own _prisma_migrations', async (schema, Db) => {
    const db = new Db(config);
    try {
      const tables = await db.$queryRaw<{ n: bigint }[]>`
        SELECT count(*) AS n FROM information_schema.tables
        WHERE table_schema = ${schema} AND table_name = '_prisma_migrations'`;
      expect(Number(tables[0]?.n)).toBe(1);

      const applied = await db.$queryRawUnsafe<{ migration_name: string }[]>(
        `SELECT migration_name FROM "${schema}"._prisma_migrations WHERE finished_at IS NOT NULL`,
      );
      expect(applied.map((r) => r.migration_name)).toContain('00000000000000_init');
    } finally {
      await db.$disconnect();
    }
  });

  it('no context history leaked into public', async () => {
    const db = new IdentityDb(config);
    try {
      const rows = await db.$queryRaw<{ n: bigint }[]>`
        SELECT count(*) AS n FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = '_prisma_migrations'`;
      expect(Number(rows[0]?.n)).toBe(0);
    } finally {
      await db.$disconnect();
    }
  });
});
