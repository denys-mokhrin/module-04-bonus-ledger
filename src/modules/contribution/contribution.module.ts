import { Module, type OnModuleInit } from '@nestjs/common';
import { OutboxRelay } from '../../shared/events';
import { ContributionDb } from './infra/db/client';

/** The contribution bounded context. Only app.module.ts imports this file; other contexts use ./public. */
@Module({
  providers: [ContributionDb],
})
export class ContributionModule implements OnModuleInit {
  constructor(
    private readonly relay: OutboxRelay,
    private readonly db: ContributionDb,
  ) {}

  onModuleInit(): void {
    this.relay.register({ schema: 'contribution', db: this.db });
  }
}
