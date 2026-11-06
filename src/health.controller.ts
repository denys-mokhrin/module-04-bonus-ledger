import { Controller, Get } from '@nestjs/common';
import { PostgresHealth, RedisHealth, type DependencyStatus } from './health.indicators';

export interface HealthReport {
  status: 'ok' | 'degraded';
  checks: { postgres: DependencyStatus; redis: DependencyStatus };
}

/** Liveness: always 200 while the process serves HTTP; the body reports Postgres and Redis. */
@Controller('health')
export class HealthController {
  constructor(
    private readonly postgres: PostgresHealth,
    private readonly redis: RedisHealth,
  ) {}

  @Get()
  async get(): Promise<HealthReport> {
    const [postgres, redis] = await Promise.all([this.postgres.check(), this.redis.check()]);
    return { status: postgres === 'up' && redis === 'up' ? 'ok' : 'degraded', checks: { postgres, redis } };
  }
}
