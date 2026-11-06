import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { APP_CONFIG, type AppConfig } from './shared/config';

export type DependencyStatus = 'up' | 'down';

/** Connects lazily on the first check, with short timeouts, so a down dependency never blocks boot. */
@Injectable()
export class PostgresHealth implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.pool = new Pool({ connectionString: config.DATABASE_URL, max: 1, connectionTimeoutMillis: 1000 });
  }

  async check(): Promise<DependencyStatus> {
    try {
      await this.pool.query('SELECT 1');
      return 'up';
    } catch {
      return 'down';
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}

@Injectable()
export class RedisHealth implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.client = new Redis(config.REDIS_URL, {
      lazyConnect: true,
      connectTimeout: 1000,
      maxRetriesPerRequest: 0,
      enableOfflineQueue: false,
      retryStrategy: () => null,
    });
    this.client.on('error', () => undefined); // reported through check(), not as unhandled events
  }

  async check(): Promise<DependencyStatus> {
    try {
      if (this.client.status === 'wait' || this.client.status === 'end') await this.client.connect();
      return (await this.client.ping()) === 'PONG' ? 'up' : 'down';
    } catch {
      return 'down';
    }
  }

  onModuleDestroy(): void {
    this.client.disconnect();
  }
}
