-- jira-activity-import: import_alerts (staged; implement-tasks promotes into src/modules/integrations/db/migrations/)
CREATE TABLE IF NOT EXISTS integrations.import_alerts (
    id UUID PRIMARY KEY,
    connection_id UUID NOT NULL REFERENCES integrations.connections(id),
    kind VARCHAR(32) NOT NULL,
    subject_ref VARCHAR(128) NOT NULL,
    opened_at TIMESTAMPTZ NOT NULL,
    closed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_import_alerts_open ON integrations.import_alerts (connection_id, kind, subject_ref) WHERE closed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_import_alerts_open ON integrations.import_alerts (connection_id) WHERE closed_at IS NULL;
