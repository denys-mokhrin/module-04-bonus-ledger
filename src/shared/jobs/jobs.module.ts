import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { APP_CONFIG, type AppConfig } from '../config';

/**
 * Root BullMQ connection. Contexts register their own queues and processors with
 * BullModule.registerQueue(...) inside their module; no queue is defined here,
 * so nothing connects to Redis until a context registers a queue.
 */
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [APP_CONFIG],
      // BullMQ workers require maxRetriesPerRequest: null.
      useFactory: (config: AppConfig) => ({ connection: { url: config.REDIS_URL, maxRetriesPerRequest: null } }),
    }),
  ],
  exports: [BullModule],
})
export class JobsModule {}
