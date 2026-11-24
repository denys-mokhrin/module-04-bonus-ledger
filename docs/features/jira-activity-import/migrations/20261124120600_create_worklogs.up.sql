-- jira-activity-import: worklogs (staged; implement-tasks promotes into src/modules/integrations/db/migrations/)
CREATE TABLE IF NOT EXISTS integrations.worklogs (
    id UUID PRIMARY KEY,
    connection_id UUID NOT NULL REFERENCES integrations.connections(id),
    imported_issue_id UUID NOT NULL REFERENCES integrations.imported_issues(id),
    jira_worklog_id VARCHAR(32) NOT NULL,
    author_account_id VARCHAR(128) NOT NULL,
    work_date DATE NOT NULL,
    duration_seconds INTEGER NOT NULL,
    content_hash CHAR(64) NOT NULL,
    version INTEGER NOT NULL,
    withdrawn_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_worklogs ON integrations.worklogs (connection_id, jira_worklog_id);
CREATE INDEX IF NOT EXISTS idx_worklogs_issue ON integrations.worklogs (imported_issue_id);
CREATE INDEX IF NOT EXISTS idx_worklogs_period ON integrations.worklogs (connection_id, work_date);
CREATE INDEX IF NOT EXISTS idx_worklogs_author ON integrations.worklogs (connection_id, author_account_id);
