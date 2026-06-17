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
      console.log('[startCall] starting call, type:', callType, 'calleeId:', calleeId, 'chatId:', chatId);

      // Get media stream based on call type
      const stream = callType === 'VIDEO'
        ? await getVideoStream()
        : await getAudioStream();

      console.log('[startCall] got media stream:', stream);
      localStreamRef.current = stream;

      // Init peer connection
      const pc = await initPeerConnection();
      console.log('[startCall] peer connection initialized:', pc);

      // Create SDP offer
      const offer = await createOffer(stream);
      console.log('[startCall] offer created:', offer);

      // Subscribe to call events for this chat
      subscribeToCallEvents(chatId, store);

      // Update Redux state
      dispatch(startOutgoingCall({
        chatId,
        calleeId,
        calleeUsername: calleeId,
        callType,
      }));

      // Send offer to backend via STOMP
      sendCallInitiate(chatId, calleeId, callType, offer);
      console.log('[startCall] call.initiate sent over socket');

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