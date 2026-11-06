/**
 * Runs the Prisma CLI once per context (ADR 0002).
 *   pnpm db:generate                     generate all five clients (no database needed)
 *   pnpm db:migrate                      apply pending migrations of all five contexts
 *   pnpm db:migrate:dev <context> <name> create and apply a new migration for one context
 */
import { spawnSync } from 'node:child_process';
import { DB_CONTEXTS, findContext, type DbContext } from './db-contexts';

const prismaBin = require.resolve('prisma/build/index.js');

function prisma(context: DbContext, args: string[]): void {
  console.log(`\n[db] ${context.name}: prisma ${args.join(' ')}`);
  const result = spawnSync(process.execPath, [prismaBin, ...args, '--config', 'prisma.config.ts'], {
    stdio: 'inherit',
    env: { ...process.env, PRISMA_CONTEXT: context.name },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const [command, ...rest] = process.argv.slice(2);
switch (command) {
  case 'generate':
    for (const context of DB_CONTEXTS) prisma(context, ['generate']);
    break;
  case 'migrate':
    for (const context of DB_CONTEXTS) prisma(context, ['migrate', 'deploy']);
    break;
  case 'migrate:dev': {
    const [contextName, name] = rest;
    if (!name) {
      console.error('Usage: pnpm db:migrate:dev <context> <migration-name>');
      process.exit(1);
    }
    prisma(findContext(contextName), ['migrate', 'dev', '--name', name]);
    console.log('[db] Remember: add a hand-checked down.sql next to the new migration.sql.');
    break;
  }
  default:
    console.error('Usage: tsx scripts/db.ts <generate | migrate | migrate:dev <context> <name>>');
    process.exit(1);
}
