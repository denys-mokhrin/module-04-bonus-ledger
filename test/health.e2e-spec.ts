import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PostgresHealth, RedisHealth, type DependencyStatus } from '../src/health.indicators';

// Smoke test: the whole AppModule boots and serves /health. Infra checks are stubbed,
// so this runs without Docker; test/health.int-spec.ts checks the real dependencies.
async function bootWith(postgres: DependencyStatus, redis: DependencyStatus): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PostgresHealth)
    .useValue({ check: async () => postgres })
    .overrideProvider(RedisHealth)
    .useValue({ check: async () => redis })
    .compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
}

describe('GET /health (e2e)', () => {
  let app: INestApplication | undefined;
  afterEach(async () => app?.close());

  it('returns 200 and ok when Postgres and Redis are up', async () => {
    app = await bootWith('up', 'up');
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body).toEqual({ status: 'ok', checks: { postgres: 'up', redis: 'up' } });
  });

  it('still returns 200 but reports degraded when a dependency is down', async () => {
    app = await bootWith('up', 'down');
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body).toEqual({ status: 'degraded', checks: { postgres: 'up', redis: 'down' } });
  });
});
