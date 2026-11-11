#!/usr/bin/env node
/**
 * Drafts the "Unreleased" section of docs/CHANGELOG.md from the commits since the last tag.
 *
 *   pnpm release:notes            draft the section, print the JSON summary and the diff
 *   pnpm release:notes --check    same, then restore the file (dry run for CI)
 *
 * It runs Claude Code headless (`claude -p`) as a small pipeline with hard limits:
 *   - tools: only `git log`, reading `docs/`, editing `docs/CHANGELOG.md`;
 *   - `--max-turns` as a budget guard (RELEASE_NOTES_MAX_TURNS, default 10);
 *   - `--output-format json --json-schema`: the answer is a validated object, not prose;
 *   - the script checks the result again itself and never commits, tags or pushes.
 * The edit stays in the working tree as a suggestion: `git diff docs/CHANGELOG.md` to review,
 * `git restore docs/CHANGELOG.md` to reject.
 *
 * Authentication: a local `claude auth login` session, or ANTHROPIC_API_KEY from the
 * environment (in CI: a repository secret). The key is never read from a file or printed.
 */
/* global console, process */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const CHANGELOG = 'docs/CHANGELOG.md';
const MAX_TURNS = process.env.RELEASE_NOTES_MAX_TURNS ?? '10';
const MODEL = process.env.RELEASE_NOTES_MODEL ?? 'haiku';
const check = process.argv.includes('--check');

const fail = (message, detail) => {
  console.error(`release-notes: ${message}`);
  if (detail) console.error(detail);
  process.exit(1);
};
const git = (...args) => {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  if (result.status !== 0) fail(`git ${args.join(' ')} failed`, result.stderr);
  return result.stdout.trim();
};

// --- pre-flight -------------------------------------------------------------------------------
const tag = spawnSync('git', ['describe', '--tags', '--abbrev=0'], { encoding: 'utf8' }).stdout.trim();
if (!tag) fail('no git tag found; release notes need a previous release to compare against');
const commits = git('log', `${tag}..HEAD`, '--no-merges', '--format=%s');
if (!commits) fail(`no commits since ${tag}; nothing to describe`);
if (git('diff', '--name-only', '--', CHANGELOG)) {
  fail(`${CHANGELOG} has unstaged changes; stage, commit or restore it first`);
}
const before = readFileSync(CHANGELOG, 'utf8');
if (!/^## \[Unreleased\]\s*$/m.test(before)) fail(`${CHANGELOG} has no "## [Unreleased]" heading`);
const statusBefore = git('status', '--porcelain');

// --- run the agent ----------------------------------------------------------------------------
const schema = JSON.parse(readFileSync(join(here, 'release-notes', 'schema.json'), 'utf8'));
const today = new Date().toISOString().slice(0, 10);
const prompt = `${readFileSync(join(here, 'release-notes', 'prompt.md'), 'utf8')}\nToday is ${today}.\n`;

const run = spawnSync(
  'claude',
  [
    '-p',
    '--model', MODEL,
    '--max-turns', MAX_TURNS,
    '--allowed-tools', 'Bash(git log *)', 'Read(docs/**)', `Edit(${CHANGELOG})`,
    '--output-format', 'json',
    '--json-schema', JSON.stringify(schema),
  ],
  { input: prompt, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
);
if (run.error) fail('could not start the claude CLI; is it installed and on PATH?', run.error.message);
// Whatever went wrong from here on, a half-made edit must not stay in the working tree.
const reject = (message, detail) => {
  git('restore', '--', CHANGELOG);
  fail(`${message}; ${CHANGELOG} restored`, detail);
};

let parsed;
try {
  parsed = JSON.parse(run.stdout);
} catch {
  reject(`claude exited with code ${run.status} and did not return JSON`, (run.stderr || run.stdout).slice(0, 2000));
}
// Newer CLI versions return an array of messages, older ones a single result object.
const result = Array.isArray(parsed) ? parsed.findLast((message) => message.type === 'result') : parsed;
if (!result) reject('no result message in the claude output');
if (result.subtype === 'error_max_turns') {
  reject(`the agent did not finish within --max-turns ${MAX_TURNS}`, 'Raise RELEASE_NOTES_MAX_TURNS only after checking why it needs more.');
}
if (run.status !== 0) reject(`claude exited with code ${run.status} (${result.subtype})`, (result.errors ?? []).join('\n'));
console.error(
  `release-notes: model=${MODEL} turns=${result.num_turns}/${MAX_TURNS} ` +
    `duration=${result.duration_ms}ms cost=$${result.total_cost_usd} is_error=${result.is_error}`,
);
if (result.is_error) reject(`the agent stopped with an error (${result.subtype})`, String(result.result ?? ''));

let notes = result.structured_output;
if (!notes && typeof result.result === 'string') {
  try {
    notes = JSON.parse(result.result);
  } catch {
    /* handled below */
  }
}
if (!notes) reject('the agent returned no structured output');

// --- verify: do not trust the answer, check it against the repository --------------------------
const problems = [];
if (!/^\d+\.\d+\.\d+$/.test(notes.version ?? '')) problems.push(`version "${notes.version}" is not X.Y.Z`);
if (notes.release_date !== today) problems.push(`release_date "${notes.release_date}" is not ${today}`);
if (notes.previous_tag !== tag) problems.push(`previous_tag "${notes.previous_tag}" is not ${tag}`);
const titles = ['Added', 'Changed', 'Fixed', 'Removed'];
if (!Array.isArray(notes.sections) || notes.sections.length === 0) problems.push('no sections');
for (const section of notes.sections ?? []) {
  if (!titles.includes(section.title)) problems.push(`unknown section "${section.title}"`);
}

const after = readFileSync(CHANGELOG, 'utf8');
if (after === before) problems.push(`${CHANGELOG} was not edited`);
const [head, ...rest] = after.split(/^## \[Unreleased\]\s*$/m);
const unreleased = (rest.join('') ?? '').split(/^## \[/m)[0];
for (const section of notes.sections ?? []) {
  for (const item of section.items ?? []) {
    if (!unreleased.includes(item)) problems.push(`bullet is in the JSON but not in the changelog: "${item}"`);
  }
}
const released = (text) => text.slice(text.search(/^## \[\d/m));
if (released(after) !== released(before)) problems.push('a released section of the changelog was changed');
if (head !== before.split(/^## \[Unreleased\]\s*$/m)[0]) problems.push('the changelog header was changed');

const changed = git('status', '--porcelain')
  .split('\n')
  .filter((line) => line && !statusBefore.split('\n').includes(line));
const foreign = changed.filter((line) => !line.endsWith(CHANGELOG));
if (foreign.length) problems.push(`files other than ${CHANGELOG} changed: ${foreign.join(', ')}`);

// --- report -----------------------------------------------------------------------------------
console.log(JSON.stringify(notes, null, 2));
console.error(`\n--- suggested edit (git diff -- ${CHANGELOG}) ---`);
console.error(git('diff', '--', CHANGELOG));
console.error('--- end ---');

if (check || problems.length) git('restore', '--', CHANGELOG);
if (problems.length) {
  fail(`the suggestion was rejected and ${CHANGELOG} restored:`, problems.map((p) => `  - ${p}`).join('\n'));
}
console.error(
  check
    ? `release-notes: check passed, ${CHANGELOG} restored (dry run).`
    : `release-notes: suggestion left in the working tree. Accept: git add ${CHANGELOG}. Reject: git restore ${CHANGELOG}.`,
);
