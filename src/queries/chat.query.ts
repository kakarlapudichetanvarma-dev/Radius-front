import {
  useQuery
} from '@tanstack/react-query';

import {
  chatService
} from '../services/chat.service';

export const useChatQuery =
  (
    chatId:
      string
  ) =>
    useQuery({
      queryKey: [
        'messages',

        chatId
      ],

      queryFn:
        async () => {
          const response =
            await chatService
              .getMessages(
                chatId
              );

          return response
            .data;
        }
    });