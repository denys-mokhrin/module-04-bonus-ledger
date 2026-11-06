import { Module } from '@nestjs/common';
import { BillingDb } from './db/client';

/** The billing bounded context. Only app.module.ts imports this file; other contexts use ./public. */
@Module({
  providers: [BillingDb],
})
export class BillingModule {}
