// @ts-check
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';
import importX from 'eslint-plugin-import-x';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import tseslint from 'typescript-eslint';

/**
 * Context boundaries (AGENTS.md §Architecture, ARCHITECTURE.md):
 * - a module may import its own files, any module's public/**, and src/shared/**;
 * - src/shared imports nothing from src/modules;
 * - no import cycles.
 * Patterns match from the right, so the lint self-test fixtures under test/lint/fixtures/src/** are
 * classified exactly like src/**. test/lint/boundaries.spec.ts proves each rule fails when broken.
 */
const sameContext = { captured: { context: '{{ from.element.captured.context }}' } };
const allowedFromModule = [
  { to: { element: { type: 'module', ...sameContext } } },
  { to: { element: { type: 'public' } } },
  { to: { element: { type: 'shared' } } },
];

export default tseslint.config(
  {
    ignores: ['dist/', 'coverage/', 'node_modules/', '**/generated/', 'test/lint/fixtures/'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: { parserOptions: { sourceType: 'module' } },
    plugins: { boundaries, 'import-x': importX },
    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver({ alwaysTryTypes: true })],
      'import/resolver': { typescript: { alwaysTryTypes: true } },
      // Without these, import-x skips .ts dependencies and no-cycle sees nothing.
      'import-x/extensions': ['.ts', '.js'],
      'import-x/parsers': { '@typescript-eslint/parser': ['.ts'] },
      'boundaries/elements': [
        { type: 'public', pattern: 'src/modules/*/public', capture: ['context'] },
        { type: 'module', pattern: 'src/modules/*', capture: ['context'] },
        { type: 'shared', pattern: 'src/shared' },
        // Composition root: src/*.ts (main.ts, app.module.ts, health.*). The nearest matching folder wins.
        { type: 'app', pattern: 'src' },
      ],
    },
    rules: {
      'import-x/no-cycle': ['error', { ignoreExternal: true }],
      'boundaries/dependencies': [
        'error',
        {
          default: 'allow',
          policies: [
            {
              from: { element: { type: 'shared' } },
              disallow: { to: { element: { types: ['module', 'public', 'app'] } } },
              message: 'src/shared must not import from src/modules (shared holds technical primitives only)',
            },
            {
              from: { element: { types: ['module', 'public'] } },
              disallow: { to: { element: { types: ['module', 'app'] } } },
              message:
                'Context "{{ from.element.captured.context }}" may import only its own files, other contexts\' public/ folders and src/shared',
            },
            ...['module', 'public'].map((type) => ({
              from: { element: { type } },
              allow: allowedFromModule,
            })),
          ],
        },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  prettier,
);
