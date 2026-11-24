-- jira-activity-import: import_alerts (staged; implement-tasks promotes into src/modules/integrations/db/migrations/)
DROP INDEX IF EXISTS integrations.idx_import_alerts_open;
DROP INDEX IF EXISTS integrations.uq_import_alerts_open;
DROP TABLE IF EXISTS integrations.import_alerts;
