import { Injectable, PipeTransform } from '@nestjs/common';
import type { z } from 'zod';
import { DomainError } from '../errors';

export interface ValidationIssue {
  path: string;
  message: string;
}

/** A request body, param or query that does not match its schema. Mapped to 400 by the global filter. */
export class ValidationFailedError extends DomainError {
  readonly code = 'VALIDATION_FAILED';
  readonly httpStatus = 400;

  constructor(issues: ValidationIssue[]) {
    super('Request validation failed', { issues });
  }
}

/**
 * Parses an incoming value with a zod schema and returns the parsed (typed, trimmed, stripped) value.
 * Usage: `@Body(new ZodValidationPipe(schema))`, `@Param('id', new ZodValidationPipe(z.uuid()))`.
 * Issues name the field and the rule, never the received value (it may be sensitive).
 */
@Injectable()
export class ZodValidationPipe<S extends z.ZodType> implements PipeTransform<unknown, z.output<S>> {
  constructor(private readonly schema: S) {}

  transform(value: unknown): z.output<S> {
    const result = this.schema.safeParse(value);
    if (result.success) return result.data;
    throw new ValidationFailedError(
      result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
    );
  }
}
