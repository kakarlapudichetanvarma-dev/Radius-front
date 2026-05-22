import { safeSubscribe, safeUnsubscribe } from './socket.client';

/**
 * Shape of a message arriving on the personal user queue.
 * Matches what your Spring backend sends to /queue/user/{userId}
 * (or /topic/user/{userId} — adjust the topic constant below to match).
 */
export interface IncomingMessage {
  id?: string;
  messageId?: string;
  chatId: string;
  senderId: string;
  senderUsername: string;
  content: string;
  messageType: string;
  status: string;
  sentAt: string;
  deliveredAt: string | null;
  readAt: string | null;
  isDeleted?: boolean;
  isEdited?: boolean;
  replyToId?: string | null;
  attachment?: any | null;
  date?: string | null;
}

// ── Topic helpers ─────────────────────────────────────────────────────────────
// Spring's SimpMessagingTemplate.convertAndSendToUser() sends to:
//   /user/{userId}/queue/messages   (if you use convertAndSendToUser with userId)
// OR you may broadcast to:
//   /topic/user/{userId}            (manual broadcast)
//
// Check your backend's @SendTo / messagingTemplate.convertAndSend() call and
// set USER_QUEUE_TOPIC accordingly. Both variants are listed; uncomment the right one.

const userQueueTopic = (userId: string) =>
  `/user/${userId}/queue/messages`;      // ← most common with Spring Security + STOMP
  // `/topic/user/${userId}`;            // ← if you broadcast manually

let subscribedUserId: string | null = null;

/**
 * Subscribe to the personal message queue for `userId`.
 * Each incoming message is passed to `onMessage`.
 * Safe to call multiple times — only subscribes once per userId.
 */
export const subscribeToUserQueue = (
  userId: string,
  onMessage: (msg: IncomingMessage) => void
): void => {
  if (subscribedUserId === userId) return;

  // Unsubscribe previous user (e.g. after logout + re-login)
  if (subscribedUserId) {
    safeUnsubscribe(userQueueTopic(subscribedUserId));
  }

  subscribedUserId = userId;
  const topic = userQueueTopic(userId);

  console.log('👤 Subscribing to personal queue:', topic);

  safeSubscribe(topic, (frame) => {
    try {
      const payload = JSON.parse(frame.body);

      // Ignore status-only updates — those are handled by message.events
      if (payload.type === 'STATUS_UPDATE' || payload.type === 'DELETE') return;

      const messageId = payload.messageId || payload.id;

      const msg: IncomingMessage = {
        id: messageId,
        messageId,
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
      };

      onMessage(msg);
    } catch (err) {
      console.error('Failed to parse user queue message:', err);
    }
  });
};

/**
 * Unsubscribe the personal queue (call on logout).
 */
export const unsubscribeFromUserQueue = (): void => {
  if (subscribedUserId) {
    safeUnsubscribe(userQueueTopic(subscribedUserId));
    subscribedUserId = null;
  }
};