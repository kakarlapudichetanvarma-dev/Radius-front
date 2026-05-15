import {
  socketClient
} from './socket.client';

import {
  store
} from '../store';

import {
  updateOnlineUsers
} from '../store/slices/chat.slice';

export const connectPresence =
  () => {
    socketClient.subscribe(
      '/topic/presence',

      message => {
        const users =
          JSON.parse(
            message.body
          );

        store.dispatch(
          updateOnlineUsers(
            users
          )
        );
      }
    );
  };