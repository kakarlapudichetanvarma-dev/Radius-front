import { setUserOnline, setUserOffline } from '../store/slices/chat.slice';
import { safeSubscribe, safeUnsubscribe } from './socket.client';

let _store: any = null;
let _receiveMessage: any = null;
let _updateMessageStatus: any = null;

const subscribedTopics = new Set<string>();
const pendingOwnMessages = new Map<string, string>(); // content → optimisticId
const realIdToOptimisticId = new Map<string, string>();
const alreadyProcessedIds = new Set<string>();
const pendingStatusUpdates = new Map<string, string>();

export const trackOptimisticMessage = (
  chatId: string,
  content: string,
  optimisticId: string
): void => {
  pendingOwnMessages.set(content, optimisticId);
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
  replyToId: payload.replyToId || null,
  attachment: payload.attachment || null,
  date: null
});

export const subscribeToChat = (chatId: string): void => {
  const topic = `/topic/chat/${chatId}`;
  if (subscribedTopics.has(topic)) return;
  subscribedTopics.add(topic);

  console.log('📡 SUBSCRIBING:', topic);

  safeSubscribe(topic, frame => {
    if (!_store || !_receiveMessage) return;

    const payload = JSON.parse(frame.body);
    const state = _store.getState();

    // ─── STATUS UPDATE ────────────────────────────────────────
    if (payload.type === 'STATUS_UPDATE') {
      if (_updateMessageStatus && payload.messageId && payload.status) {
        const optimisticId = realIdToOptimisticId.get(payload.messageId);
        if (optimisticId) {
          _store.dispatch(_updateMessageStatus({ messageId: optimisticId, status: payload.status }));
        } else {
          const existsInState = state.chat.messages.some((m: any) => m.id === payload.messageId);
          if (existsInState) {
            _store.dispatch(_updateMessageStatus({ messageId: payload.messageId, status: payload.status }));
          } else {
            console.log('⏳ Queuing STATUS_UPDATE for:', payload.messageId);
            pendingStatusUpdates.set(payload.messageId, payload.status);
          }
        }
      }
      return;
    }

    if (payload.type === 'DELETE') return;

    // ─── REAL MESSAGE ─────────────────────────────────────────
    const messageId = payload.messageId || payload.id;
    const currentUserId = state.auth.user?.id;

    // ─── DEDUP: already handled this message ID ───────────────
    if (alreadyProcessedIds.has(messageId)) {
      console.log('🚫 Duplicate WS frame blocked:', messageId);
      return;
    }

    // ─── OWN MESSAGE ─────────────────────────────────────────
    if (payload.senderId === currentUserId) {
      // Mark processed immediately so no second WS frame sneaks through
      alreadyProcessedIds.add(messageId);
      setTimeout(() => alreadyProcessedIds.delete(messageId), 60_000);

      const key = payload.content;
      const optimisticId = pendingOwnMessages.get(key);

      if (optimisticId) {
        // ── Path A: normal send flow, optimistic is tracked ──────
        pendingOwnMessages.delete(key);
        realIdToOptimisticId.set(messageId, optimisticId);

        console.log('🔄 Matched optimistic:', optimisticId, '↔ real:', messageId);

        // replaceOptimisticWithReal handles all sub-cases:
        //   • optimistic still in state → replace it
        //   • fetchMessages already added real → remove optimistic only
        //   • neither present → push real
        _store.dispatch({
          type: 'chat/replaceOptimisticWithReal',
          payload: { optimisticId, realMessage: buildRealMessage(payload, messageId) }
        });

        const queuedStatus = pendingStatusUpdates.get(messageId);
        if (queuedStatus && _updateMessageStatus) {
          pendingStatusUpdates.delete(messageId);
          _store.dispatch(_updateMessageStatus({ messageId, status: queuedStatus }));
        }
        return;
      }

      // ── Path B: after refresh — pendingOwnMessages was cleared ──
      // Check if message is already in state (added by fetchMessages)
      const existsById = state.chat.messages.some((m: any) => m.id === messageId);
      if (existsById) {
        // Already in state — nothing to do
        return;
      }

      // Look for a surviving temp-ID optimistic with matching content
      const contentMatch = state.chat.messages.find(
        (m: any) =>
          m.id.startsWith('temp-') &&
          m.content === payload.content &&
          m.senderId === currentUserId &&
          m.chatId === payload.chatId
      );

      if (contentMatch) {
        _store.dispatch({
          type: 'chat/replaceOptimisticWithReal',
          payload: { optimisticId: contentMatch.id, realMessage: buildRealMessage(payload, messageId) }
        });
        return;
      }

      // Not in state and no optimistic — add it directly.
      // fetchMessages.fulfilled will deduplicate via incomingIds.
      _store.dispatch(_receiveMessage(buildRealMessage(payload, messageId)));
      return;
    }

    // ─── MESSAGE FROM ANOTHER USER ────────────────────────────
    const exists = state.chat.messages.some((m: any) => m.id === messageId);
    if (exists) {
      // Already in state (e.g. from fetchMessages) — just update status
      if (_updateMessageStatus) {
        _store.dispatch(_updateMessageStatus({ messageId, status: payload.status || 'DELIVERED' }));
      }
      return;
    }

    console.log('📩 REALTIME MESSAGE:', messageId);
    _store.dispatch(_receiveMessage(buildRealMessage(payload, messageId)));
  });
};

export const subscribeToPresence = (userId: string): void => {
  const topic = `/topic/presence`;
  if (subscribedTopics.has(topic)) return;
  subscribedTopics.add(topic);

  safeSubscribe(topic, frame => {
    const payload = JSON.parse(frame.body);
    if (payload.status === 'ONLINE') {
      _store.dispatch(setUserOnline(payload.username));
    } else {
      _store.dispatch(setUserOffline(payload.username));
    }
  });
};

export const unsubscribeFromChat = (chatId: string): void => {
  const topic = `/topic/chat/${chatId}`;
  subscribedTopics.delete(topic);
  safeUnsubscribe(topic);
};