-- jira-activity-import: sync_runs (staged; implement-tasks promotes into src/modules/integrations/db/migrations/)
CREATE TABLE IF NOT EXISTS integrations.sync_runs (
    id UUID PRIMARY KEY,
    connection_id UUID NOT NULL REFERENCES integrations.connections(id),
    period VARCHAR(7) NOT NULL,
    kind VARCHAR(16) NOT NULL,
    scheduled_for DATE NOT NULL,
    status VARCHAR(16) NOT NULL,
    failure_reason VARCHAR(64) NULL,
    started_at TIMESTAMPTZ NOT NULL,
    finished_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_sync_runs_schedule ON integrations.sync_runs (connection_id, kind, period, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_sync_runs_last_success ON integrations.sync_runs (connection_id, status, finished_at DESC);
