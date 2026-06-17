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
    const signal = JSON.parse(frame.body);
    const state = store.getState();
    const currentUserId = state.auth.user?.id;

    switch (signal.type) {

      case 'CALL_INITIATED': {
        // Callee sees incoming call modal
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
        // Caller gets the sessionId back
        if (signal.callerId === currentUserId) {
          store.dispatch(setSessionId(signal.sessionId));
        }
        break;
      }

      case 'CALL_ANSWERED': {
        // Caller receives the SDP answer and marks call active
        if (signal.callerId === currentUserId && signal.sdp) {
          await handleAnswer(signal.sdp);
          store.dispatch(callAnswered());
        }
        break;
      }

      case 'ICE_CANDIDATE': {
        // Don't process our own ICE candidates
        if (signal.fromUserId !== currentUserId && signal.candidate) {
          await addIceCandidate({
            candidate: signal.candidate,
            sdpMid: signal.sdpMid,
            sdpMLineIndex: signal.sdpMLineIndex,
          });
        }
        break;
      }

      case 'CALL_ENDED':
      case 'CALL_DECLINED':
      case 'CALL_MISSED': {
        store.dispatch(endCall());
        break;
      }
    }
  });
}

export function resetCallSubscriptions() {
  subscribedCallTopics.clear();
}