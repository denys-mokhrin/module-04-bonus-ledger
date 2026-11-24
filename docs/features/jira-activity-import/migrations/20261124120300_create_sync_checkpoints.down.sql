-- jira-activity-import: sync_checkpoints (staged; implement-tasks promotes into src/modules/integrations/db/migrations/)
DROP INDEX IF EXISTS integrations.uq_sync_checkpoints;
DROP TABLE IF EXISTS integrations.sync_checkpoints;
