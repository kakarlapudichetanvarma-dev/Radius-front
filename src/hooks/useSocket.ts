import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { ensureSocketConnected, safeSubscribe, safeUnsubscribe } from '../socket/socket.client';
import { initMessageEvents } from '../socket/message.events';
import { connectPresence } from '../socket/presence.events';
import {
  receiveMessage,
  updateMessageStatus,
  updateChatLastMessage,
  fetchChats,
} from '../store/slices/chat.slice';
import { store } from '../store';

let initialized = false;

// Track which chat topics we've subscribed to for background notifications
const backgroundSubscriptions = new Set<string>();

export const useSocket = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  // ── Boot socket once on login ────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user?.id || initialized) return;
    initialized = true;

    initMessageEvents(store, receiveMessage, updateMessageStatus);
    connectPresence();
    ensureSocketConnected();

    return () => {
      initialized = false;
      // Clean up all background subscriptions on logout
      backgroundSubscriptions.forEach(topic => safeUnsubscribe(topic));
      backgroundSubscriptions.clear();
    };
  }, [isAuthenticated, user?.id]);

  // ── Subscribe to ALL user's chat topics for background badge updates ─────
  //
  // Your backend only broadcasts to /topic/chat/{chatId}.
  // ChatWindow subscribes to the OPEN chat only.
  // This hook subscribes to ALL other chats so messages arriving while
  // you're in a different chat still show the unread badge instantly.
  //
  const chats = useSelector((state: RootState) => state.chat.chats);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    chats.forEach(chat => {
      if (chat.chatId.startsWith('temp-')) return;

      const topic = `/topic/chat/${chat.chatId}`;

      // Already subscribed to this topic — skip
      if (backgroundSubscriptions.has(topic)) return;

      backgroundSubscriptions.add(topic);

      safeSubscribe(topic, (frame) => {
        try {
          const payload = JSON.parse(frame.body);

          // Status updates and deletes — not relevant for badge counts
          if (payload.type === 'STATUS_UPDATE' || payload.type === 'DELETE') return;

          const state = store.getState();
          const openChatId = state.chat.selectedChatId;
          const currentUserId = state.auth.user?.id;

          // ── Open chat: message.events.ts (subscribeToChat) handles it ──
          // Don't double-dispatch for the currently open chat
          if (payload.chatId === openChatId) return;

          // ── Own message echo: message.events.ts handles it ──
          if (payload.senderId === currentUserId) return;

          // ── Background chat message: show badge + preview instantly ──
          const messageId = payload.messageId || payload.id;
          dispatch(updateChatLastMessage({
            id: messageId,
            chatId: payload.chatId,
            senderId: payload.senderId,
            senderUsername: payload.senderUsername,
            content: payload.content ?? '',
            messageType: payload.messageType || 'TEXT',
            status: payload.status || 'DELIVERED',
            sentAt: payload.sentAt,
            deliveredAt: payload.deliveredAt ?? null,
            readAt: payload.readAt ?? null,
            isDeleted: payload.deleted ?? false,
            isEdited: payload.edited ?? false,
            replyToId: payload.replyToId ?? null,
            attachment: payload.attachment ?? null,
            date: null,
          } as any));

        } catch (err) {
          console.error('Background chat topic parse error:', err);
        }
      });
    });

  // Re-run whenever chats list changes (new chat added = subscribe to its topic)
  }, [chats, isAuthenticated, user?.id, dispatch]);
};