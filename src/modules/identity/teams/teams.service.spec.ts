import { Test } from '@nestjs/testing';
import { CLOCK, FixedClock } from '../../../shared/clock';
import { newId } from '../../../shared/ids';
import type { Team } from './team';
import { TeamNameRequiredError, TeamNameTakenError, TeamNotFoundError } from './team.errors';
import { TeamsRepo } from './teams.repo';
import { TeamsService } from './teams.service';

const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** In-memory stand-in for the Prisma-backed repo: same methods, no database. */
class InMemoryTeamsRepo {
  readonly rows: Team[] = [];

  async insert(team: Team): Promise<void> {
    this.rows.push({ ...team });
  }

  async findById(id: string): Promise<Team | null> {
    return this.rows.find((t) => t.id === id) ?? null;
  }

  async findByName(companyId: string, name: string): Promise<Team | null> {
    return this.rows.find((t) => t.companyId === companyId && t.name === name) ?? null;
  }
}

describe('TeamsService', () => {
  const now = new Date('2026-11-10T09:30:00.000Z');
  let service: TeamsService;
  let repo: InMemoryTeamsRepo;
  const companyId = newId();

  beforeEach(async () => {
    repo = new InMemoryTeamsRepo();
    const moduleRef = await Test.createTestingModule({
      providers: [
        TeamsService,
        { provide: TeamsRepo, useValue: repo },
        { provide: CLOCK, useValue: new FixedClock(now) },
      ],
    }).compile();
    service = moduleRef.get(TeamsService);
  });

  describe('create', () => {
    it('creates a team with an app-generated UUIDv7 id and createdAt from the Clock', async () => {
      const leadMemberId = newId();

      const team = await service.create({ companyId, name: 'Platform', leadMemberId });

      expect(team).toEqual({ id: expect.stringMatching(UUID_V7), companyId, name: 'Platform', leadMemberId, createdAt: now });
      expect(repo.rows).toEqual([team]);
    });

    it('stores leadMemberId as null when it is not given', async () => {
      const team = await service.create({ companyId, name: 'Platform' });

      expect(team.leadMemberId).toBeNull();
    });

    it('trims the name', async () => {
      const team = await service.create({ companyId, name: '  Platform  ' });

      expect(team.name).toBe('Platform');
    });

    it.each([
      ['empty', ''],
      ['whitespace only', '   '],
    ])('rejects an %s name with TEAM_NAME_REQUIRED', async (_case, name) => {
      const attempt = service.create({ companyId, name });

      await expect(attempt).rejects.toBeInstanceOf(TeamNameRequiredError);
      await expect(attempt).rejects.toMatchObject({ code: 'TEAM_NAME_REQUIRED', httpStatus: 400 });
      expect(repo.rows).toHaveLength(0);
    });

    it('rejects a duplicate name inside the same company with TEAM_NAME_TAKEN', async () => {
      await service.create({ companyId, name: 'Platform' });

      const attempt = service.create({ companyId, name: 'Platform' });

      await expect(attempt).rejects.toBeInstanceOf(TeamNameTakenError);
      await expect(attempt).rejects.toMatchObject({ code: 'TEAM_NAME_TAKEN', httpStatus: 409 });
      expect(repo.rows).toHaveLength(1);
    });

    it('treats a name that differs only by surrounding spaces as a duplicate', async () => {
      await service.create({ companyId, name: 'Platform' });

      await expect(service.create({ companyId, name: ' Platform ' })).rejects.toBeInstanceOf(TeamNameTakenError);
    });

    it('allows the same name in a different company', async () => {
      await service.create({ companyId, name: 'Platform' });

      const other = await service.create({ companyId: newId(), name: 'Platform' });

      expect(other.name).toBe('Platform');
      expect(repo.rows).toHaveLength(2);
    });
  });

  describe('get', () => {
    it('returns a stored team by id', async () => {
      const created = await service.create({ companyId, name: 'Platform' });

      await expect(service.get(created.id)).resolves.toEqual(created);
    });

    it('rejects an unknown id with TEAM_NOT_FOUND', async () => {
      const attempt = service.get(newId());

      await expect(attempt).rejects.toBeInstanceOf(TeamNotFoundError);
      await expect(attempt).rejects.toMatchObject({ code: 'TEAM_NOT_FOUND', httpStatus: 404 });
    });
  });
});
