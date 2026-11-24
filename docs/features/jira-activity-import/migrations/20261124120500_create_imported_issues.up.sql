-- jira-activity-import: imported_issues (staged; implement-tasks promotes into src/modules/integrations/db/migrations/)
CREATE TABLE IF NOT EXISTS integrations.imported_issues (
    id UUID PRIMARY KEY,
    connection_id UUID NOT NULL REFERENCES integrations.connections(id),
    jira_issue_id VARCHAR(32) NOT NULL,
    jira_issue_key VARCHAR(32) NOT NULL,
    jira_project_id VARCHAR(32) NOT NULL,
    issue_type VARCHAR(64) NOT NULL,
    story_points NUMERIC(8,2) NULL,
    assignee_account_id VARCHAR(128) NULL,
    resolved_at TIMESTAMPTZ NULL,
    status_history JSONB NOT NULL,
    content_hash CHAR(64) NOT NULL,
    version INTEGER NOT NULL,
    withdrawn_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_imported_issues ON integrations.imported_issues (connection_id, jira_issue_id);
CREATE INDEX IF NOT EXISTS idx_imported_issues_project ON integrations.imported_issues (connection_id, jira_project_id);
