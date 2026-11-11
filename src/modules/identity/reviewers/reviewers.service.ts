import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { CLOCK } from '../../../shared/clock';
import type { Clock } from '../../../shared/clock';
import { newId } from '../../../shared/ids';
import type { CreateReviewerInput, Reviewer } from './reviewer';
import {
  ReviewerDisplayNameRequiredError,
  ReviewerEmailInvalidError,
  ReviewerEmailTakenError,
  ReviewerNotFoundError,
} from './reviewer.errors';
import { ReviewersRepo } from './reviewers.repo';

const emailFormat = z.email();

@Injectable()
export class ReviewersService {
  constructor(
    private readonly repo: ReviewersRepo,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  /** Display names are trimmed; emails are trimmed, lower-cased and unique per company. */
  async create(input: CreateReviewerInput): Promise<Reviewer> {
    const displayName = input.displayName.trim();
    if (displayName === '') throw new ReviewerDisplayNameRequiredError();
    const email = input.email.trim().toLowerCase();
    if (!emailFormat.safeParse(email).success) throw new ReviewerEmailInvalidError();
    if (await this.repo.findByEmail(input.companyId, email)) throw new ReviewerEmailTakenError(email);

    const reviewer: Reviewer = {
      id: newId(),
      companyId: input.companyId,
      displayName,
      email,
      createdAt: this.clock.now(),
    };
    await this.repo.insert(reviewer);
    return reviewer;
  }

  async get(id: string): Promise<Reviewer> {
    const reviewer = await this.repo.findById(id);
    if (!reviewer) throw new ReviewerNotFoundError(id);
    return reviewer;
  }
}
