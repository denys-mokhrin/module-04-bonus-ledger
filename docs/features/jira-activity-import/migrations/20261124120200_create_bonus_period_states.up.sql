-- jira-activity-import: bonus_period_states (staged; implement-tasks promotes into src/modules/integrations/db/migrations/)
CREATE TABLE IF NOT EXISTS integrations.bonus_period_states (
    id UUID PRIMARY KEY,
    team_id UUID NOT NULL,
    period VARCHAR(7) NOT NULL,
    state VARCHAR(16) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_bonus_period_states ON integrations.bonus_period_states (team_id, period);
