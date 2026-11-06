import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

/**
 * In-process domain event bus (@nestjs/event-emitter).
 * The per-context outbox and its relay job (scaffold task S9) are deferred:
 * until they exist, nothing may publish cross-context events.
 */
@Module({
  imports: [EventEmitterModule.forRoot({ wildcard: false, ignoreErrors: false })],
})
export class EventsModule {}
