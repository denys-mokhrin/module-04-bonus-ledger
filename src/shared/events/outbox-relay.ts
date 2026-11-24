import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Queue, QueueEvents } from 'bullmq';
import { type DomainEvent, quoteSchema, type RawExecutor } from './outbox';

export const OUTBOX_RELAY_QUEUE = 'outbox-relay';
const BATCH_SIZE = 100;
const RELAY_EVERY_MS = 2000;
const JOB_TIMEOUT_MS = 30_000;

interface OutboxRow {
  event_id: string;
  event_type: string;
  payload: unknown;
  occurred_at: Date;
}

export interface RelayTx extends RawExecutor {
  $queryRawUnsafe<T = unknown>(query: string, ...values: unknown[]): Promise<T>;
}

/** A context's db client, as far as the relay needs it. */
export interface RelayDb {
  $transaction<R>(fn: (tx: RelayTx) => Promise<R>): Promise<R>;
}

export interface RelaySource {
  schema: string;
  db: RelayDb;
}

/** Publishes unpublished outbox rows of every registered context on the in-process bus. */
@Injectable()
export class OutboxRelay implements OnApplicationBootstrap {
  private readonly sources = new Map<string, RelaySource>();

  constructor(
    private readonly bus: EventEmitter2,
    @InjectQueue(OUTBOX_RELAY_QUEUE) private readonly queue: Queue,
  ) {}

  register(source: RelaySource): void {
    quoteSchema(source.schema);
    this.sources.set(source.schema, source);
  }

  registeredSchemas(): string[] {
    return [...this.sources.keys()];
  }

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.NODE_ENV === 'test') return;
    await this.queue.upsertJobScheduler('outbox-relay-schedule', { every: RELAY_EVERY_MS }, { name: 'relay' });
  }

  /** One relay pass over all registered contexts; returns how many events were published. */
  async relayOnce(): Promise<number> {
    let published = 0;
    for (const { schema, db } of this.sources.values()) {
      const table = `${quoteSchema(schema)}.outbox`;
      published += await db.$transaction(async (tx) => {
        const rows = await tx.$queryRawUnsafe<OutboxRow[]>(
          `SELECT event_id, event_type, payload, occurred_at FROM ${table}
           WHERE published_at IS NULL ORDER BY created_at, event_id
           LIMIT ${BATCH_SIZE} FOR UPDATE SKIP LOCKED`,
        );
        for (const row of rows) {
          const event: DomainEvent = {
            eventId: row.event_id,
            type: row.event_type,
            occurredAt: new Date(row.occurred_at),
            payload: row.payload,
          };
          await this.bus.emitAsync(event.type, event);
          await tx.$executeRawUnsafe(`UPDATE ${table} SET published_at = now() WHERE event_id = $1::uuid`, row.event_id);
        }
        return rows.length;
      });
    }
    return published;
  }

  /** Enqueues one relay job and waits for its result. */
  async runRelayJob(): Promise<number> {
    const events = new QueueEvents(OUTBOX_RELAY_QUEUE, { connection: this.queue.opts.connection });
    try {
      await events.waitUntilReady();
      const job = await this.queue.add('relay', {}, { removeOnComplete: true, removeOnFail: true });
      return (await job.waitUntilFinished(events, JOB_TIMEOUT_MS)) as number;
    } finally {
      await events.close();
    }
  }
}

@Processor(OUTBOX_RELAY_QUEUE)
export class OutboxRelayProcessor extends WorkerHost {
  constructor(private readonly relay: OutboxRelay) {
    super();
  }

  async process(): Promise<number> {
    return this.relay.relayOnce();
  }
}
