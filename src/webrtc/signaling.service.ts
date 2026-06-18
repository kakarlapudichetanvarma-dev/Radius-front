import { socketClient } from '../socket/socket.client';

export function sendCallInitiate(
  chatId: string,
  calleeId: string,
  callType: 'AUDIO' | 'VIDEO',
  sdpOffer: RTCSessionDescriptionInit
) {
  if (!socketClient?.connected) {
    console.warn('Socket not connected for call.initiate');
    return;
  }

  socketClient.publish({
    destination: `/app/call.initiate/${chatId}`,
    body: JSON.stringify({
      calleeId,
      callType,
      sdp: sdpOffer
    }),
  });
}

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

export function sendCallEnd(sessionId: string) {
  if (!socketClient?.connected) return;
  socketClient.publish({
    destination: `/app/call.end/${sessionId}`,
    body: JSON.stringify({}),
  });
}

export function sendCallDecline(sessionId: string) {
  if (!socketClient?.connected) return;
  socketClient.publish({
    destination: `/app/call.decline/${sessionId}`,
    body: JSON.stringify({}),
  });
}