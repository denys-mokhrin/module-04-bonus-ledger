-- jira-activity-import: jira_user_match_events (staged; implement-tasks promotes into src/modules/integrations/db/migrations/)
DROP INDEX IF EXISTS integrations.idx_jira_user_match_events_user;
DROP TABLE IF EXISTS integrations.jira_user_match_events;
