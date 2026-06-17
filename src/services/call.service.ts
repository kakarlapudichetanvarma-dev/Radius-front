import { api } from '../config/axios.config';

export const callService = {
  getCallHistory: () =>
    api.get('/api/v1/chat/calls/history'),

  getChatCallHistory: (chatId: string) =>
    api.get(`/api/v1/chat/calls/chat/${chatId}`),

  getActiveCall: (chatId: string) =>
    api.get(`/api/v1/chat/calls/chat/${chatId}/active`),

  getCallSession: (sessionId: string) =>
    api.get(`/api/v1/chat/calls/${sessionId}`),
};