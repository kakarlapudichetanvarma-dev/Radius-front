import {
  socketClient
} from './socket.client';

import {
  store
} from '../store';

import {
  setTyping,

  clearTyping
} from '../store/slices/chat.slice';

export const connectTyping =
  () => {
    socketClient.subscribe(
      '/topic/typing',

      message => {
        const user =
          message.body;

        store.dispatch(
          setTyping(
            user
          )
        );

        setTimeout(
          () =>
            store.dispatch(
              clearTyping()
            ),

          2000
        );
      }
    );
  };