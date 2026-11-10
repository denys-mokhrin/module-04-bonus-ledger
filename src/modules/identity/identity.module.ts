import { Module } from '@nestjs/common';
import { IdentityDb } from './db/client';
import { MembersController } from './members/members.controller';
import { MembersRepo } from './members/members.repo';
import { MembersService } from './members/members.service';
import { TeamsController } from './teams/teams.controller';
import { TeamsRepo } from './teams/teams.repo';
import { TeamsService } from './teams/teams.service';

/** The identity bounded context. Only app.module.ts imports this file; other contexts use ./public. */
@Module({
  controllers: [TeamsController, MembersController],
  providers: [IdentityDb, TeamsRepo, TeamsService, MembersRepo, MembersService],
})
export class IdentityModule {}
