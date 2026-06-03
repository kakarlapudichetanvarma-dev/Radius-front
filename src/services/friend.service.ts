import { api } from '../config/axios.config';
import type { FriendSummary, UserSearchResult } from '../types/friend.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const friendService = {

  getFriends: () =>
    api.get<ApiResponse<FriendSummary[]>>('/api/v1/users/friends/search'),

  searchByPhone: (phone: string) =>
    api.get<ApiResponse<UserSearchResult>>('/api/v1/users/friends/search-by-phone', {
      params: { phone },
    }),

  addDirectFriend: (phoneNumber: string) =>
    api.post<ApiResponse<FriendSummary>>('/api/v1/users/friends/add-direct', { phoneNumber }),
};