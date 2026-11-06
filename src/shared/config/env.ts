import { z } from 'zod';

/**
 * Environment variables the app needs at boot. Validated once, before Nest starts,
 * so a missing or malformed variable stops the process with a clear message.
 * Error messages name the variable, never its value (values can be secrets).
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  REDIS_URL: z.url({ protocol: /^rediss?$/ }),
});

export type AppConfig = z.infer<typeof envSchema>;

const expected: Record<keyof AppConfig, string> = {
  NODE_ENV: 'one of development | test | production',
  PORT: 'an integer port 1-65535',
  DATABASE_URL: 'a postgresql:// URL',
  REDIS_URL: 'a redis:// or rediss:// URL',
};

export class ConfigError extends Error {
  constructor(
    readonly variables: string[],
    message: string,
  ) {
    super(message);
    this.name = 'ConfigError';
  }
}

export function loadConfig(env: Record<string, string | undefined>): AppConfig {
  // Treat empty strings as missing, so `DATABASE_URL=` in .env fails like an absent variable.
  const cleaned = Object.fromEntries(Object.entries(env).filter(([, value]) => value !== undefined && value !== ''));
  const result = envSchema.safeParse(cleaned);
  if (result.success) return result.data;

  const problems = new Map<string, string>();
  for (const issue of result.error.issues) {
    const key = String(issue.path[0]) as keyof AppConfig;
    if (problems.has(key)) continue;
    const state = cleaned[key] === undefined ? 'is missing' : 'is malformed';
    problems.set(key, `  - ${key} ${state}: expected ${expected[key]}`);
  }
  throw new ConfigError(
    [...problems.keys()],
    `Invalid environment configuration:\n${[...problems.values()].join('\n')}\nSee .env.example.`,
  );
}
