import { DomainError } from '../../../shared/errors';

export class ReviewerDisplayNameRequiredError extends DomainError {
  readonly code = 'REVIEWER_DISPLAY_NAME_REQUIRED';
  readonly httpStatus = 400;

  constructor() {
    super('Reviewer display name must not be empty');
  }
}

export class ReviewerEmailInvalidError extends DomainError {
  readonly code = 'REVIEWER_EMAIL_INVALID';
  readonly httpStatus = 400;

  constructor() {
    super('Reviewer email is not a valid email address');
  }
}

export class ReviewerEmailTakenError extends DomainError {
  readonly code = 'REVIEWER_EMAIL_TAKEN';
  readonly httpStatus = 409;

  constructor(email: string) {
    super('A reviewer with this email already exists in the company', { email });
  }
}

export class ReviewerNotFoundError extends DomainError {
  readonly code = 'REVIEWER_NOT_FOUND';
  readonly httpStatus = 404;

  constructor(id: string) {
    super('Reviewer not found', { id });
  }
}
