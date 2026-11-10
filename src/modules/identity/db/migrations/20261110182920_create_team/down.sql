-- Reverts 20261110182920_create_team of the identity context.
-- Dropping the table also drops its primary key and the (companyId, name) unique index.
--
-- Rollback (verified on Prisma 7.10.1, run with PRISMA_CONTEXT=identity and --config prisma.config.ts):
--   1. prisma db execute --file down.sql
--   2. remove the history row, so `pnpm db:migrate` can re-apply the migration later:
--        DELETE FROM "identity"."_prisma_migrations" WHERE migration_name = '20261110182920_create_team';
-- Note: `prisma migrate resolve --rolled-back` does NOT work here: it accepts only failed migrations (P3012).
DROP TABLE IF EXISTS "identity"."team";
