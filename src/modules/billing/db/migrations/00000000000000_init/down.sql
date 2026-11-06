-- Reverts 00000000000000_init of the billing context (drops the whole schema, including _prisma_migrations).
-- Apply: prisma db execute --file down.sql, then no "migrate resolve" is needed because the history is gone.
DROP SCHEMA IF EXISTS "billing" CASCADE;
