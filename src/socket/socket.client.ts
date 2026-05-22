import { Client } from '@stomp/stompjs';
import { storage } from '../utils/storage.utils';

export const socketClient = new Client({
  brokerURL: 'ws://localhost:8084/ws',

  reconnectDelay: 3000,

  heartbeatIncoming: 4000,

  heartbeatOutgoing: 4000,

  debug: () => {},

  beforeConnect: () => {
    const auth = storage.getAuth();

    socketClient.connectHeaders = auth?.token
      ? {
          Authorization: `Bearer ${auth.token}`
        }
      : {};
  }
});

// ✅ active subscriptions
let activeSubscriptions:
Record<string, any> = {};

// ✅ queued subscriptions before socket connects
const pendingSubscriptions:
  Array<() => void> = [];

// ✅ only activate once
let started = false;

// ✅ SINGLE GLOBAL onConnect
socketClient.onConnect = () => {

  console.log(
    '✅ WebSocket Connected'
  );

  // run queued subscriptions
  while (
    pendingSubscriptions.length
  ) {
    const fn =
      pendingSubscriptions.shift();

    if (fn) {
      fn();
    }
  }
};

socketClient.onStompError = (
  frame
) => {

  console.error(
    'STOMP ERROR:',
    frame
  );
};

export const ensureSocketConnected =
  () => {

    if (!started) {

      started = true;

      socketClient.activate();
    }
  };

// ✅ SAFE SUBSCRIBE
export const safeSubscribe = (
  topic: string,
  callback: (message: any) => void
) => {

  const subscribeNow = () => {

    if (
      activeSubscriptions[topic]
    ) {
      return;
    }

    console.log(
      '📡 SUB:',
      topic
    );

    activeSubscriptions[
      topic
    ] = socketClient.subscribe(
      topic,
      callback
    );
  };

  if (socketClient.connected) {

    subscribeNow();

  } else {

    pendingSubscriptions.push(
      subscribeNow
    );

    ensureSocketConnected();
  }
};

// ✅ SAFE UNSUBSCRIBE
export const safeUnsubscribe = (
  topic: string
) => {

  if (
    activeSubscriptions[topic]
  ) {

    console.log(
      '❌ UNSUB:',
      topic
    );

    activeSubscriptions[
      topic
    ].unsubscribe();

    delete activeSubscriptions[
      topic
    ];
  }
};
