import { DomainError } from '../../../shared/errors';

export class MemberDisplayNameRequiredError extends DomainError {
  readonly code = 'MEMBER_DISPLAY_NAME_REQUIRED';
  readonly httpStatus = 400;

  constructor() {
    super('Member displayName must not be empty');
  }
}

export class MemberRoleInvalidError extends DomainError {
  readonly code = 'MEMBER_ROLE_INVALID';
  readonly httpStatus = 400;

  constructor(role: string) {
    super('Member role must be one of Dev, QA, Lead, PM', { role });
  }
}

/** The team does not exist or belongs to another company; both look the same to the caller. */
export class MemberTeamUnknownError extends DomainError {
  readonly code = 'MEMBER_TEAM_UNKNOWN';
  readonly httpStatus = 422;

  constructor(teamId: string) {
    super('Team not found in this company', { teamId });
  }
}

export class MemberDisplayNameTakenError extends DomainError {
  readonly code = 'MEMBER_DISPLAY_NAME_TAKEN';
  readonly httpStatus = 409;

  constructor(displayName: string) {
    super('A member with this displayName already exists in the team', { displayName });
  }
}

export class MemberNotFoundError extends DomainError {
  readonly code = 'MEMBER_NOT_FOUND';
  readonly httpStatus = 404;

  constructor(id: string) {
    super('Member not found', { id });
  }
}
