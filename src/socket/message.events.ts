import {
  setUserTypingInChat,
  clearUserTypingInChat,
} from '../store/slices/chat.slice';

import {
  safeSubscribe
} from './socket.client';

// ── REMOVED: presenceSubscribed — presence is handled exclusively
//             by presence.events.ts to avoid duplicate subscriptions ──

let _store: any = null;
let _receiveMessage: any = null;
let _updateMessageStatus: any = null;

const activeChatTopics = new Set<string>();
const pendingOwnMessages = new Map<string, { content: string; chatId: string }>();
const realIdToOptimisticId = new Map<string, string>();
const alreadyProcessedIds = new Set<string>();
const typingClearTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const trackOptimisticMessage = (
  chatId: string,
  content: string,
  optimisticId: string
): void => {
  pendingOwnMessages.set(optimisticId, { content, chatId });
};

export const initMessageEvents = (
  store: any,
  receiveMessage: any,
  updateMessageStatus: any
) => {
  _store = store;
  _receiveMessage = receiveMessage;
  _updateMessageStatus = updateMessageStatus;
};

const buildRealMessage = (payload: any, messageId: string) => ({
  id: messageId,
  chatId: payload.chatId,
  senderId: payload.senderId,
  senderUsername: payload.senderUsername,
  content: payload.content,
  messageType: payload.messageType || 'TEXT',
  status: payload.status || 'DELIVERED',
  sentAt: payload.sentAt,
  deliveredAt: payload.deliveredAt || null,
  readAt: payload.readAt || null,
  isDeleted: payload.deleted || false,
  isEdited: payload.edited || false,
  editedAt: payload.editedAt || null,
  replyToId: payload.replyToId || null,
  attachment: payload.attachment || null,
  date: null
});

const findMatchingOptimisticId = (
  incomingContent: string,
  incomingChatId: string
): string | null => {
  for (const [optimisticId, meta] of pendingOwnMessages.entries()) {
    if (meta.chatId === incomingChatId && meta.content === incomingContent) {
      return optimisticId;
    }
  }
  return null;
};

export const subscribeToChat = (chatId: string): void => {
  const topic = `/topic/chat/${chatId}`;
  if (activeChatTopics.has(topic)) return;
  activeChatTopics.add(topic);

  console.log('📡 SUB:', topic);

  safeSubscribe(topic, frame => {
    if (!_store || !_receiveMessage) return;

    const payload = JSON.parse(frame.body);
    const state = _store.getState();
    const currentUsername = state.auth.user?.username;

    if (payload.type === 'TYPING') {
      if (payload.username === currentUsername) return;
      const key = `${chatId}:${payload.username}`;
      _store.dispatch(setUserTypingInChat({ chatId, username: payload.username }));
      if (typingClearTimers.has(key)) clearTimeout(typingClearTimers.get(key)!);
      typingClearTimers.set(key, setTimeout(() => {
        _store.dispatch(clearUserTypingInChat({ chatId, username: payload.username }));
        typingClearTimers.delete(key);
      }, 3000));
      return;
    }

    if (payload.type === 'STOP_TYPING') {
      if (payload.username === currentUsername) return;
      const key = `${chatId}:${payload.username}`;
      if (typingClearTimers.has(key)) {
        clearTimeout(typingClearTimers.get(key)!);
        typingClearTimers.delete(key);
      }
      _store.dispatch(clearUserTypingInChat({ chatId, username: payload.username }));
      return;
    }

    if (payload.type === 'STATUS_UPDATE') {
      if (_updateMessageStatus && payload.messageId && payload.status) {
        const optimisticId = realIdToOptimisticId.get(payload.messageId);
        _store.dispatch(_updateMessageStatus({
          messageId: optimisticId || payload.messageId,
          status: payload.status,
        }));
      }
      return;
    }

    if (payload.type === 'DELETE') {
      if (payload.messageId) {
        _store.dispatch({ type: 'chat/deleteMessageLocally', payload: payload.messageId });
      }
      return;
    }

    if (payload.type === 'GROUP_DELETED') {
      const deletedChatId = payload.chatId;
      _store.dispatch({ type: 'chat/removeChat', payload: deletedChatId });
      const currentSelected = _store.getState().chat.selectedChatId;
      if (currentSelected === deletedChatId) {
        _store.dispatch({ type: 'chat/setSelectedChat', payload: null });
      }
      return;
    }

    if (payload.type === 'EDIT') {
      if (payload.messageId) {
        _store.dispatch({
          type: 'chat/applyMessageEdit',
          payload: {
            messageId: payload.messageId,
            content: payload.content,
            editedAt: payload.sentAt || new Date().toISOString(),
          },
        });
      }
      return;
    }

    const messageId = payload.messageId || payload.id;

    if (alreadyProcessedIds.has(messageId)) return;
    alreadyProcessedIds.add(messageId);
    setTimeout(() => alreadyProcessedIds.delete(messageId), 1000);

    const realMessage = buildRealMessage(payload, messageId);
    const currentUserId = state.auth.user?.id;
    const isCurrentChat = state.chat.selectedChatId === realMessage.chatId;
    const archived = state.chat.archivedChatIds?.includes(realMessage.chatId) ?? false;

    if (payload.senderId === currentUserId) {
      const optimisticId = findMatchingOptimisticId(payload.content ?? '', payload.chatId);
      if (optimisticId) {
        pendingOwnMessages.delete(optimisticId);
        realIdToOptimisticId.set(messageId, optimisticId);
        _store.dispatch({
          type: 'chat/replaceOptimisticWithReal',
          payload: { optimisticId, realMessage },
        });
      }
      if (!archived) {
        _store.dispatch({ type: 'chat/updateChatLastMessage', payload: realMessage });
      }
      return;
    }

    const exists = state.chat.messages.some((m: any) => m.id === messageId);
    console.log('📨 INCOMING MSG:', {
      messageId,
      chatId: realMessage.chatId,
      content: realMessage.content,
      senderId: payload.senderId,
      currentUserId,
      isCurrentChat,
      archived,
      exists,
      selectedChatId: state.chat.selectedChatId,
      messagesInStore: state.chat.messages.length,
    });

    if (!exists) {
      if (!archived) {
        _store.dispatch(_receiveMessage(realMessage));
      } else if (isCurrentChat) {
        _store.dispatch(_receiveMessage(realMessage));
      }
    }
  });
};

// ── REMOVED: subscribeToPresence() — handled by presence.events.ts ──

export const resetMessageEvents = (): void => {
  // Note: presence cleanup is done by disconnectPresence() in presence.events.ts
  pendingOwnMessages.clear();
  realIdToOptimisticId.clear();
  alreadyProcessedIds.clear();
  activeChatTopics.clear();
  typingClearTimers.forEach(timer => clearTimeout(timer));
  typingClearTimers.clear();
};

export const unsubscribeFromChat = (): void => {};