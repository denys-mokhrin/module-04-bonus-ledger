import { Injectable } from '@nestjs/common';
import { IdentityDb } from '../db/client';
import { Prisma } from '../db/generated/client';
import type { Member } from './member';
import { MemberDisplayNameTakenError, MemberTeamUnknownError } from './member.errors';

/** The only code that touches identity.member, through the identity context's own Prisma client. */
@Injectable()
export class MembersRepo {
  constructor(private readonly db: IdentityDb) {}

  async insert(member: Member): Promise<void> {
    try {
      await this.db.member.create({ data: member });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // A concurrent create can pass the service's pre-check; the (teamId, displayName) unique index decides.
        if (error.code === 'P2002') throw new MemberDisplayNameTakenError(member.displayName);
        // The team was deleted between the service's check and the insert; member_teamId_fkey decides.
        if (error.code === 'P2003') throw new MemberTeamUnknownError(member.teamId);
      }
      throw error;
    }
  }

  async findById(id: string): Promise<Member | null> {
    return this.db.member.findUnique({ where: { id } });
  }

  async findByDisplayName(teamId: string, displayName: string): Promise<Member | null> {
    return this.db.member.findUnique({ where: { teamId_displayName: { teamId, displayName } } });
  }
}
