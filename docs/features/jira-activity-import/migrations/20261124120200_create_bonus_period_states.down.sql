-- jira-activity-import: bonus_period_states (staged; implement-tasks promotes into src/modules/integrations/db/migrations/)
DROP INDEX IF EXISTS integrations.uq_bonus_period_states;
DROP TABLE IF EXISTS integrations.bonus_period_states;
