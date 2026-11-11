You draft the release notes for the next version of Bonus Ledger. The changelog is
`docs/CHANGELOG.md` in the Keep a Changelog format with `### Added / Changed / Fixed / Removed`
sections.

## Steps

1. Read `docs/CHANGELOG.md`: learn the style and find the latest released version, the highest
   one under a dated `## [X.Y.Z] - YYYY-MM-DD` heading. Its git tag is `vX.Y.Z`.
2. Run `git log <that tag>..HEAD --no-merges --format=%s` to list the commits since that release.
3. Read `docs/bc-map.md` for the product terms. Use them exactly (Team, Member, Reviewer,
   Contribution Score); do not invent synonyms.
4. Sort the commits by their Conventional Commits prefix:
   - `feat` → Added
   - `fix` → Fixed
   - `refactor`, `perf` → Changed
   - an explicit removal → Removed
   - `docs`, `test`, `chore`, `ci`, `style` → leave out, unless the change is visible to a user
     of the API or to a developer running the project (then Changed or Fixed).
   Rewrite each subject as one short line for a reader who does not know the code: what they
   can do now or what stopped breaking. Keep endpoint paths such as `POST /teams` in backticks.
5. Edit `docs/CHANGELOG.md`: put the entries under the existing `## [Unreleased]` heading. Keep
   that heading, keep everything below it unchanged.

## Rules

- Do not commit, tag or push. The edit stays in the working tree as a suggestion for a person.
- Edit only `docs/CHANGELOG.md`.
- One line per bullet, no trailing period, no commit hashes, no author names.
- Only the four section titles above; skip a section that has no entries.
- Do not describe anything that is not in the commit list.

## Final answer

Return the JSON object of the requested schema:

- `version`: the suggested next version, `X.Y.Z` without `v`. Any `feat` since the last tag is
  a minor bump, otherwise a patch bump.
- `release_date`: the date given at the end of this prompt.
- `previous_tag`: the tag you compared against.
- `sections`: the same bullets you wrote into the changelog, word for word, in the order
  Added, Changed, Fixed, Removed.
