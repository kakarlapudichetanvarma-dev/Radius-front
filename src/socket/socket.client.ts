import {
  Client
} from '@stomp/stompjs';

export const socketClient =
  new Client({
    brokerURL:
      'ws://localhost:8080/ws',

    reconnectDelay:
      5000
  });