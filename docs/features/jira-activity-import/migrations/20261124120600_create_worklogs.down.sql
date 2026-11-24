-- jira-activity-import: worklogs (staged; implement-tasks promotes into src/modules/integrations/db/migrations/)
DROP INDEX IF EXISTS integrations.idx_worklogs_issue;
DROP INDEX IF EXISTS integrations.idx_worklogs_period;
DROP INDEX IF EXISTS integrations.idx_worklogs_author;
DROP INDEX IF EXISTS integrations.uq_worklogs;
DROP TABLE IF EXISTS integrations.worklogs;
