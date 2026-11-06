import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { HealthController } from './health.controller';
import { PostgresHealth, RedisHealth } from './health.indicators';
import { BillingModule } from './modules/billing/billing.module';
import { BonusReviewModule } from './modules/bonus-review/bonus-review.module';
import { ContributionModule } from './modules/contribution/contribution.module';
import { IdentityModule } from './modules/identity/identity.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { ClockModule } from './shared/clock';
import { ConfigModule } from './shared/config';
import { DomainExceptionFilter } from './shared/errors';
import { EventsModule } from './shared/events';
import { JobsModule } from './shared/jobs';

/** The five bounded contexts from docs/bc-map.md. Adding one needs a bc-map update and an ADR first. */
export const CONTEXT_MODULES = [
  IdentityModule,
  IntegrationsModule,
  ContributionModule,
  BonusReviewModule,
  BillingModule,
];

/** Composition root: technical infrastructure from src/shared plus the context modules. */
@Module({
  imports: [ConfigModule, ClockModule, EventsModule, JobsModule, ...CONTEXT_MODULES],
  controllers: [HealthController],
  providers: [PostgresHealth, RedisHealth, { provide: APP_FILTER, useClass: DomainExceptionFilter }],
})
export class AppModule {}
