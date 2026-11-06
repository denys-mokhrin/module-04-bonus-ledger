import { spawnSync } from 'node:child_process';
import { join, relative, sep } from 'node:path';

/**
 * Lint self-test: runs the real eslint.config.mjs over fixtures shaped like src/ and proves
 * that every forbidden import fails while the allowed ones pass. Uses the ESLint CLI because
 * ESLint 10 is ESM-only and Jest runs CommonJS.
 */
interface LintResult {
  filePath: string;
  messages: { ruleId: string | null; message: string }[];
}

const root = join(__dirname, '..', '..');
const fixtures = join(__dirname, 'fixtures', 'src');

function lintFixtures(): Map<string, string[]> {
  const run = spawnSync(
    process.execPath,
    [join(root, 'node_modules', 'eslint', 'bin', 'eslint.js'), '--no-ignore', '--format', 'json', fixtures],
    { cwd: root, encoding: 'utf8' },
  );
  if (!run.stdout) throw new Error(`eslint produced no output: ${run.stderr}`);
  const results = JSON.parse(run.stdout) as LintResult[];
  return new Map(
    results.map((r) => [
      relative(fixtures, r.filePath).split(sep).join('/'),
      r.messages.map((m) => m.ruleId ?? 'parse'),
    ]),
  );
}

describe('context boundaries lint (self-test)', () => {
  let rulesByFile: Map<string, string[]>;
  beforeAll(() => {
    rulesByFile = lintFixtures();
  }, 120_000);

  it.each([
    [
      '(a) a module imports another module non-public path',
      'modules/alpha/imports-internal.ts',
      'boundaries/dependencies',
    ],
    [
      '(b) a module imports another module generated Prisma client',
      'modules/alpha/imports-db-client.ts',
      'boundaries/dependencies',
    ],
    ['(c) src/shared imports src/modules', 'shared/imports-module.ts', 'boundaries/dependencies'],
    ['(d) an import cycle between modules', 'modules/gamma/public/index.ts', 'import-x/no-cycle'],
  ])('fails when %s', (_case, file, rule) => {
    expect(rulesByFile.get(file)).toContain(rule);
  });

  it('passes imports of own internals, modules/<other>/public/** and shared/**', () => {
    expect(rulesByFile.get('modules/alpha/allowed.ts')).toEqual([]);
    expect(rulesByFile.get('shared/ok.ts')).toEqual([]);
  });
});
