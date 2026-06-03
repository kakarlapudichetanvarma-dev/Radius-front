import { store } from '../store';

/**
 * Returns true if the given username is currently online.
 * Reads directly from the Redux store (populated via WebSocket).
 */
export const isOnline = (username: string): boolean => {
  const state = store.getState();
  return state.chat.onlineUsers.includes(username);
};

/**
 * Returns the full list of currently online usernames.
 */
export const getOnlineUsers = (): string[] => {
  return store.getState().chat.onlineUsers;
};