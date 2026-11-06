import { Controller, Get, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DomainError } from '../src/shared/errors';

// The global filter registered by AppModule maps every error to { error: { code, message } }.
class SampleConflictError extends DomainError {
  readonly code = 'SAMPLE_CONFLICT';
  readonly httpStatus = 409;
}

@Controller('__errors')
class ThrowingController {
  @Get('domain')
  domain(): never {
    throw new SampleConflictError('Sample conflict for the test');
  }

  @Get('domain-details')
  domainWithDetails(): never {
    throw new SampleConflictError('With details', { field: 'period' });
  }

  @Get('unknown')
  unknown(): never {
    throw new Error('secret internal detail at db.ts:42');
  }
}

describe('error envelope (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [ThrowingController],
    }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.init();
  });
  afterAll(async () => app.close());

  it('maps a DomainError subclass to its status and code', async () => {
    const res = await request(app.getHttpServer()).get('/__errors/domain').expect(409);
    expect(res.body).toEqual({ error: { code: 'SAMPLE_CONFLICT', message: 'Sample conflict for the test' } });
  });

  it('includes details when the DomainError carries them', async () => {
    const res = await request(app.getHttpServer()).get('/__errors/domain-details').expect(409);
    expect(res.body).toEqual({
      error: { code: 'SAMPLE_CONFLICT', message: 'With details', details: { field: 'period' } },
    });
  });

  it('maps an unknown error to 500 without leaking the message or stack', async () => {
    const res = await request(app.getHttpServer()).get('/__errors/unknown').expect(500);
    expect(res.body).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
    expect(JSON.stringify(res.body)).not.toMatch(/secret|db\.ts|at /);
  });

  it('wraps framework errors such as an unknown route in the same envelope', async () => {
    const res = await request(app.getHttpServer()).get('/no-such-route').expect(404);
    expect(res.body.error.code).toBe('HTTP_404');
  });
});
