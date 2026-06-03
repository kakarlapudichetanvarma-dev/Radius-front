import { socketClient } from '../socket/socket.client';

const HEARTBEAT_INTERVAL_MS = 30_000; // 30 seconds — well within Redis TTL of 70s

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Starts sending periodic heartbeat messages to /app/presence.heartbeat.
 * The backend refreshes the Redis online TTL on each heartbeat.
 * Call this once after the socket connects and the user is authenticated.
 */
export const startHeartbeat = () => {
  if (heartbeatTimer !== null) return; // already running

  heartbeatTimer = setInterval(() => {
    if (socketClient.connected) {
      try {
        socketClient.publish({
          destination: '/app/presence.heartbeat',
          body:        JSON.stringify({ type: 'HEARTBEAT' }),
        });
      } catch (e) {
        console.warn('[heartbeat] Failed to send heartbeat', e);
      }
    }
  }, HEARTBEAT_INTERVAL_MS);
};

/**
 * Stops the heartbeat timer. Call on logout or socket disconnect.
 */
export const stopHeartbeat = () => {
  if (heartbeatTimer !== null) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
};