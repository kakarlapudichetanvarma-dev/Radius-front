export interface FriendSummary {
  userId: string;
  username: string;
  phoneNumber: string;
  profilePicture: string | null;
  online: boolean;
  lastSeen: string | null;
}

export interface UserSearchResult {
  userId: string;
  username: string;
  phoneNumber: string;
  profilePicture: string | null;
  alreadyFriend: boolean;
}