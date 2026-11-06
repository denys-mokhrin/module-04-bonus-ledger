import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { APP_CONFIG, type AppConfig } from '../../../shared/config';
import { PrismaClient } from './generated/client';

export const BILLING_DB_SCHEMA = 'billing';

/** This context's Prisma client, bound to its own Postgres schema. Only repos (or infra/) use it. */
@Injectable()
export class BillingDb extends PrismaClient implements OnModuleDestroy {
  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    super({
      adapter: new PrismaPg({ connectionString: config.DATABASE_URL }, { schema: BILLING_DB_SCHEMA }),
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
