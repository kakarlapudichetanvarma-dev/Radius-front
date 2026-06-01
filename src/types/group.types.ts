export interface GroupInfo {
  groupId: string;
  name: string;
  description: string | null;
  profilePicture: string | null;
  memberCount: number;
  creatorId: string;
  createdAt: string;
}

export interface GroupMember {
  userId: string;
  username: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
  leftAt: string | null;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  memberIds?: string[];
  profilePicture?: string;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  profilePicture?: string;
}

export interface UpdateGroupPhotoRequest {
  profilePicture: string;
}

export interface GroupEventResponse {
  eventId: string;
  groupId: string;
  eventType: string;
  actorId: string | null;
  targetId: string | null;
  description: string;
  occurredAt: string;
}