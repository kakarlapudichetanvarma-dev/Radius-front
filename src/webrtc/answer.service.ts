import { getPeerConnection } from './peer.service';

export async function handleOffer(
  sdp: RTCSessionDescriptionInit,
  stream: MediaStream
): Promise<RTCSessionDescriptionInit> {
  const pc = getPeerConnection();
  if (!pc) throw new Error('No peer connection');

  stream.getTracks().forEach(track => pc.addTrack(track, stream));

  await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  return answer;
}

export async function handleAnswer(sdp: RTCSessionDescriptionInit) {
  const pc = getPeerConnection();
  if (!pc) throw new Error('No peer connection');
  await pc.setRemoteDescription(new RTCSessionDescription(sdp));
}