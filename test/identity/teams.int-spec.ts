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

describe('POST /teams and GET /teams/:id against Postgres (int)', () => {
  let app: INestApplication;
  let db: IdentityDb;
  const companyIds: string[] = [];

  function freshCompany(): string {
    const id = newId();
    companyIds.push(id);
    return id;
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.init();
    db = app.get(IdentityDb);
  });

  afterAll(async () => {
    await db.team.deleteMany({ where: { companyId: { in: companyIds } } });
    await app.close();
  });

  describe('POST /teams', () => {
    it('201: creates the team and returns it', async () => {
      const companyId = freshCompany();
      const leadMemberId = newId();

      const res = await request(app.getHttpServer())
        .post('/teams')
        .send({ companyId, name: 'Platform', leadMemberId })
        .expect(201);

      expect(res.body).toEqual({
        id: expect.stringMatching(UUID_V7),
        companyId,
        name: 'Platform',
        leadMemberId,
        createdAt: expect.stringMatching(ISO_UTC),
      });
      const row = await db.team.findUnique({ where: { id: res.body.id } });
      expect(row).toMatchObject({ companyId, name: 'Platform', leadMemberId });
    });

    it('201: leadMemberId is optional and comes back as null', async () => {
      const res = await request(app.getHttpServer())
        .post('/teams')
        .send({ companyId: freshCompany(), name: 'Platform' })
        .expect(201);

      expect(res.body.leadMemberId).toBeNull();
    });

    it.each([
      ['name is missing', () => ({ companyId: newId() })],
      ['name is empty', () => ({ companyId: newId(), name: '' })],
      ['name is whitespace only', () => ({ companyId: newId(), name: '   ' })],
      ['name is not a string', () => ({ companyId: newId(), name: 42 })],
      ['companyId is missing', () => ({ name: 'Platform' })],
      ['companyId is not a uuid', () => ({ companyId: 'acme', name: 'Platform' })],
      ['leadMemberId is not a uuid', () => ({ companyId: newId(), name: 'Platform', leadMemberId: 'lead-1' })],
    ])('400 VALIDATION_FAILED when %s', async (_case, body) => {
      const res = await request(app.getHttpServer()).post('/teams').send(body()).expect(400);

      expectEnvelope(res.body, 'VALIDATION_FAILED');
    });

    it('409 TEAM_NAME_TAKEN on a duplicate name in the same company', async () => {
      const companyId = freshCompany();
      await request(app.getHttpServer()).post('/teams').send({ companyId, name: 'Platform' }).expect(201);

      const res = await request(app.getHttpServer())
        .post('/teams')
        .send({ companyId, name: 'Platform' })
        .expect(409);

      expectEnvelope(res.body, 'TEAM_NAME_TAKEN');
      expect(await db.team.count({ where: { companyId } })).toBe(1);
    });

    it('201 for the same name in a different company', async () => {
      await request(app.getHttpServer())
        .post('/teams')
        .send({ companyId: freshCompany(), name: 'Platform' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/teams')
        .send({ companyId: freshCompany(), name: 'Platform' })
        .expect(201);
    });
  });

  describe('GET /teams/:id', () => {
    it('200: returns the team created by POST', async () => {
      const created = await request(app.getHttpServer())
        .post('/teams')
        .send({ companyId: freshCompany(), name: 'Platform' })
        .expect(201);

      const res = await request(app.getHttpServer()).get(`/teams/${created.body.id}`).expect(200);

      expect(res.body).toEqual(created.body);
    });

    it('404 TEAM_NOT_FOUND for an unknown id', async () => {
      const res = await request(app.getHttpServer()).get(`/teams/${newId()}`).expect(404);

      expectEnvelope(res.body, 'TEAM_NOT_FOUND');
    });

    it('400 VALIDATION_FAILED when the id is not a uuid', async () => {
      const res = await request(app.getHttpServer()).get('/teams/not-a-uuid').expect(400);

      expectEnvelope(res.body, 'VALIDATION_FAILED');
    });
  });
});
