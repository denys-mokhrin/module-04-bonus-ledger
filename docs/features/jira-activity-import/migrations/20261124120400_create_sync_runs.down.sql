-- jira-activity-import: sync_runs (staged; implement-tasks promotes into src/modules/integrations/db/migrations/)
DROP INDEX IF EXISTS integrations.idx_sync_runs_last_success;
DROP INDEX IF EXISTS integrations.uq_sync_runs_schedule;
DROP TABLE IF EXISTS integrations.sync_runs;
