/** Member roles (docs/bc-map.md); same values as the MemberRole enum in identity's schema.prisma. */
export const MEMBER_ROLES = ['Dev', 'QA', 'Lead', 'PM'] as const;

export type MemberRole = (typeof MEMBER_ROLES)[number];

/** A person whose contribution is scored (docs/bc-map.md). Belongs to one Team and one Company (the tenant). */
export interface Member {
  id: string;
  companyId: string;
  teamId: string;
  /** Unique inside a team. */
  displayName: string;
  role: MemberRole;
  /** UTC. */
  createdAt: Date;
}

export interface CreateMemberInput {
  companyId: string;
  teamId: string;
  displayName: string;
  role: MemberRole;
}
