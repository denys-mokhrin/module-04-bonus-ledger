import { Module } from '@nestjs/common';
import { BonusReviewDb } from './db/client';

/** The bonus-review bounded context. Only app.module.ts imports this file; other contexts use ./public. */
@Module({
  providers: [BonusReviewDb],
})
export class BonusReviewModule {}
