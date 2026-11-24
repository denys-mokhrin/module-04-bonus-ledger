-- jira-activity-import: imported_issues (staged; implement-tasks promotes into src/modules/integrations/db/migrations/)
DROP INDEX IF EXISTS integrations.idx_imported_issues_project;
DROP INDEX IF EXISTS integrations.uq_imported_issues;
DROP TABLE IF EXISTS integrations.imported_issues;
