import { Module } from '@nestjs/common';
import { ContributionDb } from './infra/db/client';

/** The contribution bounded context. Only app.module.ts imports this file; other contexts use ./public. */
@Module({
  providers: [ContributionDb],
})
export class ContributionModule {}
