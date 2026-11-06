import { Module } from '@nestjs/common';
import { IntegrationsDb } from './db/client';

/** The integrations bounded context. Only app.module.ts imports this file; other contexts use ./public. */
@Module({
  providers: [IntegrationsDb],
})
export class IntegrationsModule {}
