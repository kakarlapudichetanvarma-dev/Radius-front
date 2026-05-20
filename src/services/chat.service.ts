import { api } from '../config/axios.config';
import type {
  ChatSummary,
  Message,
  SendPrivateMessageRequest,
  SendGroupMessageRequest,
  CreateGroupRequest,
  GroupMember,
  MediaAttachment
} from '../types/chat.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const chatService = {

  // ── Chats ─────────────────────────────────────────────
  getChats: (userId: string) =>
    api.get<ApiResponse<ChatSummary[]>>(`/api/v1/chat/chats/${userId}`),

  getChatsByUsername: (username: string) =>
    api.get<ApiResponse<ChatSummary[]>>(`/api/v1/chat/chats/username/${username}`),

  getChatMessages: (chatId: string) =>
    api.get<ApiResponse<Message[]>>(`/api/v1/chat/chats/${chatId}/messages`),

  // ── Send Messages ──────────────────────────────────────
  sendPrivateMessage: (data: SendPrivateMessageRequest) =>
    api.post<ApiResponse<Message>>('/api/v1/chat/chats/private', data),

  sendGroupMessage: (data: SendGroupMessageRequest) =>
    api.post<ApiResponse<Message>>('/api/v1/chat/chats/group', data),

  // ── Message Actions ────────────────────────────────────
  editMessage: (messageId: string, content: string) =>
    api.put<ApiResponse<Message>>(`/api/v1/chat/messages/${messageId}`, { content }),

  deleteForMe: (messageId: string) =>
    api.delete<ApiResponse<null>>(`/api/v1/chat/messages/${messageId}/me`),

  deleteForEveryone: (messageId: string) =>
    api.delete<ApiResponse<null>>(`/api/v1/chat/messages/${messageId}/everyone`),

  markDelivered: (chatId: string) =>
    api.post<ApiResponse<null>>(`/api/v1/chat/chats/${chatId}/delivered`),

  markRead: (chatId: string) =>
    api.post<ApiResponse<null>>(`/api/v1/chat/chats/${chatId}/read`),

  // ── Groups ─────────────────────────────────────────────
  createGroup: (data: CreateGroupRequest) =>
    api.post<ApiResponse<any>>('/api/v1/chat/groups', data),

  updateGroup: (groupId: string, data: { name?: string; description?: string; profilePicture?: string }) =>
    api.put<ApiResponse<any>>(`/api/v1/chat/groups/${groupId}`, data),

  getGroupMembers: (groupId: string) =>
    api.get<ApiResponse<GroupMember[]>>(`/api/v1/chat/groups/${groupId}/members`),

  addGroupMember: (groupId: string, memberId: string, memberUsername?: string) =>
    api.post<ApiResponse<null>>(`/api/v1/chat/groups/${groupId}/members`, null, {
      params: { memberId, memberUsername }
    }),

  removeGroupMember: (groupId: string, memberId: string) =>
    api.delete<ApiResponse<null>>(`/api/v1/chat/groups/${groupId}/members/${memberId}`),

  promoteAdmin: (groupId: string, userId: string) =>
    api.post<ApiResponse<null>>(`/api/v1/chat/groups/${groupId}/admins/${userId}`),

  // ── Media ──────────────────────────────────────────────
  getChatImages: (chatId: string) =>
    api.get<ApiResponse<MediaAttachment[]>>(`/api/v1/chat/chats/${chatId}/images`),

  getChatFiles: (chatId: string) =>
    api.get<ApiResponse<MediaAttachment[]>>(`/api/v1/chat/chats/${chatId}/files`),

  getChatLinks: (chatId: string) =>
    api.get<ApiResponse<MediaAttachment[]>>(`/api/v1/chat/chats/${chatId}/links`),

  // ── Search ─────────────────────────────────────────────
  searchChat: (chatId: string, query: string) =>
    api.get<ApiResponse<Message[]>>(`/api/v1/chat/chats/${chatId}/search`, {
      params: { query }
    }),

  // ── Archive ────────────────────────────────────────────
  archiveChat: (chatId: string) =>
    api.post<ApiResponse<null>>(`/api/v1/chat/chats/${chatId}/archive`),

  unarchiveChat: (chatId: string) =>
    api.delete<ApiResponse<null>>(`/api/v1/chat/chats/${chatId}/archive`),

  getArchivedChats: () =>
    api.get<ApiResponse<ChatSummary[]>>('/api/v1/chat/chats/archived'),

  // ── Wallpaper ──────────────────────────────────────────
  getWallpaper: (chatId: string) =>
    api.get<ApiResponse<any>>(`/api/v1/chat/chats/${chatId}/wallpaper`),

  setWallpaper: (chatId: string, data: { wallpaperType: string; wallpaperData?: string; wallpaperColor?: string }) =>
    api.put<ApiResponse<any>>(`/api/v1/chat/chats/${chatId}/wallpaper`, data),
};