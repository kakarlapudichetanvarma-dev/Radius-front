import { useEffect } from 'react';
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
  updateChatAvatar,
} from '../store/slices/chat.slice';
import { store } from '../store';

let initialized = false;
const backgroundSubscriptions = new Set<string>();

export const useSocket = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const chats = useSelector((state: RootState) => state.chat.chats);

  // ── Boot socket once on login ────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user?.id || initialized) return;
    initialized = true;

    initMessageEvents(store, receiveMessage, updateMessageStatus);
    connectPresence();
    ensureSocketConnected();

    // ✅ Listen for profile picture updates broadcast by chat-service via Kafka
    safeSubscribe('/topic/profile-updated', (frame) => {
      try {
        const payload = JSON.parse(frame.body);
        if (payload.type !== 'PROFILE_UPDATED') return;

        const { username, profilePicture, userId } = payload;
        if (!username) return;

        // ✅ Build the correct cache-busted path (relative, no host prefix)
        //    ChatList and ChatHeader prepend http://localhost:8080 themselves
        const cacheBust = `?t=${Date.now()}`;
        const picturePath = profilePicture
          ? `${profilePicture}${cacheBust}`
          : `/api/v1/auth/users/${userId}/profile-picture${cacheBust}`;

        // ✅ Update Redux chat avatars
        dispatch(updateChatAvatar({ username, profilePicture: picturePath }));

        // ✅ Fire custom event — ChatList, ChatHeader, ProfileBar all listen to this
        //    Pass relative path so each listener builds its own full URL correctly
        window.dispatchEvent(
          new CustomEvent('profile-updated', {
            detail: { username, profilePicture: picturePath },
          })
        );

        console.log('🖼️ Profile updated via WebSocket for:', username);
      } catch (err) {
        console.error('profile-updated parse error:', err);
      }
    });

    return () => {
      initialized = false;
      backgroundSubscriptions.forEach(topic => safeUnsubscribe(topic));
      backgroundSubscriptions.clear();
    };
  }, [isAuthenticated, user?.id, dispatch]);

  // ── Subscribe to ALL chat topics for background badge updates ────────────
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    chats.forEach(chat => {
      if (chat.chatId.startsWith('temp-')) return;
      const topic = `/topic/chat/${chat.chatId}`;
      if (backgroundSubscriptions.has(topic)) return;

      backgroundSubscriptions.add(topic);

      safeSubscribe(topic, (frame) => {
        try {
          const payload = JSON.parse(frame.body);
          if (payload.type === 'STATUS_UPDATE' || payload.type === 'DELETE') return;

          const state = store.getState();
          const openChatId = state.chat.selectedChatId;
          const currentUserId = state.auth.user?.id;

          if (payload.senderId === currentUserId) return;
          if (payload.chatId === openChatId) return;

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

          const chatExists = state.chat.chats.some(c => c.chatId === payload.chatId);
          if (!chatExists && user?.username) {
            dispatch(fetchChats(user.username));
          }
        } catch (err) {
          console.error('Background chat topic parse error:', err);
        }
      });
    });
  }, [chats, isAuthenticated, user?.id, user?.username, dispatch]);
};