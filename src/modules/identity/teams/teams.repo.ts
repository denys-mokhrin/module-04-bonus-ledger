import { Injectable } from '@nestjs/common';
import { IdentityDb } from '../db/client';
import { Prisma } from '../db/generated/client';
import type { Team } from './team';
import { TeamNameTakenError } from './team.errors';

/** The only code that touches identity.team, through the identity context's own Prisma client. */
@Injectable()
export class TeamsRepo {
  constructor(private readonly db: IdentityDb) {}

  async insert(team: Team): Promise<void> {
    try {
      await this.db.team.create({ data: team });
    } catch (error) {
      // A concurrent create can pass the service's pre-check; the (companyId, name) unique index decides.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new TeamNameTakenError(team.name);
      }
      throw error;
    }
  }

  async findById(id: string): Promise<Team | null> {
    return this.db.team.findUnique({ where: { id } });
  }

  async findByName(companyId: string, name: string): Promise<Team | null> {
    return this.db.team.findUnique({ where: { companyId_name: { companyId, name } } });
  }
}
