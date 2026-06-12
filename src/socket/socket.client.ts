import { Client } from '@stomp/stompjs';
import { storage } from '../utils/storage.utils';
import { showMessageNotification } from '../utils/notifications.utils';
export const socketClient = new Client({
  brokerURL: 'ws://localhost:8084/ws',
  reconnectDelay: 500,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
  debug: () => {},
  beforeConnect: () => {
    const auth = storage.getAuth();
    socketClient.connectHeaders = auth?.token
      ? { Authorization: `Bearer ${auth.token}` }
      : {};
  }
});

let activeSubscriptions: Record<string, any> = {};
let started = false;

// ✅ Registry of onConnect callbacks — never overwrite, always append
const onConnectCallbacks: Array<() => void> = [];

export const addOnConnectCallback = (fn: () => void) => {
  onConnectCallbacks.push(fn);
};

// ✅ Single global onConnect that runs ALL registered callbacks
socketClient.onConnect = () => {
  console.log('✅ WebSocket Connected');
  onConnectCallbacks.forEach(fn => fn());
};

socketClient.onStompError = (frame) => {
  console.error('STOMP ERROR:', frame);
};

export const ensureSocketConnected = () => {
  if (!started) {
    started = true;
    socketClient.activate();
  }
};

export const safeSubscribe = (topic: string, callback: (message: any) => void) => {
  const subscribeNow = () => {
    if (activeSubscriptions[topic]) return;
    console.log('📡 SUB:', topic);
    activeSubscriptions[topic] = socketClient.subscribe(topic, callback);
  };

  if (socketClient.connected) {
    subscribeNow();
  } else {
    // ✅ Use the registry instead of overwriting onConnect
    addOnConnectCallback(subscribeNow);
    ensureSocketConnected();
  }
};

export const safeUnsubscribe = (topic: string) => {
  if (activeSubscriptions[topic]) {
    console.log('❌ UNSUB:', topic);
    activeSubscriptions[topic].unsubscribe();
    delete activeSubscriptions[topic];
  }
};