-- jira-activity-import: jira_user_match_events (staged; implement-tasks promotes into src/modules/integrations/db/migrations/)
CREATE TABLE IF NOT EXISTS integrations.jira_user_match_events (
    id UUID PRIMARY KEY,
    jira_user_id UUID NOT NULL REFERENCES integrations.jira_users(id),
    action VARCHAR(16) NOT NULL,
    member_id UUID NULL,
    actor_member_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_jira_user_match_events_user ON integrations.jira_user_match_events (jira_user_id);
