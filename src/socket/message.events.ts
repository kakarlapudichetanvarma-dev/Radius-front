import {
  socketClient
} from './socket.client';

import {
  store
} from '../store';

import {
  sendMessage
} from '../store/slices/chat.slice';

export const connectMessages =
  () => {
    socketClient.onConnect =
      () => {
        console.log(
          'Socket connected'
        );

        socketClient.subscribe(
          '/topic/messages',

          message => {
            const payload =
              JSON.parse(
                message.body
              );

            store.dispatch(
              sendMessage(
                payload
              )
            );
          }
        );
      };

    socketClient.activate();
  };