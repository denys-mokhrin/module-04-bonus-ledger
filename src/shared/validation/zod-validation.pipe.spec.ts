import { z } from 'zod';
import { ValidationFailedError, ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  const pipe = new ZodValidationPipe(z.object({ name: z.string().trim().min(1), tags: z.array(z.string()).optional() }));

  it('returns the parsed value (trimmed, unknown keys stripped)', () => {
    expect(pipe.transform({ name: '  a  ', extra: 1 })).toEqual({ name: 'a' });
  });

  it('throws VALIDATION_FAILED (400) with one issue per field and no received values', () => {
    let error: unknown;
    try {
      pipe.transform({ name: '', tags: ['ok', 7] });
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(ValidationFailedError);
    expect(error).toMatchObject({ code: 'VALIDATION_FAILED', httpStatus: 400 });
    const issues = (error as ValidationFailedError).details?.issues as { path: string; message: string }[];
    expect(issues.map((i) => i.path)).toEqual(['name', 'tags.1']);
    for (const issue of issues) expect(Object.keys(issue).sort()).toEqual(['message', 'path']);
  });
});
