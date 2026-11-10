-- Reverts 20261110201523_create_member of the identity context.
-- Dropping the table also drops its primary key, the (teamId, displayName) unique index
-- and the member_teamId_fkey foreign key to team; the team table itself is untouched.
-- The MemberRole enum is dropped after the table, because the role column depends on it.
--
-- Rollback (verified on Prisma 7.10.1, run with PRISMA_CONTEXT=identity and --config prisma.config.ts):
--   1. prisma db execute --file down.sql
--   2. remove the history row, so `pnpm db:migrate` can re-apply the migration later:
--        DELETE FROM "identity"."_prisma_migrations" WHERE migration_name = '20261110201523_create_member';
-- Note: `prisma migrate resolve --rolled-back` does NOT work here: it accepts only failed migrations (P3012).
DROP TABLE IF EXISTS "identity"."member";
DROP TYPE IF EXISTS "identity"."MemberRole";
