/**
 * Base class for expected, typed errors. Services throw subclasses of DomainError,
 * never HttpException. Each subclass fixes a stable `code` (e.g. JUSTIFICATION_SELF_APPROVAL)
 * and the HTTP status the global filter maps it to.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;

  constructor(
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export interface ErrorEnvelope {
  error: { code: string; message: string; details?: Record<string, unknown> };
}
