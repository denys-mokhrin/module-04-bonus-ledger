import { DomainError } from '../../../shared/errors';

export class TeamNameRequiredError extends DomainError {
  readonly code = 'TEAM_NAME_REQUIRED';
  readonly httpStatus = 400;

  constructor() {
    super('Team name must not be empty');
  }
}

export class TeamNameTakenError extends DomainError {
  readonly code = 'TEAM_NAME_TAKEN';
  readonly httpStatus = 409;

  constructor(name: string) {
    super('A team with this name already exists in the company', { name });
  }
}

export class TeamNotFoundError extends DomainError {
  readonly code = 'TEAM_NOT_FOUND';
  readonly httpStatus = 404;

  constructor(id: string) {
    super('Team not found', { id });
  }
}
