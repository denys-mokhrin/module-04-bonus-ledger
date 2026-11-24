import type { INestApplication } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { ContributionDb } from '../src/modules/contribution/infra/db/client';
import { IdentityDb } from '../src/modules/identity/db/client';
import { ConfigModule } from '../src/shared/config';
import {
  consumeOnce,
  type DomainEvent,
  EventsModule,
  OutboxRelay,
  writeToOutbox,
} from '../src/shared/events';
import { newId } from '../src/shared/ids';
import { JobsModule } from '../src/shared/jobs';

// Scaffold task S9 (docs/features/_scaffold/tasks/tasks.json). Needs:
//   docker compose up -d postgres redis && pnpm db:migrate
// Publisher in these specs: identity. Consumer: contribution.
const PUBLISHER = 'identity';
const CONSUMER = 'contribution';
const CONSUMER_NAME = 'outbox-spec-listener';

function testEvent(type: string): DomainEvent<{ note: string }> {
  return { eventId: newId(), type, occurredAt: new Date('2026-11-24T10:00:00.000Z'), payload: { note: 'test' } };
}

describe('per-context outbox: transactional write, relay, consumer dedup (int)', () => {
  let app: INestApplication;
  let identityDb: IdentityDb;
  let contributionDb: ContributionDb;
  let relay: OutboxRelay;
  let bus: EventEmitter2;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule, JobsModule, EventsModule],
      providers: [IdentityDb, ContributionDb],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    identityDb = app.get(IdentityDb);
    contributionDb = app.get(ContributionDb);
    relay = app.get(OutboxRelay);
    bus = app.get(EventEmitter2);
    relay.register({ schema: PUBLISHER, db: identityDb });
  });

  beforeEach(async () => {
    await identityDb.$executeRawUnsafe(`DELETE FROM "${PUBLISHER}".outbox`);
    await contributionDb.$executeRawUnsafe(`DELETE FROM "${CONSUMER}".processed_events`);
  });

  afterAll(async () => {
    await app.close();
  });

  /** Subscribes to one event type and collects what the bus delivers. */
  function listen(type: string): DomainEvent[] {
    const received: DomainEvent[] = [];
    bus.on(type, (event: DomainEvent) => received.push(event));
    return received;
  }

  async function outboxRows(eventId: string): Promise<number> {
    const rows = await identityDb.$queryRawUnsafe<{ n: bigint }[]>(
      `SELECT count(*) AS n FROM "${PUBLISHER}".outbox WHERE event_id = $1::uuid`,
      eventId,
    );
    return Number(rows[0]?.n);
  }

  it('an event written inside a committed transaction is relayed to a subscriber exactly once', async () => {
    const event = testEvent('OutboxSpecCommitted');
    const received = listen(event.type);

    await identityDb.$transaction(async (tx) => {
      await writeToOutbox(tx, PUBLISHER, event);
    });

    expect(await relay.relayOnce()).toBe(1);
    expect(received).toHaveLength(1);
    expect(received[0]).toEqual(event);

    // A second pass finds nothing left to publish.
    expect(await relay.relayOnce()).toBe(0);
    expect(received).toHaveLength(1);
  });

  it('writing the same eventId twice stores one outbox row', async () => {
    const event = testEvent('OutboxSpecDuplicateWrite');

    await identityDb.$transaction(async (tx) => {
      await writeToOutbox(tx, PUBLISHER, event);
    });
    await identityDb.$transaction(async (tx) => {
      await writeToOutbox(tx, PUBLISHER, event);
    });

    expect(await outboxRows(event.eventId)).toBe(1);
  });

  it('a rolled-back transaction leaves no outbox row and publishes nothing', async () => {
    const event = testEvent('OutboxSpecRolledBack');
    const received = listen(event.type);

    await expect(
      identityDb.$transaction(async (tx) => {
        await writeToOutbox(tx, PUBLISHER, event);
        throw new Error('business step failed');
      }),
    ).rejects.toThrow('business step failed');

    expect(await outboxRows(event.eventId)).toBe(0);
    expect(await relay.relayOnce()).toBe(0);
    expect(received).toHaveLength(0);
  });

  it('a redelivered event is ignored by the consumer', async () => {
    const event = testEvent('OutboxSpecRedelivered');
    let handled = 0;

    const first = await consumeOnce(contributionDb, CONSUMER, CONSUMER_NAME, event, async () => {
      handled += 1;
    });
    const second = await consumeOnce(contributionDb, CONSUMER, CONSUMER_NAME, event, async () => {
      handled += 1;
    });

    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(handled).toBe(1);
  });

  it('if the consumer handler fails, the event is not marked processed and is handled on redelivery', async () => {
    const event = testEvent('OutboxSpecHandlerFails');
    let handled = 0;

    await expect(
      consumeOnce(contributionDb, CONSUMER, CONSUMER_NAME, event, async () => {
        throw new Error('handler failed');
      }),
    ).rejects.toThrow('handler failed');

    const retried = await consumeOnce(contributionDb, CONSUMER, CONSUMER_NAME, event, async () => {
      handled += 1;
    });

    expect(retried).toBe(true);
    expect(handled).toBe(1);
  });

  it('the BullMQ relay job publishes pending outbox events', async () => {
    const event = testEvent('OutboxSpecViaJob');
    const received = listen(event.type);

    await identityDb.$transaction(async (tx) => {
      await writeToOutbox(tx, PUBLISHER, event);
    });

    const published = await relay.runRelayJob();

    expect(published).toBe(1);
    expect(received).toHaveLength(1);
    expect(received[0]?.eventId).toBe(event.eventId);
  });
});

describe('outbox wiring in the application (int)', () => {
  it('AppModule registers the outbox of all five contexts with the relay', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    const app = moduleRef.createNestApplication();
    await app.init();
    try {
      expect([...app.get(OutboxRelay).registeredSchemas()].sort()).toEqual(
        ['billing', 'bonus_review', 'contribution', 'identity', 'integrations'],
      );
    } finally {
      await app.close();
    }
  });
});
