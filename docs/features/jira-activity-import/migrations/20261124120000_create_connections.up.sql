-- jira-activity-import: connections (staged; implement-tasks promotes into src/modules/integrations/db/migrations/)
CREATE TABLE IF NOT EXISTS integrations.connections (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL,
    team_id UUID NOT NULL,
    jira_site_id VARCHAR(64) NOT NULL,
    jira_site_url TEXT NOT NULL,
    encrypted_refresh_token BYTEA NOT NULL,
    authorised_by_member_id UUID NOT NULL,
    authorised_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_connections_team ON integrations.connections (team_id);
CREATE INDEX IF NOT EXISTS idx_connections_company ON integrations.connections (company_id);
