import { Module, type OnModuleInit } from '@nestjs/common';
import { OutboxRelay } from '../../shared/events';
import { IdentityDb } from './db/client';

/** The identity bounded context. Only app.module.ts imports this file; other contexts use ./public. */
@Module({
  providers: [IdentityDb],
})
export class IdentityModule implements OnModuleInit {
  constructor(
    private readonly relay: OutboxRelay,
    private readonly db: IdentityDb,
  ) {}

  onModuleInit(): void {
    this.relay.register({ schema: 'identity', db: this.db });
  }
}
