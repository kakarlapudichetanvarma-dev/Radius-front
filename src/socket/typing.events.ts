import {
  socketClient,
  safeSubscribe,
  ensureSocketConnected
} from './socket.client';

import { store } from '../store';

import { setTyping } from '../store/slices/chat.slice';

let typingConnected = false;

export const connectTyping = () => {
  if (typingConnected) return;

  typingConnected = true;

  const doSub = () => {
    safeSubscribe('/topic/typing', message => {
      const user = message.body;

      store.dispatch(setTyping(user));

      setTimeout(() => {
        store.dispatch(setTyping(null));
      }, 2000);
    });
  };

  if (socketClient.connected) {
    doSub();
  } else {
    const prev = socketClient.onConnect;

    socketClient.onConnect = (frame) => {
      if (prev) {
        prev.call(socketClient, frame);
      }

      doSub();
    };

    ensureSocketConnected();
  }
};