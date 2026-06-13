export type CommunityRole = 'ADMIN' | 'MEMBER';

export interface Community {
  id: string;
  name: string;
  description: string;
  photoUrl: string | null;
  createdBy: string;
  createdAt: string;
  memberCount: number;
  groupCount: number;
}

export interface CreateCommunityRequest {
  name: string;
  description?: string;
  photoUrl?: string;
}

export interface GenerateInviteRequest {
  expiryHours: number;
  maxUses: number;
}

export interface GenerateInviteResponse {
  token: string;
  inviteLink: string;
  expiresAt: string;
}

export interface InvitePreviewResponse {
  communityId: string;
  communityName: string;
  communityDescription: string;
  communityPhotoUrl: string | null;
  memberCount: number;
  groupCount: number;
  createdByName: string;
  isValid: boolean;
  invalidReason?: string;
}

export interface CommunityGroupSummary {
  groupId: string;
  chatId: string;
  groupName: string;
  groupPhotoUrl: string | null;
  memberCount: number;
}

export interface CreateGroupInCommunityRequest {
  name: string;
  memberIds?: string[];
}

export interface CommunityMemberResponse {
  id: string;
  userId: string;
  name: string;
  role: CommunityRole;
  joinedAt: string;
}

export interface CommunityMembersResponse {
  members: CommunityMemberResponse[];
  currentUserRole: CommunityRole;
}

export interface AddCommunityMemberRequest {
  userId: string;
  role?: CommunityRole;
}

export interface JoinRequestResponse {
  id: string;
  communityId: string;
  userId: string;
  userName: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  requestedAt: string;
}

export interface ReviewJoinRequestRequest {
  accept: boolean;
}