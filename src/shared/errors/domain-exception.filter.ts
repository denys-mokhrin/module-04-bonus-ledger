import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { DomainError, type ErrorEnvelope } from './domain-error';

/**
 * Global filter: maps every thrown error to { error: { code, message, details? } }.
 * - DomainError → its httpStatus and code.
 * - HttpException (framework: 404 route, 400 parse) → its status, code HTTP_<status>.
 * - Anything else → 500 INTERNAL_ERROR; the stack is logged, never returned.
 */
@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const [status, body] = this.toEnvelope(exception);
    response.status(status).json(body);
  }

  private toEnvelope(exception: unknown): [number, ErrorEnvelope] {
    if (exception instanceof DomainError) {
      const error: ErrorEnvelope['error'] = { code: exception.code, message: exception.message };
      if (exception.details) error.details = exception.details;
      return [exception.httpStatus, { error }];
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return [status, { error: { code: `HTTP_${status}`, message: exception.message } }];
    }
    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    return [500, { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }];
  }
}
