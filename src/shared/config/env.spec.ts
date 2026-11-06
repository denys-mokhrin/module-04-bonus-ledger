import { ConfigError, loadConfig } from './env';

const valid = {
  DATABASE_URL: 'postgresql://app:fake-password@localhost:5432/bonus_ledger',
  REDIS_URL: 'redis://localhost:6379',
};

function errorOf(env: Record<string, string | undefined>): ConfigError {
  try {
    loadConfig(env);
  } catch (e) {
    if (e instanceof ConfigError) return e;
    throw e;
  }
  throw new Error('expected loadConfig to throw');
}

describe('loadConfig', () => {
  it('accepts a valid environment and applies defaults', () => {
    expect(loadConfig(valid)).toEqual({ ...valid, NODE_ENV: 'development', PORT: 3000 });
  });

  it.each([
    ['DATABASE_URL', 'missing', { REDIS_URL: valid.REDIS_URL }],
    ['DATABASE_URL', 'missing', { ...valid, DATABASE_URL: '' }],
    ['DATABASE_URL', 'malformed', { ...valid, DATABASE_URL: 'not a url' }],
    ['DATABASE_URL', 'malformed', { ...valid, DATABASE_URL: 'mysql://localhost/db' }],
    ['REDIS_URL', 'missing', { DATABASE_URL: valid.DATABASE_URL }],
    ['REDIS_URL', 'malformed', { ...valid, REDIS_URL: 'http://localhost:6379' }],
  ])('refuses %s when it is %s', (variable, state, env) => {
    const error = errorOf(env);
    expect(error.variables).toEqual([variable]);
    expect(error.message).toContain(`${variable} is ${state}`);
  });

  it('reports every bad variable at once', () => {
    expect(errorOf({}).variables).toEqual(['DATABASE_URL', 'REDIS_URL']);
  });

  it('never echoes a variable value in the message', () => {
    const error = errorOf({ ...valid, DATABASE_URL: 'mysql://user:s3cret-token@host/db' });
    expect(error.message).not.toContain('s3cret-token');
  });
});
