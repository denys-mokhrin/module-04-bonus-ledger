import { Test } from '@nestjs/testing';
import { CLOCK, FixedClock } from '../../../shared/clock';
import { newId } from '../../../shared/ids';
import type { Reviewer } from './reviewer';
import {
  ReviewerDisplayNameRequiredError,
  ReviewerEmailInvalidError,
  ReviewerEmailTakenError,
  ReviewerNotFoundError,
} from './reviewer.errors';
import { ReviewersRepo } from './reviewers.repo';
import { ReviewersService } from './reviewers.service';

const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** In-memory stand-in for the Prisma-backed repo: same methods, no database. */
class InMemoryReviewersRepo {
  readonly rows: Reviewer[] = [];

  async insert(reviewer: Reviewer): Promise<void> {
    this.rows.push({ ...reviewer });
  }

  async findById(id: string): Promise<Reviewer | null> {
    return this.rows.find((r) => r.id === id) ?? null;
  }

  async findByEmail(companyId: string, email: string): Promise<Reviewer | null> {
    return this.rows.find((r) => r.companyId === companyId && r.email === email) ?? null;
  }
}

describe('ReviewersService', () => {
  const now = new Date('2026-11-10T09:30:00.000Z');
  let service: ReviewersService;
  let repo: InMemoryReviewersRepo;
  const companyId = newId();

  beforeEach(async () => {
    repo = new InMemoryReviewersRepo();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ReviewersService,
        { provide: ReviewersRepo, useValue: repo },
        { provide: CLOCK, useValue: new FixedClock(now) },
      ],
    }).compile();
    service = moduleRef.get(ReviewersService);
  });

  describe('create', () => {
    it('creates a reviewer with an app-generated UUIDv7 id and createdAt from the Clock', async () => {
      const reviewer = await service.create({ companyId, displayName: 'HR Reviewer', email: 'hr@example.com' });

      expect(reviewer).toEqual({
        id: expect.stringMatching(UUID_V7),
        companyId,
        displayName: 'HR Reviewer',
        email: 'hr@example.com',
        createdAt: now,
      });
      expect(repo.rows).toEqual([reviewer]);
    });

    it('trims the display name', async () => {
      const reviewer = await service.create({ companyId, displayName: '  HR Reviewer  ', email: 'hr@example.com' });

      expect(reviewer.displayName).toBe('HR Reviewer');
    });

    it('trims and lower-cases the email', async () => {
      const reviewer = await service.create({ companyId, displayName: 'HR Reviewer', email: '  HR.Lead@Example.COM ' });

      expect(reviewer.email).toBe('hr.lead@example.com');
    });

    it.each([
      ['empty', ''],
      ['whitespace only', '   '],
    ])('rejects an %s display name with REVIEWER_DISPLAY_NAME_REQUIRED', async (_case, displayName) => {
      const attempt = service.create({ companyId, displayName, email: 'hr@example.com' });

      await expect(attempt).rejects.toBeInstanceOf(ReviewerDisplayNameRequiredError);
      await expect(attempt).rejects.toMatchObject({ code: 'REVIEWER_DISPLAY_NAME_REQUIRED', httpStatus: 400 });
      expect(repo.rows).toHaveLength(0);
    });

    it.each([
      ['empty', ''],
      ['whitespace only', '   '],
      ['without @', 'hr.example.com'],
      ['without domain', 'hr@'],
    ])('rejects an email %s with REVIEWER_EMAIL_INVALID', async (_case, email) => {
      const attempt = service.create({ companyId, displayName: 'HR Reviewer', email });

      await expect(attempt).rejects.toBeInstanceOf(ReviewerEmailInvalidError);
      await expect(attempt).rejects.toMatchObject({ code: 'REVIEWER_EMAIL_INVALID', httpStatus: 400 });
      expect(repo.rows).toHaveLength(0);
    });

    it('rejects a duplicate email inside the same company with REVIEWER_EMAIL_TAKEN', async () => {
      await service.create({ companyId, displayName: 'HR Reviewer', email: 'hr@example.com' });

      const attempt = service.create({ companyId, displayName: 'Other Reviewer', email: 'hr@example.com' });

      await expect(attempt).rejects.toBeInstanceOf(ReviewerEmailTakenError);
      await expect(attempt).rejects.toMatchObject({ code: 'REVIEWER_EMAIL_TAKEN', httpStatus: 409 });
      expect(repo.rows).toHaveLength(1);
    });

    it('treats an email that differs only by case or surrounding spaces as a duplicate', async () => {
      await service.create({ companyId, displayName: 'HR Reviewer', email: 'hr@example.com' });

      await expect(
        service.create({ companyId, displayName: 'HR Reviewer', email: ' HR@Example.com ' }),
      ).rejects.toBeInstanceOf(ReviewerEmailTakenError);
    });

    it('allows the same email in a different company', async () => {
      await service.create({ companyId, displayName: 'HR Reviewer', email: 'hr@example.com' });

      const other = await service.create({ companyId: newId(), displayName: 'HR Reviewer', email: 'hr@example.com' });

      expect(other.email).toBe('hr@example.com');
      expect(repo.rows).toHaveLength(2);
    });
  });

  describe('get', () => {
    it('returns a stored reviewer by id', async () => {
      const created = await service.create({ companyId, displayName: 'HR Reviewer', email: 'hr@example.com' });

      await expect(service.get(created.id)).resolves.toEqual(created);
    });

    it('rejects an unknown id with REVIEWER_NOT_FOUND', async () => {
      const attempt = service.get(newId());

      await expect(attempt).rejects.toBeInstanceOf(ReviewerNotFoundError);
      await expect(attempt).rejects.toMatchObject({ code: 'REVIEWER_NOT_FOUND', httpStatus: 404 });
    });
  });
});
