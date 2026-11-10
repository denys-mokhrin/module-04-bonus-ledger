import { Injectable } from '@nestjs/common';
import { IdentityDb } from '../db/client';
import { Prisma } from '../db/generated/client';
import type { Reviewer } from './reviewer';
import { ReviewerEmailTakenError } from './reviewer.errors';

/** The only code that touches identity.reviewer, through the identity context's own Prisma client. */
@Injectable()
export class ReviewersRepo {
  constructor(private readonly db: IdentityDb) {}

  async insert(reviewer: Reviewer): Promise<void> {
    try {
      await this.db.reviewer.create({ data: reviewer });
    } catch (error) {
      // A concurrent create can pass the service's pre-check; the (companyId, email) unique index decides.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ReviewerEmailTakenError(reviewer.email);
      }
      throw error;
    }
  }

  async findById(id: string): Promise<Reviewer | null> {
    return this.db.reviewer.findUnique({ where: { id } });
  }

  /** Expects an already normalised (trimmed, lower-cased) email. */
  async findByEmail(companyId: string, email: string): Promise<Reviewer | null> {
    return this.db.reviewer.findUnique({ where: { companyId_email: { companyId, email } } });
  }
}
