-- jira-activity-import: jira_users (staged; implement-tasks promotes into src/modules/integrations/db/migrations/)
CREATE TABLE IF NOT EXISTS integrations.jira_users (
    id UUID PRIMARY KEY,
    connection_id UUID NOT NULL REFERENCES integrations.connections(id),
    jira_account_id VARCHAR(128) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    email VARCHAR(320) NULL,
    member_id UUID NULL,
    not_on_team BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_jira_users ON integrations.jira_users (connection_id, jira_account_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_jira_users_member ON integrations.jira_users (connection_id, member_id);
