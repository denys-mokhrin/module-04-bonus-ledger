import { Inject, Injectable } from '@nestjs/common';
import { CLOCK } from '../../../shared/clock';
import type { Clock } from '../../../shared/clock';
import { newId } from '../../../shared/ids';
import { TeamsRepo } from '../teams/teams.repo';
import { MEMBER_ROLES } from './member';
import type { CreateMemberInput, Member } from './member';
import {
  MemberDisplayNameRequiredError,
  MemberDisplayNameTakenError,
  MemberNotFoundError,
  MemberRoleInvalidError,
  MemberTeamUnknownError,
} from './member.errors';
import { MembersRepo } from './members.repo';

@Injectable()
export class MembersService {
  constructor(
    private readonly repo: MembersRepo,
    private readonly teams: TeamsRepo,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  /** displayNames are trimmed and unique per team (case-sensitive); the team must belong to the same company. */
  async create(input: CreateMemberInput): Promise<Member> {
    const displayName = input.displayName.trim();
    if (displayName === '') throw new MemberDisplayNameRequiredError();
    if (!MEMBER_ROLES.includes(input.role)) throw new MemberRoleInvalidError(input.role);

    const team = await this.teams.findById(input.teamId);
    if (!team || team.companyId !== input.companyId) throw new MemberTeamUnknownError(input.teamId);
    if (await this.repo.findByDisplayName(input.teamId, displayName)) throw new MemberDisplayNameTakenError(displayName);

    const member: Member = {
      id: newId(),
      companyId: input.companyId,
      teamId: input.teamId,
      displayName,
      role: input.role,
      createdAt: this.clock.now(),
    };
    await this.repo.insert(member);
    return member;
  }

  async get(id: string): Promise<Member> {
    const member = await this.repo.findById(id);
    if (!member) throw new MemberNotFoundError(id);
    return member;
  }
}
