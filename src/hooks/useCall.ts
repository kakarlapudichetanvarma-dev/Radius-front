import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { startOutgoingCall, endCall } from '../store/slices/call.slice';
import { initPeerConnection, closePeerConnection } from '../webrtc/peer.service';
import { getAudioStream, getVideoStream, stopStream } from '../webrtc/media.service';
import { createOffer } from '../webrtc/offer.service';
import { sendCallInitiate } from '../webrtc/signaling.service';
import { subscribeToCallEvents } from '../socket/signaling.events';
import { store } from '../store';
import type { CallType } from '../store/slices/call.slice';
import { useRef } from 'react';

export function useCall() {
  const dispatch = useDispatch<AppDispatch>();
  const selectedChat = useSelector((s: RootState) => s.chat.selectedChat);
  const localStreamRef = useRef<MediaStream | null>(null);

  const startCall = async (callType: CallType) => {
    if (!selectedChat || selectedChat.type !== 'PRIVATE') {
      alert('You can only call in private chats.');
      return;
    }

    const calleeId = selectedChat.otherParticipantUsername;
    const chatId   = selectedChat.chatId;

    if (!calleeId || !chatId) return;

    try {
      console.log('[startCall] Starting call to:', calleeId, 'type:', callType);

      const stream = callType === 'VIDEO'
        ? await getVideoStream()
        : await getAudioStream();

      console.log('[startCall] Got media stream');
      localStreamRef.current = stream;

      // IMPORTANT: Subscribe BEFORE sending offer
      subscribeToCallEvents(chatId, store);

      await initPeerConnection();
      const offer = await createOffer(stream);

      dispatch(startOutgoingCall({
        chatId,
        calleeId,
        calleeUsername: calleeId,
        callType,
      }));

      sendCallInitiate(chatId, calleeId, callType, offer);
      console.log('[startCall] Offer sent successfully');

    } catch (err: any) {
      console.error('[startCall] FAILED:', err);

      closePeerConnection();
      stopStream(localStreamRef.current);
      localStreamRef.current = null;
      dispatch(endCall());

      if (err.name === 'NotAllowedError') {
        alert(`${callType === 'VIDEO' ? 'Camera/microphone' : 'Microphone'} access denied.`);
      } else {
        alert('Failed to start call. Please try again.');
      }
    }
  };

  return { startCall, localStreamRef };
}