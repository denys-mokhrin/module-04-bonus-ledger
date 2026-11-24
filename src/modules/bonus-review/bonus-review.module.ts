import { Module, type OnModuleInit } from '@nestjs/common';
import { OutboxRelay } from '../../shared/events';
import { BonusReviewDb } from './db/client';

/** The bonus-review bounded context. Only app.module.ts imports this file; other contexts use ./public. */
@Module({
  providers: [BonusReviewDb],
})
export class BonusReviewModule implements OnModuleInit {
  constructor(
    private readonly relay: OutboxRelay,
    private readonly db: BonusReviewDb,
  ) {}

  onModuleInit(): void {
    this.relay.register({ schema: 'bonus_review', db: this.db });
  }
}
