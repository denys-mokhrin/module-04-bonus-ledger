/** A group of members with one team lead (docs/bc-map.md), owned by one Company (the tenant). */
export interface Team {
  id: string;
  companyId: string;
  name: string;
  /** Member id only; null until a lead is assigned. */
  leadMemberId: string | null;
  /** UTC. */
  createdAt: Date;
}

export interface CreateTeamInput {
  companyId: string;
  name: string;
  leadMemberId?: string | null;
}
