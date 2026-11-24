-- jira-activity-import: sync_checkpoints (staged; implement-tasks promotes into src/modules/integrations/db/migrations/)
CREATE TABLE IF NOT EXISTS integrations.sync_checkpoints (
    id UUID PRIMARY KEY,
    connection_id UUID NOT NULL REFERENCES integrations.connections(id),
    jira_project_id VARCHAR(32) NOT NULL,
    period VARCHAR(7) NOT NULL,
    cursor_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_sync_checkpoints ON integrations.sync_checkpoints (connection_id, jira_project_id, period);
