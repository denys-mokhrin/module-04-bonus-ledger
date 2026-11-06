import type { Config } from 'jest';

/**
 * `pnpm test:int`: integration and e2e specs against real Postgres and Redis.
 * Start them first: docker compose up -d postgres redis && pnpm db:migrate
 */
const config: Config = {
  rootDir: '..',
  displayName: 'int',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }] },
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  testMatch: ['<rootDir>/test/**/*.int-spec.ts', '<rootDir>/test/**/*.e2e-spec.ts'],
  setupFiles: ['<rootDir>/test/setup-env.ts'],
  testTimeout: 30_000,
};

export default config;
