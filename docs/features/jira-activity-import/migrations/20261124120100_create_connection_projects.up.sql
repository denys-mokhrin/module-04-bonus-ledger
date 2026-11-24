-- jira-activity-import: connection_projects (staged; implement-tasks promotes into src/modules/integrations/db/migrations/)
CREATE TABLE IF NOT EXISTS integrations.connection_projects (
    id UUID PRIMARY KEY,
    connection_id UUID NOT NULL REFERENCES integrations.connections(id),
    jira_project_id VARCHAR(32) NOT NULL,
    jira_project_key VARCHAR(32) NOT NULL,
    story_point_field_id VARCHAR(64) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_connection_projects ON integrations.connection_projects (connection_id, jira_project_id);
