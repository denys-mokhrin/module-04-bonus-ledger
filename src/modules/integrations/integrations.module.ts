import { Module, type OnModuleInit } from '@nestjs/common';
import { OutboxRelay } from '../../shared/events';
import { IntegrationsDb } from './db/client';

/** The integrations bounded context. Only app.module.ts imports this file; other contexts use ./public. */
@Module({
  providers: [IntegrationsDb],
})
export class IntegrationsModule implements OnModuleInit {
  constructor(
    private readonly relay: OutboxRelay,
    private readonly db: IntegrationsDb,
  ) {}

  onModuleInit(): void {
    this.relay.register({ schema: 'integrations', db: this.db });
  }
}
