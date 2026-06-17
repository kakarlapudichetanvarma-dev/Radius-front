import { getPeerConnection } from './peer.service';

export async function addIceCandidate(candidate: RTCIceCandidateInit) {
  const pc = getPeerConnection();
  if (!pc) return;
  try {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (e) {
    console.warn('Failed to add ICE candidate', e);
  }
}