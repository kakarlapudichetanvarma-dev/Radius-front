export interface ChatSummary {
  chatId: string;
  type: 'PRIVATE' | 'GROUP';
  lastMessage: string | null;
  lastMessageAt: string | null;
  archived: boolean;
  unreadCount: number;
  otherParticipantUsername: string | null;
  otherParticipantAvatar: string | null;
  lastMessageStatus: 'SENT' | 'DELIVERED' | 'READ' | null;
  lastMessageSenderId: string | null;
  groupInfo: GroupInfo | null;
}

export interface GroupInfo {
  groupId: string;
  name: string;
  description: string | null;
  profilePicture: string | null;
  memberCount: number;
  creatorId: string;
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderUsername: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'STICKER' | 'CONTACT' | 'LINK' | 'GROUP_EVENT';
  content: string | null;
  status: 'SENT' | 'DELIVERED' | 'READ';
  isEdited: boolean;
  edited: boolean;        // ← ADD: raw field from server
  isDeleted: boolean;
  deleted: boolean;       // ← ADD: raw field from server
  replyToId: string | null;
  sentAt: string;
  deliveredAt: string | null;
  readAt: string | null;
  editedAt: string | null;
  deletedAt: string | null; // ← ADD
  updatedAt: string | null; // ← ADD
  date: string | null;
  attachment: MediaAttachment | null;
}

export interface MediaAttachment {
  id: string;
  fileName: string | null;
  fileType: string | null;
  fileSizeBytes: number | null;
  mediaType: 'IMAGE' | 'FILE' | 'CONTACT' | 'STICKER' | 'LINK';
  storagePath: string | null;
  url: string | null;
  previewTitle: string | null;
  previewDesc: string | null;
  uploadedAt: string;
}

export interface GroupMember {
  userId: string;
  username: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
  leftAt: string | null;
}

export interface SendPrivateMessageRequest {
  receiverUsername: string;
  content?: string;
  messageType?: string;
  replyToId?: string;
  fileData?: string;
  fileName?: string;
  fileType?: string;
  fileSizeBytes?: number;
  url?: string;
  previewTitle?: string;
  previewDesc?: string;
}

export interface SendGroupMessageRequest {
  chatId: string;
  content?: string;
  messageType?: string;
  replyToId?: string;
  fileData?: string;
  fileName?: string;
  fileType?: string;
  fileSizeBytes?: number;
  url?: string;
  previewTitle?: string;
  previewDesc?: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  memberIds?: string[];
  profilePicture?: string;
}