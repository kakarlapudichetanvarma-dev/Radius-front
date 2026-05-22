export interface User {
  id: string;
  username: string;
  phoneNumber: string;
  email?: string | null;
  profilePicture?: string | null;
  about?: string | null;
  isOnline?: boolean;
  lastSeen?: string | null;
}

export interface UserProfileUpdatePayload {
  username?: string;
  about?: string;
  profilePicture?: string | null;
}

// Shape broadcast over WebSocket when a user updates their avatar
export interface AvatarUpdateEvent {
  userId: string;
  profilePicture: string | null;
}