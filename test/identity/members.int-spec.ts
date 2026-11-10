import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { IdentityDb } from '../../src/modules/identity/db/client';
import { newId } from '../../src/shared/ids';

// Needs docker compose up -d postgres redis && pnpm db:migrate.
// Every run uses a fresh fake companyId and deletes only its own rows afterwards.
const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/** The project's error envelope: { error: { code, message, details? } }, nothing else. */
function expectEnvelope(body: unknown, code: string): void {
  expect(body).toEqual({
    error: expect.objectContaining({ code, message: expect.any(String) }),
  });
  for (const key of Object.keys((body as { error: object }).error)) {
    expect(['code', 'message', 'details']).toContain(key);
  }
}

describe('POST /members and GET /members/:id against Postgres (int)', () => {
  let app: INestApplication;
  let db: IdentityDb;
  const companyIds: string[] = [];

  function freshCompany(): string {
    const id = newId();
    companyIds.push(id);
    return id;
  }

  /** A fresh company with one team, created through the public API. */
  async function freshTeam(): Promise<{ companyId: string; teamId: string }> {
    const companyId = freshCompany();
    const res = await request(app.getHttpServer()).post('/teams').send({ companyId, name: 'Platform' }).expect(201);
    return { companyId, teamId: res.body.id };
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.init();
    db = app.get(IdentityDb);
  });

  afterAll(async () => {
    // Members first: member.teamId references team (ON DELETE RESTRICT).
    await db.member.deleteMany({ where: { companyId: { in: companyIds } } });
    await db.team.deleteMany({ where: { companyId: { in: companyIds } } });
    await app.close();
  });

  describe('POST /members', () => {
    it('201: creates the member and returns it', async () => {
      const { companyId, teamId } = await freshTeam();

      const res = await request(app.getHttpServer())
        .post('/members')
        .send({ companyId, teamId, displayName: 'Dev One', role: 'Dev' })
        .expect(201);

      expect(res.body).toEqual({
        id: expect.stringMatching(UUID_V7),
        companyId,
        teamId,
        displayName: 'Dev One',
        role: 'Dev',
        createdAt: expect.stringMatching(ISO_UTC),
      });
      const row = await db.member.findUnique({ where: { id: res.body.id } });
      expect(row).toMatchObject({ companyId, teamId, displayName: 'Dev One', role: 'Dev' });
    });

    it.each([
      ['displayName is missing', (c: string, t: string) => ({ companyId: c, teamId: t, role: 'Dev' })],
      ['displayName is empty', (c: string, t: string) => ({ companyId: c, teamId: t, displayName: '', role: 'Dev' })],
      ['displayName is whitespace only', (c: string, t: string) => ({ companyId: c, teamId: t, displayName: '   ', role: 'Dev' })],
      ['displayName is not a string', (c: string, t: string) => ({ companyId: c, teamId: t, displayName: 42, role: 'Dev' })],
      ['role is missing', (c: string, t: string) => ({ companyId: c, teamId: t, displayName: 'Dev One' })],
      ['role is not one of Dev, QA, Lead, PM', (c: string, t: string) => ({ companyId: c, teamId: t, displayName: 'Dev One', role: 'Boss' })],
      ['role has the wrong case', (c: string, t: string) => ({ companyId: c, teamId: t, displayName: 'Dev One', role: 'dev' })],
      ['companyId is missing', (_c: string, t: string) => ({ teamId: t, displayName: 'Dev One', role: 'Dev' })],
      ['companyId is not a uuid', (_c: string, t: string) => ({ companyId: 'acme', teamId: t, displayName: 'Dev One', role: 'Dev' })],
      ['teamId is missing', (c: string) => ({ companyId: c, displayName: 'Dev One', role: 'Dev' })],
      ['teamId is not a uuid', (c: string) => ({ companyId: c, teamId: 'team-1', displayName: 'Dev One', role: 'Dev' })],
    ])('400 VALIDATION_FAILED when %s', async (_case, body) => {
      const { companyId, teamId } = await freshTeam();

      const res = await request(app.getHttpServer()).post('/members').send(body(companyId, teamId)).expect(400);

      expectEnvelope(res.body, 'VALIDATION_FAILED');
      expect(await db.member.count({ where: { companyId } })).toBe(0);
    });

    it('422 MEMBER_TEAM_UNKNOWN when the team does not exist', async () => {
      const companyId = freshCompany();

      const res = await request(app.getHttpServer())
        .post('/members')
        .send({ companyId, teamId: newId(), displayName: 'Dev One', role: 'Dev' })
        .expect(422);

      expectEnvelope(res.body, 'MEMBER_TEAM_UNKNOWN');
      expect(await db.member.count({ where: { companyId } })).toBe(0);
    });

    it('422 MEMBER_TEAM_UNKNOWN when the team belongs to another company', async () => {
      const { teamId } = await freshTeam();
      const companyId = freshCompany();

      const res = await request(app.getHttpServer())
        .post('/members')
        .send({ companyId, teamId, displayName: 'Dev One', role: 'Dev' })
        .expect(422);

      expectEnvelope(res.body, 'MEMBER_TEAM_UNKNOWN');
      expect(await db.member.count({ where: { teamId } })).toBe(0);
    });

    it('409 MEMBER_DISPLAY_NAME_TAKEN on a duplicate displayName in the same team', async () => {
      const { companyId, teamId } = await freshTeam();
      await request(app.getHttpServer())
        .post('/members')
        .send({ companyId, teamId, displayName: 'Dev One', role: 'Dev' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/members')
        .send({ companyId, teamId, displayName: 'Dev One', role: 'QA' })
        .expect(409);

      expectEnvelope(res.body, 'MEMBER_DISPLAY_NAME_TAKEN');
      expect(await db.member.count({ where: { teamId } })).toBe(1);
    });

    it('201 for the same displayName in a different team', async () => {
      const first = await freshTeam();
      const second = await freshTeam();

      await request(app.getHttpServer())
        .post('/members')
        .send({ ...first, displayName: 'Dev One', role: 'Dev' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/members')
        .send({ ...second, displayName: 'Dev One', role: 'Dev' })
        .expect(201);
    });
  });

  describe('GET /members/:id', () => {
    it('200: returns the member created by POST', async () => {
      const { companyId, teamId } = await freshTeam();
      const created = await request(app.getHttpServer())
        .post('/members')
        .send({ companyId, teamId, displayName: 'Dev One', role: 'Lead' })
        .expect(201);

      const res = await request(app.getHttpServer()).get(`/members/${created.body.id}`).expect(200);

      expect(res.body).toEqual(created.body);
    });

    it('404 MEMBER_NOT_FOUND for an unknown id', async () => {
      const res = await request(app.getHttpServer()).get(`/members/${newId()}`).expect(404);

      expectEnvelope(res.body, 'MEMBER_NOT_FOUND');
    });

    it('400 VALIDATION_FAILED when the id is not a uuid', async () => {
      const res = await request(app.getHttpServer()).get('/members/not-a-uuid').expect(400);

      expectEnvelope(res.body, 'VALIDATION_FAILED');
    });
  });
});
