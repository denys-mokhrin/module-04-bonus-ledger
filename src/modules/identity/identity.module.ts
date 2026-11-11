import { Module } from '@nestjs/common';
import { IdentityDb } from './db/client';
import { TeamsController } from './teams/teams.controller';
import { TeamsRepo } from './teams/teams.repo';
import { TeamsService } from './teams/teams.service';

/** The identity bounded context. Only app.module.ts imports this file; other contexts use ./public. */
@Module({
  controllers: [TeamsController],
  providers: [IdentityDb, TeamsRepo, TeamsService],
})
export class IdentityModule {}
