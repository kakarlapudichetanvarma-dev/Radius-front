import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { getPeerConnection } from '../webrtc/peer.service';
import { sendIceCandidate } from '../webrtc/signaling.service';

export function useWebRTC(remoteVideoRef?: React.RefObject<HTMLVideoElement>) {
  const sessionId = useSelector((s: RootState) => s.call.sessionId);
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  useEffect(() => {
    const pc = getPeerConnection();
    if (!pc) return;

    pc.onicecandidate = (event) => {
      if (event.candidate && sessionIdRef.current) {
        sendIceCandidate(sessionIdRef.current, event.candidate);
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef?.current && event.streams[0]) {
        console.log('✅ Remote stream received');
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Cleanup on unmount
    return () => {
      if (pc) {
        pc.onicecandidate = null;
        pc.ontrack = null;
      }
    };
  }, [remoteVideoRef]);
}