import { useQuery } from '@tanstack/react-query';
import { communityService } from '../services/community.service';

export const useCommunityQuery = () =>
  useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      const response = await communityService.getMyCommunities();
      return response.data;
    },
  });

export const useCommunityDetailsQuery = (communityId: string) =>
  useQuery({
    queryKey: ['community', communityId],
    queryFn: async () => {
      const response = await communityService.getCommunity(communityId);
      return response.data;
    },
    enabled: !!communityId,
  });

export const useCommunityGroupsQuery = (communityId: string) =>
  useQuery({
    queryKey: ['community-groups', communityId],
    queryFn: async () => {
      const response = await communityService.getCommunityGroups(communityId);
      return response.data;
    },
    enabled: !!communityId,
  });

export const useCommunityMembersQuery = (communityId: string) =>
  useQuery({
    queryKey: ['community-members', communityId],
    queryFn: async () => {
      const response = await communityService.getCommunityMembers(communityId);
      return response.data;
    },
    enabled: !!communityId,
  });