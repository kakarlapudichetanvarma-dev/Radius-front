import { api } from '../config/axios.config';
import type { AiChatRequest, AiChatResponse, AiConversationHistoryResponse } from '../types/ai.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const aiService = {
  sendMessage: (data: AiChatRequest) =>
    api.post<ApiResponse<AiChatResponse>>('/api/v1/ai/chat', data),

  getHistory: (conversationType?: string, conversationId?: string) =>
    api.get<ApiResponse<AiConversationHistoryResponse>>('/api/v1/ai/history', {
      params: { conversationType, conversationId },
    }),
};