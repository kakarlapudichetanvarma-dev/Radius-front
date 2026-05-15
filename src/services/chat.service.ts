import {
  api
} from '../config/axios.config';

export const chatService = {
  getMessages:
    (
      chatId:
        string
    ) =>
      api.get(
        `/messages/${chatId}`
      )
};