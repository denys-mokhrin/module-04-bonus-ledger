import { Module, type OnModuleInit } from '@nestjs/common';
import { OutboxRelay } from '../../shared/events';
import { BillingDb } from './db/client';

/** The billing bounded context. Only app.module.ts imports this file; other contexts use ./public. */
@Module({
  providers: [BillingDb],
})
export class BillingModule implements OnModuleInit {
  constructor(
    private readonly relay: OutboxRelay,
    private readonly db: BillingDb,
  ) {}

  onModuleInit(): void {
    this.relay.register({ schema: 'billing', db: this.db });
  }
}
