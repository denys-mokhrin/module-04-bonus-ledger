-- jira-activity-import: jira_users (staged; implement-tasks promotes into src/modules/integrations/db/migrations/)
DROP INDEX IF EXISTS integrations.uq_jira_users;
DROP INDEX IF EXISTS integrations.uq_jira_users_member;
DROP TABLE IF EXISTS integrations.jira_users;
