import { safeSubscribe } from './socket.client';
import {
  receiveIncomingCall,
  callAnswered,
  endCall,
  setSessionId,
} from '../store/slices/call.slice';
import { handleAnswer } from '../webrtc/answer.service';
import { addIceCandidate } from '../webrtc/ice.service';

const subscribedCallTopics = new Set<string>();

export function subscribeToCallEvents(chatId: string, store: any) {
  const topic = `/topic/call/${chatId}`;
  if (subscribedCallTopics.has(topic)) return;
  subscribedCallTopics.add(topic);

  safeSubscribe(topic, async (frame) => {
    try {
      const signal = JSON.parse(frame.body);
      const state = store.getState();
      const currentUserId = state.auth.user?.id;

      switch (signal.type) {
        case 'CALL_INITIATED':
          if (signal.calleeId === currentUserId) {
            store.dispatch(receiveIncomingCall({
              sessionId: signal.sessionId,
              chatId: signal.chatId,
              callerId: signal.callerId,
              callerUsername: signal.callerUsername || signal.callerId,
              callType: signal.callType || 'AUDIO',
              offerSdp: signal.sdp,
            }));
          }
          if (signal.callerId === currentUserId) {
            store.dispatch(setSessionId(signal.sessionId));
          }
          break;

        case 'CALL_ANSWERED':
          if (signal.callerId === currentUserId && signal.sdp) {
            await handleAnswer(signal.sdp);
            store.dispatch(callAnswered());
          }
          break;

        case 'ICE_CANDIDATE':
          if (signal.fromUserId !== currentUserId && signal.candidate) {
            await addIceCandidate(signal);
          }
          break;

        case 'CALL_ENDED':
        case 'CALL_DECLINED':
        case 'CALL_MISSED':
          store.dispatch(endCall());
          break;
      }
    } catch (err) {
      console.error('Error processing call signal:', err);
    }
  });
}

export function resetCallSubscriptions() {
  subscribedCallTopics.clear();
}