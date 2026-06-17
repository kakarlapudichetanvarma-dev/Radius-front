import { getPeerConnection } from './peer.service';

export async function createOffer(stream: MediaStream): Promise<RTCSessionDescriptionInit> {
  const pc = getPeerConnection();
  if (!pc) throw new Error('No peer connection');

  stream.getTracks().forEach(track => pc.addTrack(track, stream));

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  return offer;
}