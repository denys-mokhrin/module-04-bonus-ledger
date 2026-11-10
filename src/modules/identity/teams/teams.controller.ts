import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../../shared/validation';
import type { Team } from './team';
import { TeamsService } from './teams.service';

const createTeamBody = z.object({
  // Temporary: the tenant comes from the request body until auth exists; auth will supply companyId instead.
  companyId: z.uuid(),
  name: z.string().trim().min(1),
  leadMemberId: z.uuid().nullish(),
});

@Controller('teams')
export class TeamsController {
  constructor(private readonly teams: TeamsService) {}

  @Post()
  @HttpCode(201)
  create(@Body(new ZodValidationPipe(createTeamBody)) body: z.output<typeof createTeamBody>): Promise<Team> {
    return this.teams.create(body);
  }

  @Get(':id')
  get(@Param('id', new ZodValidationPipe(z.uuid())) id: string): Promise<Team> {
    return this.teams.get(id);
  }
}
