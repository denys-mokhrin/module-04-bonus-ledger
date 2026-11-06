import type { Config } from 'jest';

/**
 * `pnpm test` runs everything that needs no Docker:
 *   unit  - src/**\/*.spec.ts, colocated with the code
 *   lint  - test/lint/**\/*.spec.ts, the boundaries lint self-test
 *   e2e   - test/**\/*.e2e-spec.ts, Supertest against AppModule with infra health checks stubbed
 * Specs that need Postgres/Redis (*.int-spec.ts) run with `pnpm test:int` (test/jest-int.config.ts).
 */
const common = {
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }] },
  // The generated Prisma clients import siblings as './x.js'; resolve them to the .ts sources.
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
} satisfies Config;

const config: Config = {
  projects: [
    { ...common, displayName: 'unit', testMatch: ['<rootDir>/src/**/*.spec.ts'] },
    { ...common, displayName: 'lint', testMatch: ['<rootDir>/test/lint/**/*.spec.ts'] },
    {
      ...common,
      displayName: 'e2e',
      testMatch: ['<rootDir>/test/**/*.e2e-spec.ts'],
      setupFiles: ['<rootDir>/test/setup-env.ts'],
    },
  ],
};

export default config;
