import { BullModule, InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Queue, QueueEvents } from 'bullmq';
import { ConfigModule } from '../src/shared/config';
import { JobsModule } from '../src/shared/jobs';

// Needs docker compose up -d redis. Proves the root BullMQ connection works end to end.
const QUEUE = 'scaffold-smoke';

@Processor(QUEUE)
class NoopProcessor extends WorkerHost {
  async process(): Promise<string> {
    return 'done';
  }
}

@Injectable()
class SmokeQueue {
  constructor(@InjectQueue(QUEUE) readonly queue: Queue) {}
}

describe('BullMQ on Redis (int)', () => {
  let app: INestApplication;
  let events: QueueEvents;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule, JobsModule, BullModule.registerQueue({ name: QUEUE })],
      providers: [NoopProcessor, SmokeQueue],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    events = new QueueEvents(QUEUE, { connection: { url: process.env.REDIS_URL } });
    await events.waitUntilReady();
  });

  afterAll(async () => {
    await events.close();
    await app.close();
  });

  it('enqueues a no-op job and observes it completed', async () => {
    const job = await app.get(SmokeQueue).queue.add('noop', {});
    await expect(job.waitUntilFinished(events, 10_000)).resolves.toBe('done');
  });
});
