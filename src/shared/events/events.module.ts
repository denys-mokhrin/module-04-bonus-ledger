import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { OUTBOX_RELAY_QUEUE, OutboxRelay, OutboxRelayProcessor } from './outbox-relay';

/**
 * In-process domain event bus (@nestjs/event-emitter) plus the per-context outbox relay.
 * Needs the root BullMQ connection from JobsModule.
 */
@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({ wildcard: false, ignoreErrors: false }),
    BullModule.registerQueue({ name: OUTBOX_RELAY_QUEUE }),
  ],
  providers: [OutboxRelay, OutboxRelayProcessor],
  exports: [OutboxRelay],
})
export class EventsModule {}
