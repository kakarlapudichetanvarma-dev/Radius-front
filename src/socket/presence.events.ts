import { socketClient, ensureSocketConnected, addOnConnectCallback } from './socket.client';
import { store } from '../store';
import { applyPresenceEvent, updateOnlineUsers } from '../store/slices/chat.slice';
import { storage } from '../utils/storage.utils'; // ✅ same source socket.client uses
import axios from 'axios';

let activeSub: { unsubscribe: () => void } | null = null;
let subscribed = false;

const handlePresenceMessage = (message: { body: string }) => {
  try {
    const event = JSON.parse(message.body) as {
      username: string;
      online:   boolean;
      lastSeen: string | null;
    };
    if (!event?.username) return;
    store.dispatch(applyPresenceEvent({
      username: event.username,
      online:   event.online,
      lastSeen: event.lastSeen ?? null,
    }));
  } catch (e) {
    console.error('[presence] Failed to parse event', e);
  }
};

const fetchOnlineUsers = async () => {
  try {
    const token = store.getState().auth.accessToken; // ✅ correct field name
    if (!token) return;

    const res = await axios.get('http://localhost:8080/api/v1/chat/presence/online', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const onlineUsers: string[] = res.data.data;
    store.dispatch(updateOnlineUsers(onlineUsers));
    console.log('[presence] online users fetched:', onlineUsers);
  } catch (e) {
    console.error('[presence] Failed to fetch online users', e);
  }
};

const doSubscribe = () => {
  if (subscribed) return;
  subscribed = true;

  activeSub?.unsubscribe();

  activeSub = socketClient.subscribe('/topic/presence', handlePresenceMessage);
  console.log('📡 SUB: /topic/presence');

  fetchOnlineUsers();
};

export const connectPresence = () => {
  if (socketClient.connected) {
    doSubscribe();
  } else {
    addOnConnectCallback(doSubscribe);
    ensureSocketConnected();
  }
};

export const disconnectPresence = () => {
  activeSub?.unsubscribe();
  activeSub  = null;
  subscribed = false;
};