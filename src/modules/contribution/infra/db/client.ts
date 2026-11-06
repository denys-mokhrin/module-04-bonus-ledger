import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { APP_CONFIG, type AppConfig } from '../../../../shared/config';
import { PrismaClient } from './generated/client';

export const CONTRIBUTION_DB_SCHEMA = 'contribution';

/** This context's Prisma client, bound to its own Postgres schema. Only repos (or infra/) use it. */
@Injectable()
export class ContributionDb extends PrismaClient implements OnModuleDestroy {
  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    super({
      adapter: new PrismaPg({ connectionString: config.DATABASE_URL }, { schema: CONTRIBUTION_DB_SCHEMA }),
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
