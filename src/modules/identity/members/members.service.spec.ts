import { Test } from '@nestjs/testing';
import { CLOCK, FixedClock } from '../../../shared/clock';
import { newId } from '../../../shared/ids';
import type { Team } from '../teams/team';
import { TeamsRepo } from '../teams/teams.repo';
import type { Member, MemberRole } from './member';
import {
  MemberDisplayNameRequiredError,
  MemberDisplayNameTakenError,
  MemberNotFoundError,
  MemberRoleInvalidError,
  MemberTeamUnknownError,
} from './member.errors';
import { MembersRepo } from './members.repo';
import { MembersService } from './members.service';

const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** In-memory stand-in for the Prisma-backed repo: same methods, no database. */
class InMemoryMembersRepo {
  readonly rows: Member[] = [];

  async insert(member: Member): Promise<void> {
    this.rows.push({ ...member });
  }

  async findById(id: string): Promise<Member | null> {
    return this.rows.find((m) => m.id === id) ?? null;
  }

  async findByDisplayName(teamId: string, displayName: string): Promise<Member | null> {
    return this.rows.find((m) => m.teamId === teamId && m.displayName === displayName) ?? null;
  }
}

/** Only the TeamsRepo method the members service uses. */
class InMemoryTeamsRepo {
  readonly rows: Team[] = [];

  async findById(id: string): Promise<Team | null> {
    return this.rows.find((t) => t.id === id) ?? null;
  }
}

describe('MembersService', () => {
  const now = new Date('2026-11-10T09:30:00.000Z');
  let service: MembersService;
  let repo: InMemoryMembersRepo;
  let teams: InMemoryTeamsRepo;
  const companyId = newId();
  let teamId: string;

  function addTeam(owner: string): string {
    const id = newId();
    teams.rows.push({ id, companyId: owner, name: `Team ${id}`, leadMemberId: null, createdAt: now });
    return id;
  }

  beforeEach(async () => {
    repo = new InMemoryMembersRepo();
    teams = new InMemoryTeamsRepo();
    const moduleRef = await Test.createTestingModule({
      providers: [
        MembersService,
        { provide: MembersRepo, useValue: repo },
        { provide: TeamsRepo, useValue: teams },
        { provide: CLOCK, useValue: new FixedClock(now) },
      ],
    }).compile();
    service = moduleRef.get(MembersService);
    teamId = addTeam(companyId);
  });

  describe('create', () => {
    it('creates a member with an app-generated UUIDv7 id and createdAt from the Clock', async () => {
      const member = await service.create({ companyId, teamId, displayName: 'Dev One', role: 'Dev' });

      expect(member).toEqual({
        id: expect.stringMatching(UUID_V7),
        companyId,
        teamId,
        displayName: 'Dev One',
        role: 'Dev',
        createdAt: now,
      });
      expect(repo.rows).toEqual([member]);
    });

    it.each(['Dev', 'QA', 'Lead', 'PM'] as const)('accepts the role %s', async (role) => {
      const member = await service.create({ companyId, teamId, displayName: `Person ${role}`, role });

      expect(member.role).toBe(role);
    });

    it('trims the displayName', async () => {
      const member = await service.create({ companyId, teamId, displayName: '  Dev One  ', role: 'Dev' });

      expect(member.displayName).toBe('Dev One');
    });

    it.each([
      ['empty', ''],
      ['whitespace only', '   '],
    ])('rejects an %s displayName with MEMBER_DISPLAY_NAME_REQUIRED', async (_case, displayName) => {
      const attempt = service.create({ companyId, teamId, displayName, role: 'Dev' });

      await expect(attempt).rejects.toBeInstanceOf(MemberDisplayNameRequiredError);
      await expect(attempt).rejects.toMatchObject({ code: 'MEMBER_DISPLAY_NAME_REQUIRED', httpStatus: 400 });
      expect(repo.rows).toHaveLength(0);
    });

    it('rejects a role outside Dev, QA, Lead, PM with MEMBER_ROLE_INVALID', async () => {
      const attempt = service.create({ companyId, teamId, displayName: 'Dev One', role: 'Boss' as MemberRole });

      await expect(attempt).rejects.toBeInstanceOf(MemberRoleInvalidError);
      await expect(attempt).rejects.toMatchObject({ code: 'MEMBER_ROLE_INVALID', httpStatus: 400 });
      expect(repo.rows).toHaveLength(0);
    });

    it('rejects an unknown team with MEMBER_TEAM_UNKNOWN', async () => {
      const attempt = service.create({ companyId, teamId: newId(), displayName: 'Dev One', role: 'Dev' });

      await expect(attempt).rejects.toBeInstanceOf(MemberTeamUnknownError);
      await expect(attempt).rejects.toMatchObject({ code: 'MEMBER_TEAM_UNKNOWN', httpStatus: 422 });
      expect(repo.rows).toHaveLength(0);
    });

    it('rejects a team of another company with MEMBER_TEAM_UNKNOWN', async () => {
      const foreignTeamId = addTeam(newId());

      const attempt = service.create({ companyId, teamId: foreignTeamId, displayName: 'Dev One', role: 'Dev' });

      await expect(attempt).rejects.toBeInstanceOf(MemberTeamUnknownError);
      expect(repo.rows).toHaveLength(0);
    });

    it('rejects a duplicate displayName inside the same team with MEMBER_DISPLAY_NAME_TAKEN', async () => {
      await service.create({ companyId, teamId, displayName: 'Dev One', role: 'Dev' });

      const attempt = service.create({ companyId, teamId, displayName: 'Dev One', role: 'QA' });

      await expect(attempt).rejects.toBeInstanceOf(MemberDisplayNameTakenError);
      await expect(attempt).rejects.toMatchObject({ code: 'MEMBER_DISPLAY_NAME_TAKEN', httpStatus: 409 });
      expect(repo.rows).toHaveLength(1);
    });

    it('treats a displayName that differs only by surrounding spaces as a duplicate', async () => {
      await service.create({ companyId, teamId, displayName: 'Dev One', role: 'Dev' });

      await expect(
        service.create({ companyId, teamId, displayName: ' Dev One ', role: 'Dev' }),
      ).rejects.toBeInstanceOf(MemberDisplayNameTakenError);
    });

    it('allows the same displayName in a different team', async () => {
      await service.create({ companyId, teamId, displayName: 'Dev One', role: 'Dev' });

      const other = await service.create({ companyId, teamId: addTeam(companyId), displayName: 'Dev One', role: 'Dev' });

      expect(other.displayName).toBe('Dev One');
      expect(repo.rows).toHaveLength(2);
    });
  });

  describe('get', () => {
    it('returns a stored member by id', async () => {
      const created = await service.create({ companyId, teamId, displayName: 'Dev One', role: 'Dev' });

      await expect(service.get(created.id)).resolves.toEqual(created);
    });

    it('rejects an unknown id with MEMBER_NOT_FOUND', async () => {
      const attempt = service.get(newId());

      await expect(attempt).rejects.toBeInstanceOf(MemberNotFoundError);
      await expect(attempt).rejects.toMatchObject({ code: 'MEMBER_NOT_FOUND', httpStatus: 404 });
    });
  });
});
