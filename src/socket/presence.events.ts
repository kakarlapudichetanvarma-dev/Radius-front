import { socketClient, safeSubscribe, ensureSocketConnected } from './socket.client';
import { store } from '../store';
import { updateOnlineUsers } from '../store/slices/chat.slice';

let presenceConnected = false;

export const connectPresence = () => {
  if (presenceConnected) return;
  presenceConnected = true;

  const doSub = () => {
    safeSubscribe('/topic/presence', (message) => {
      try {
        const users = JSON.parse(message.body);
        store.dispatch(updateOnlineUsers(users));
      } catch (e) {
        console.error('Failed to parse presence update', e);
      }
    });
  };

  if (socketClient.connected) {
    doSub();
  } else {
    // ✅ Queue for after STOMP connects — fixes "offline always" bug
    const prev = socketClient.onConnect;
    socketClient.onConnect = (frame) => {
      if (prev) prev.call(socketClient, frame);
      doSub();
    };
    ensureSocketConnected();
  }
};

export const disconnectPresence = () => {
  presenceConnected = false;
};