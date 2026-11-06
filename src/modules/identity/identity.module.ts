import { Module } from '@nestjs/common';
import { IdentityDb } from './db/client';

/** The identity bounded context. Only app.module.ts imports this file; other contexts use ./public. */
@Module({
  providers: [IdentityDb],
})
export class IdentityModule {}
