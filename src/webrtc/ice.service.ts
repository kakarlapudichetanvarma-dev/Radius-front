import { getPeerConnection } from './peer.service';

export async function addIceCandidate(candidateData: any): Promise<void> {
  const pc = getPeerConnection();
  if (!pc) {
    console.warn('No peer connection to add ICE candidate');
    return;
  }

  try {
    const candidate = new RTCIceCandidate({
      candidate: candidateData.candidate,
      sdpMid: candidateData.sdpMid,
      sdpMLineIndex: candidateData.sdpMLineIndex,
    });

    await pc.addIceCandidate(candidate);
    console.log('✅ ICE candidate added successfully');
  } catch (err) {
    console.error('❌ Failed to add ICE candidate:', err);
  }
}