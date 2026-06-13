import { api } from '../config/axios.config';
import type {
  Community,
  CreateCommunityRequest,
  GenerateInviteRequest,
  GenerateInviteResponse,
  InvitePreviewResponse,
  CommunityGroupSummary,
  CreateGroupInCommunityRequest,
  CommunityMembersResponse,
  AddCommunityMemberRequest,
  JoinRequestResponse,
  ReviewJoinRequestRequest,
} from '../types/community.types';

export const communityService = {

  // ── Community CRUD ──────────────────────────────────────────────
  createCommunity: (request: CreateCommunityRequest) =>
    api.post<Community>('/api/v1/community', request),

  getMyCommunities: () =>
    api.get<Community[]>('/api/v1/community/my'),

  getCommunity: (communityId: string) =>
    api.get<Community>(`/api/v1/community/${communityId}`),

  deleteCommunity: (communityId: string) =>
    api.delete<void>(`/api/v1/community/${communityId}`),

  // ── Members ──────────────────────────────────────────────────────
  getCommunityMembers: (communityId: string) =>
    api.get<CommunityMembersResponse>(`/api/v1/community/${communityId}/members`),

  addMember: (communityId: string, request: AddCommunityMemberRequest) =>
    api.post<void>(`/api/v1/community/${communityId}/members`, request),

  removeMember: (communityId: string, targetUserId: string) =>
    api.delete<void>(`/api/v1/community/${communityId}/members/${targetUserId}`),

  leaveCommunity: (communityId: string) =>
    api.post<void>(`/api/v1/community/${communityId}/leave`),

  // ── Join Requests ─────────────────────────────────────────────────
  requestToJoin: (communityId: string) =>
    api.post<void>(`/api/v1/community/${communityId}/join-request`),

  getPendingJoinRequests: (communityId: string) =>
    api.get<JoinRequestResponse[]>(`/api/v1/community/${communityId}/join-requests`),

  reviewJoinRequest: (communityId: string, requestId: string, request: ReviewJoinRequestRequest) =>
    api.post<void>(`/api/v1/community/${communityId}/join-requests/${requestId}/review`, request),

  // ── Groups ───────────────────────────────────────────────────────
  getCommunityGroups: (communityId: string) =>
    api.get<CommunityGroupSummary[]>(`/api/v1/community/${communityId}/groups`),

  createGroupInCommunity: (communityId: string, request: CreateGroupInCommunityRequest) =>
    api.post<CommunityGroupSummary>(`/api/v1/community/${communityId}/groups/create`, request),

  // ── Invite ───────────────────────────────────────────────────────
  generateInvite: (communityId: string, request: GenerateInviteRequest) =>
    api.post<GenerateInviteResponse>(`/api/v1/community/${communityId}/invite`, request),

  previewInvite: (token: string) =>
    api.get<InvitePreviewResponse>(`/api/v1/community/invite/${token}`),

  joinViaInvite: (token: string) =>
    api.post<void>(`/api/v1/community/invite/${token}/join`),
};