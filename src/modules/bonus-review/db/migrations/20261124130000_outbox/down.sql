-- Reverts 20261124130000_outbox of the bonus-review context.
-- Apply: prisma db execute --file down.sql, then "prisma migrate resolve --rolled-back 20261124130000_outbox".
DROP TABLE IF EXISTS "bonus_review".processed_events;
DROP INDEX IF EXISTS "bonus_review".outbox_unpublished_created_at_idx;
DROP TABLE IF EXISTS "bonus_review".outbox;
