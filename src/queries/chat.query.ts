  import { useQuery } from '@tanstack/react-query';
  import { chatService } from '../services/chat.service';

  export const useChatMessages = (chatId: string) =>
    useQuery({
      queryKey: ['messages', chatId],
      queryFn: async () => {
        const response = await chatService.getChatMessages(chatId);
        return response.data.data;
      },
      enabled: !!chatId
    });

  export const useChats = (username: string) =>
    useQuery({
      queryKey: ['chats', username],
      queryFn: async () => {
        const response = await chatService.getChatsByUsername(username);
        return response.data.data;
      },
      enabled: !!username
    });