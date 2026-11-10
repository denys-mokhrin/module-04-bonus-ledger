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

describe('POST /reviewers and GET /reviewers/:id against Postgres (int)', () => {
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
    await db.reviewer.deleteMany({ where: { companyId: { in: companyIds } } });
    await app.close();
  });

  describe('POST /reviewers', () => {
    it('201: creates the reviewer and returns it', async () => {
      const companyId = freshCompany();

      const res = await request(app.getHttpServer())
        .post('/reviewers')
        .send({ companyId, displayName: 'HR Reviewer', email: 'hr@example.com' })
        .expect(201);

      expect(res.body).toEqual({
        id: expect.stringMatching(UUID_V7),
        companyId,
        displayName: 'HR Reviewer',
        email: 'hr@example.com',
        createdAt: expect.stringMatching(ISO_UTC),
      });
      const row = await db.reviewer.findUnique({ where: { id: res.body.id } });
      expect(row).toMatchObject({ companyId, displayName: 'HR Reviewer', email: 'hr@example.com' });
    });

    it('201: stores the email trimmed and lower-cased', async () => {
      const res = await request(app.getHttpServer())
        .post('/reviewers')
        .send({ companyId: freshCompany(), displayName: 'HR Reviewer', email: '  HR.Lead@Example.COM ' })
        .expect(201);

      expect(res.body.email).toBe('hr.lead@example.com');
      const row = await db.reviewer.findUnique({ where: { id: res.body.id } });
      expect(row?.email).toBe('hr.lead@example.com');
    });

    it.each([
      ['displayName is missing', () => ({ companyId: newId(), email: 'hr@example.com' })],
      ['displayName is empty', () => ({ companyId: newId(), displayName: '', email: 'hr@example.com' })],
      ['displayName is whitespace only', () => ({ companyId: newId(), displayName: '   ', email: 'hr@example.com' })],
      ['displayName is not a string', () => ({ companyId: newId(), displayName: 42, email: 'hr@example.com' })],
      ['email is missing', () => ({ companyId: newId(), displayName: 'HR Reviewer' })],
      ['email is empty', () => ({ companyId: newId(), displayName: 'HR Reviewer', email: '' })],
      ['email is not an email', () => ({ companyId: newId(), displayName: 'HR Reviewer', email: 'hr.example.com' })],
      ['email is not a string', () => ({ companyId: newId(), displayName: 'HR Reviewer', email: 42 })],
      ['companyId is missing', () => ({ displayName: 'HR Reviewer', email: 'hr@example.com' })],
      ['companyId is not a uuid', () => ({ companyId: 'acme', displayName: 'HR Reviewer', email: 'hr@example.com' })],
    ])('400 VALIDATION_FAILED when %s', async (_case, body) => {
      const res = await request(app.getHttpServer()).post('/reviewers').send(body()).expect(400);

      expectEnvelope(res.body, 'VALIDATION_FAILED');
    });

    it('409 REVIEWER_EMAIL_TAKEN on a duplicate email in the same company', async () => {
      const companyId = freshCompany();
      await request(app.getHttpServer())
        .post('/reviewers')
        .send({ companyId, displayName: 'HR Reviewer', email: 'hr@example.com' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/reviewers')
        .send({ companyId, displayName: 'Other Reviewer', email: 'hr@example.com' })
        .expect(409);

      expectEnvelope(res.body, 'REVIEWER_EMAIL_TAKEN');
      expect(await db.reviewer.count({ where: { companyId } })).toBe(1);
    });

    it('409 REVIEWER_EMAIL_TAKEN when the duplicate differs only by case and spaces', async () => {
      const companyId = freshCompany();
      await request(app.getHttpServer())
        .post('/reviewers')
        .send({ companyId, displayName: 'HR Reviewer', email: 'hr@example.com' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/reviewers')
        .send({ companyId, displayName: 'HR Reviewer', email: ' HR@Example.com ' })
        .expect(409);

      expectEnvelope(res.body, 'REVIEWER_EMAIL_TAKEN');
      expect(await db.reviewer.count({ where: { companyId } })).toBe(1);
    });

    it('201 for the same email in a different company', async () => {
      await request(app.getHttpServer())
        .post('/reviewers')
        .send({ companyId: freshCompany(), displayName: 'HR Reviewer', email: 'hr@example.com' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/reviewers')
        .send({ companyId: freshCompany(), displayName: 'HR Reviewer', email: 'hr@example.com' })
        .expect(201);
    });
  });

  describe('GET /reviewers/:id', () => {
    it('200: returns the reviewer created by POST', async () => {
      const created = await request(app.getHttpServer())
        .post('/reviewers')
        .send({ companyId: freshCompany(), displayName: 'HR Reviewer', email: 'hr@example.com' })
        .expect(201);

      const res = await request(app.getHttpServer()).get(`/reviewers/${created.body.id}`).expect(200);

      expect(res.body).toEqual(created.body);
    });

    it('404 REVIEWER_NOT_FOUND for an unknown id', async () => {
      const res = await request(app.getHttpServer()).get(`/reviewers/${newId()}`).expect(404);

      expectEnvelope(res.body, 'REVIEWER_NOT_FOUND');
    });

    it('400 VALIDATION_FAILED when the id is not a uuid', async () => {
      const res = await request(app.getHttpServer()).get('/reviewers/not-a-uuid').expect(400);

      expectEnvelope(res.body, 'VALIDATION_FAILED');
    });
  });
});
