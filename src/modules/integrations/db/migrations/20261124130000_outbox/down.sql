-- Reverts 20261124130000_outbox of the integrations context.
-- Apply: prisma db execute --file down.sql, then "prisma migrate resolve --rolled-back 20261124130000_outbox".
DROP TABLE IF EXISTS "integrations".processed_events;
DROP INDEX IF EXISTS "integrations".outbox_unpublished_created_at_idx;
DROP TABLE IF EXISTS "integrations".outbox;
