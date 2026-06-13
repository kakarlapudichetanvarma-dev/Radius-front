import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { communityService } from '../services/community.service';
import type {
  CreateCommunityRequest,
  CreateGroupInCommunityRequest,
  AddCommunityMemberRequest,
  ReviewJoinRequestRequest,
} from '../types/community.types';

// ── Create community ─────────────────────────────────────────────
export const useCreateCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: CreateCommunityRequest) => {
      const response = await communityService.createCommunity(request);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
};

// ── Delete community (admin only) ───────────────────────────────
export const useDeleteCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (communityId: string) => {
      await communityService.deleteCommunity(communityId);
      return communityId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
};

// ── Leave community (self) ──────────────────────────────────────
export const useLeaveCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (communityId: string) => {
      await communityService.leaveCommunity(communityId);
      return communityId;
    },
    onSuccess: (communityId) => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['community-members', communityId] });
    },
  });
};

// ── Add member (admin only) ─────────────────────────────────────
export const useAddCommunityMember = (communityId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: AddCommunityMemberRequest) => {
      await communityService.addMember(communityId, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-members', communityId] });
      queryClient.invalidateQueries({ queryKey: ['community', communityId] });
    },
  });
};

// ── Remove member (admin only) ──────────────────────────────────
export const useRemoveCommunityMember = (communityId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (targetUserId: string) => {
      await communityService.removeMember(communityId, targetUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-members', communityId] });
      queryClient.invalidateQueries({ queryKey: ['community', communityId] });
    },
  });
};

// ── Create a group inside a community ───────────────────────────
export const useCreateGroupInCommunity = (communityId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: CreateGroupInCommunityRequest) => {
      const response = await communityService.createGroupInCommunity(communityId, request);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-groups', communityId] });
      queryClient.invalidateQueries({ queryKey: ['community', communityId] });
    },
  });
};

// ── Generate invite link (any member) ───────────────────────────
export const useGenerateInvite = () =>
  useMutation({
    mutationFn: async (communityId: string) => {
      const response = await communityService.generateInvite(communityId, {
        expiryHours: 24,
        maxUses: 100,
      });
      return response.data;
    },
  });

// ── Join via invite link ─────────────────────────────────────────
export const useJoinViaInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (token: string) => {
      await communityService.joinViaInvite(token);
      return token;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
};

// ── Request to join a community ──────────────────────────────────
export const useRequestToJoin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (communityId: string) => {
      await communityService.requestToJoin(communityId);
      return communityId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
};

// ── Get pending join requests (admin only) ───────────────────────
export const usePendingJoinRequests = (communityId: string) =>
  useQuery({
    queryKey: ['join-requests', communityId],
    queryFn: async () => {
      const response = await communityService.getPendingJoinRequests(communityId);
      return response.data;
    },
    enabled: !!communityId,
  });

// ── Review a join request (admin only) ───────────────────────────
export const useReviewJoinRequest = (communityId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, accept }: { requestId: string; accept: boolean }) => {
      const req: ReviewJoinRequestRequest = { accept };
      await communityService.reviewJoinRequest(communityId, requestId, req);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['join-requests', communityId] });
      queryClient.invalidateQueries({ queryKey: ['community-members', communityId] });
      queryClient.invalidateQueries({ queryKey: ['community', communityId] });
    },
  });
};