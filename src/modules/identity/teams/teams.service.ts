import { Inject, Injectable } from '@nestjs/common';
import { CLOCK } from '../../../shared/clock';
import type { Clock } from '../../../shared/clock';
import { newId } from '../../../shared/ids';
import type { CreateTeamInput, Team } from './team';
import { TeamNameRequiredError, TeamNameTakenError, TeamNotFoundError } from './team.errors';
import { TeamsRepo } from './teams.repo';

@Injectable()
export class TeamsService {
  constructor(
    private readonly repo: TeamsRepo,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  /** Names are trimmed and unique per company (case-sensitive). */
  async create(input: CreateTeamInput): Promise<Team> {
    const name = input.name.trim();
    if (name === '') throw new TeamNameRequiredError();
    if (await this.repo.findByName(input.companyId, name)) throw new TeamNameTakenError(name);

    const team: Team = {
      id: newId(),
      companyId: input.companyId,
      name,
      leadMemberId: input.leadMemberId ?? null,
      createdAt: this.clock.now(),
    };
    await this.repo.insert(team);
    return team;
  }

  async get(id: string): Promise<Team> {
    const team = await this.repo.findById(id);
    if (!team) throw new TeamNotFoundError(id);
    return team;
  }
}
