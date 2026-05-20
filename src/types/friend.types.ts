export interface FriendSummary {
  userId: string;
  username: string;
  phoneNumber: string;
  profilePicture: string | null;
  online: boolean;
}

export interface FriendRequest {
  requestId: string;
  requesterId: string;
  requesterUsername: string;
  requesterPhone: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface SendFriendRequestPayload {
  phoneNumber: string;
}

export interface FriendRequestActionPayload {
  requestId: string;
  action: 'ACCEPT' | 'REJECT';
}