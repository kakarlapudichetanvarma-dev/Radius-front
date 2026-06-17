import { socketClient } from '../socket/socket.client';

// Step 1 — Caller initiates call
export function sendCallInitiate(
  chatId: string,
  calleeId: string,
  callType: 'AUDIO' | 'VIDEO',
  sdpOffer: RTCSessionDescriptionInit
) {
  if (!socketClient?.connected) return;
  socketClient.publish({
    destination: `/app/call.initiate/${chatId}`,
    body: JSON.stringify({
      calleeId,
      callType,
      sdp: sdpOffer,
    }),
  });
}

// Step 2 — Callee answers
export function sendCallAnswer(
  sessionId: string,
  sdpAnswer: RTCSessionDescriptionInit
) {
  if (!socketClient?.connected) return;
  socketClient.publish({
    destination: `/app/call.answer/${sessionId}`,
    body: JSON.stringify({ sdp: sdpAnswer }),
  });
}

// Step 3 — ICE candidate
export function sendIceCandidate(
  sessionId: string,
  candidate: RTCIceCandidate
) {
  if (!socketClient?.connected) return;
  socketClient.publish({
    destination: `/app/call.ice/${sessionId}`,
    body: JSON.stringify({
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex,
    }),
  });
}

// Step 4 — End call
export function sendCallEnd(sessionId: string) {
  if (!socketClient?.connected) return;
  socketClient.publish({
    destination: `/app/call.end/${sessionId}`,
    body: JSON.stringify({}),
  });
}

// Step 5 — Decline call
export function sendCallDecline(sessionId: string) {
  if (!socketClient?.connected) return;
  socketClient.publish({
    destination: `/app/call.decline/${sessionId}`,
    body: JSON.stringify({}),
  });
}

// Step 6 — Missed call
export function sendCallMissed(sessionId: string) {
  if (!socketClient?.connected) return;
  socketClient.publish({
    destination: `/app/call.missed/${sessionId}`,
    body: JSON.stringify({}),
  });
}