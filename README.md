# Bonus Ledger

Bonus Ledger is a SaaS for team leads and HR that turns a team's Jira activity into transparent monthly bonus justifications. A team lead connects Jira, and the service imports issues, worklogs and closed sprints. It scores each member's contribution (story points, complexity, role, sprint capacity) and compares it with the team and with previous months. It then drafts a justification, which the team lead edits and HR approves and exports. Companies pay a monthly subscription per team.

Course project for Agentic Engineering 3.0, module 4: CLAUDE.md, Bounded Contexts map and repository scaffold.

- Boundaries map: [docs/bc-map.md](docs/bc-map.md)
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
- Specification: [SPEC.md](SPEC.md)
- Changelog: [docs/CHANGELOG.md](docs/CHANGELOG.md)
- Capstone log (module 5, a feature by hand vs with the `ledger-slice` plugin): [CAPSTONE_LOG.md](CAPSTONE_LOG.md)

## Release notes

`pnpm release:notes` drafts the `Unreleased` section of the changelog from the commits since the
last tag. It runs Claude Code headless (`claude -p`) with hard limits:

- tools: only `git log`, reading `docs/`, editing `docs/CHANGELOG.md`;
- `--max-turns` 10 (`RELEASE_NOTES_MAX_TURNS`), model `haiku` (`RELEASE_NOTES_MODEL`);
- the answer is a JSON object validated by `--json-schema` (`scripts/release-notes/schema.json`),
  and the script checks it again against the repository: every bullet is in the changelog, the
  released sections are untouched, no other file changed. A failed check restores the file.

The edit is a suggestion in the working tree: review `git diff docs/CHANGELOG.md`, then
`git add` it or `git restore` it. Nothing is committed, tagged or pushed.
`pnpm release:notes --check` is a dry run. Authentication: a local `claude auth login` session,
or `ANTHROPIC_API_KEY` from the environment; in CI it comes from a repository secret
(`.github/workflows/release-notes.yml`, started by hand).
