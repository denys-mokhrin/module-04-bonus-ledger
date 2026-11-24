-- Reverts 20261124130000_outbox of the identity context.
-- Apply: prisma db execute --file down.sql, then "prisma migrate resolve --rolled-back 20261124130000_outbox".
DROP TABLE IF EXISTS "identity".processed_events;
DROP INDEX IF EXISTS "identity".outbox_unpublished_created_at_idx;
DROP TABLE IF EXISTS "identity".outbox;
