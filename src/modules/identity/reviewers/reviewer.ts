/** An HR user who approves justifications; is not scored (docs/bc-map.md). Owned by one Company (the tenant). */
export interface Reviewer {
  id: string;
  companyId: string;
  displayName: string;
  /** Trimmed and lower-cased; unique inside the company. */
  email: string;
  /** UTC. */
  createdAt: Date;
}

export interface CreateReviewerInput {
  companyId: string;
  displayName: string;
  email: string;
}
