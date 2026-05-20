import { api } from '../config/axios.config';
import type {
  FriendSummary,
  FriendRequest,
  SendFriendRequestPayload,
  FriendRequestActionPayload
} from '../types/friend.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const friendService = {

  getFriends: () =>
    api.get<ApiResponse<FriendSummary[]>>('/api/v1/users/friends/search'),

  getPendingRequests: () =>
    api.get<ApiResponse<FriendRequest[]>>('/api/v1/users/friends/requests/pending'),

  sendFriendRequest: (data: SendFriendRequestPayload) =>
    api.post<ApiResponse<FriendRequest>>('/api/v1/users/friends/request', data),

  respondToRequest: (data: FriendRequestActionPayload) =>
    api.post<ApiResponse<FriendRequest>>('/api/v1/users/friends/accept', data),
};