-- Reverts 20261124130000_outbox of the contribution context.
-- Apply: prisma db execute --file down.sql, then "prisma migrate resolve --rolled-back 20261124130000_outbox".
DROP TABLE IF EXISTS "contribution".processed_events;
DROP INDEX IF EXISTS "contribution".outbox_unpublished_created_at_idx;
DROP TABLE IF EXISTS "contribution".outbox;
