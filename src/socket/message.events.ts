import {
setUserOnline,
setUserOffline
} from '../store/slices/chat.slice';

import {
safeSubscribe
} from './socket.client';

let _store: any = null;
let _receiveMessage: any = null;
let _updateMessageStatus: any = null;

let presenceSubscribed = false;

// ✅ ACTIVE CHAT TOPICS
const activeChatTopics =
new Set<string>();

// ✅ optimistic tracking
const pendingOwnMessages =
new Map<
string,
{
content: string;
chatId: string;
}

> ();

const realIdToOptimisticId =
new Map<string, string>();

// ✅ duplicate prevention
const alreadyProcessedIds =
new Set<string>();

export const trackOptimisticMessage = (
chatId: string,
content: string,
optimisticId: string
): void => {

pendingOwnMessages.set(
optimisticId,
{
content,
chatId
}
);
};

export const initMessageEvents = (
store: any,
receiveMessage: any,
updateMessageStatus: any
) => {

_store = store;

_receiveMessage =
receiveMessage;

_updateMessageStatus =
updateMessageStatus;
};

const buildRealMessage = (
payload: any,
messageId: string
) => ({
id: messageId,
chatId: payload.chatId,
senderId: payload.senderId,
senderUsername:
payload.senderUsername,
content: payload.content,
messageType:
payload.messageType ||
'TEXT',
status:
payload.status ||
'DELIVERED',
sentAt: payload.sentAt,
deliveredAt:
payload.deliveredAt ||
null,
readAt:
payload.readAt || null,
isDeleted:
payload.deleted || false,
isEdited:
payload.edited || false,
replyToId:
payload.replyToId || null,
attachment:
payload.attachment ||
null,
date: null
});

const findMatchingOptimisticId = (
incomingContent: string,
incomingChatId: string
): string | null => {

for (
const [
optimisticId,
meta
] of pendingOwnMessages.entries()
) {
if (
  meta.chatId ===
    incomingChatId &&
  meta.content ===
    incomingContent
) {

  return optimisticId;
} 
}

return null;
};

// ✅ SUBSCRIBE
export const subscribeToChat = (
chatId: string
): void => {

const topic =
`/topic/chat/${chatId}`;

// already subscribed
if (
activeChatTopics.has(
topic
)
) {

activeChatTopics.delete(
topic
);
}

// ✅ always re-add
activeChatTopics.add(
topic
);

console.log(
'📡 SUB:',
topic
);

safeSubscribe(
topic,
frame => {          
  if (
    !_store ||
    !_receiveMessage
  ) {
    return;
  }

  const payload =
    JSON.parse(
      frame.body
    );

  const state =
    _store.getState();

  // STATUS UPDATE
  if (
    payload.type ===
    'STATUS_UPDATE'
  ) {

    if (
      _updateMessageStatus &&
      payload.messageId &&
      payload.status
    ) {

      const optimisticId =
        realIdToOptimisticId.get(
          payload.messageId
        );

      _store.dispatch(
        _updateMessageStatus({
          messageId:
            optimisticId ||
            payload.messageId,
          status:
            payload.status
        })
      );
    }

    return;
  }

  // DELETE EVENT
  if (
    payload.type ===
    'DELETE'
  ) {
    return;
  }

  const messageId =
    payload.messageId ||
    payload.id;

  // duplicate prevention
  if (
    alreadyProcessedIds.has(
      messageId
    )
  ) {
    return;
  }

  alreadyProcessedIds.add(
    messageId
  );

  setTimeout(() => {

    alreadyProcessedIds.delete(
      messageId
    );

  }, 1000);

  const realMessage =
    buildRealMessage(
      payload,
      messageId
    );

  const currentUserId =
    state.auth.user?.id;

  // ✅ CURRENT CHAT CHECK
  const isCurrentChat =
    state.chat.selectedChatId ===
    realMessage.chatId;

  // ✅ OWN MESSAGE
  if (
    payload.senderId ===
    currentUserId
  ) {

    const optimisticId =
      findMatchingOptimisticId(
        payload.content ??
          '',
        payload.chatId
      );

    if (optimisticId) {

      pendingOwnMessages.delete(
        optimisticId
      );

      realIdToOptimisticId.set(
        messageId,
        optimisticId
      );

      _store.dispatch({
        type:
          'chat/replaceOptimisticWithReal',
        payload: {
          optimisticId,
          realMessage
        }
      });

    } else {

      // ✅ ONLY SHOW IN CURRENT CHAT
      if (isCurrentChat) {

        const exists =
          state.chat.messages.some(
            (m: any) =>
              m.id ===
              messageId
          );

        if (!exists) {

          _store.dispatch(
            _receiveMessage(
              realMessage
            )
          );
        }
      }
    }

    // ✅ SIDEBAR UPDATE
    _store.dispatch({
      type:
        'chat/updateChatLastMessage',
      payload:
        realMessage
    });

    return;
  }

  // ✅ MESSAGE FROM OTHER USER

  const exists =
    state.chat.messages.some(
      (m: any) =>
        m.id ===
        messageId
    );

  // ✅ ONLY SHOW MESSAGE
  // IN CURRENT OPEN CHAT
  if (
    isCurrentChat &&
    !exists
  ) {

    _store.dispatch(
      _receiveMessage(
        realMessage
      )
    );
  }

  // ✅ increment unread
  if (!isCurrentChat) {

    _store.dispatch({
      type:
        'chat/incrementUnread',
      payload:
        realMessage.chatId
    });
  }

  // ✅ ALWAYS UPDATE SIDEBAR
  _store.dispatch({
    type:
      'chat/updateChatLastMessage',
    payload:
      realMessage
  });
} 
);
};

// ✅ PRESENCE
export const subscribeToPresence = (
userId: string
): void => {

if (
presenceSubscribed
) {
return;
}

presenceSubscribed = true;

safeSubscribe(
'/topic/presence',
frame => {
  const payload =
    JSON.parse(
      frame.body
    );

  if (
    payload.status ===
    'ONLINE'
  ) {

    _store.dispatch(
      setUserOnline(
        payload.username
      )
    );

  } else {

    _store.dispatch(
      setUserOffline(
        payload.username
      )
    );
  }
}
);
};

export const resetMessageEvents =
(): void => {

presenceSubscribed =
false;

pendingOwnMessages.clear();

realIdToOptimisticId.clear();

alreadyProcessedIds.clear();

activeChatTopics.clear();
};

export const unsubscribeFromChat =
(): void => {};
