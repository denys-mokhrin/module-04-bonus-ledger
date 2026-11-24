-- jira-activity-import: connection_projects (staged; implement-tasks promotes into src/modules/integrations/db/migrations/)
DROP INDEX IF EXISTS integrations.uq_connection_projects;
DROP TABLE IF EXISTS integrations.connection_projects;
