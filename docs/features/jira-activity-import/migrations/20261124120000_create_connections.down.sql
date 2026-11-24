-- jira-activity-import: connections (staged; implement-tasks promotes into src/modules/integrations/db/migrations/)
DROP INDEX IF EXISTS integrations.idx_connections_company;
DROP INDEX IF EXISTS integrations.uq_connections_team;
DROP TABLE IF EXISTS integrations.connections;
