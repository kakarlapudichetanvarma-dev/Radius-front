import { getIceServers, createPeerConnection } from '../config/webrtc.config';

let _pc: RTCPeerConnection | null = null;

export async function initPeerConnection(): Promise<RTCPeerConnection> {
  closePeerConnection();

  const iceServers = await getIceServers();
  _pc = createPeerConnection(iceServers);

  // Debug logging
  _pc.oniceconnectionstatechange = () => {
    console.log('🔄 ICE Connection State:', _pc?.iceConnectionState);
  };

  _pc.onconnectionstatechange = () => {
    console.log('🔄 Peer Connection State:', _pc?.connectionState);
  };

  _pc.onicegatheringstatechange = () => {
    console.log('🔄 ICE Gathering State:', _pc?.iceGatheringState);
  };

  return _pc;
}

export function getPeerConnection(): RTCPeerConnection | null {
  return _pc;
}

export function closePeerConnection() {
  if (_pc) {
    // Correct way to stop local tracks from peer connection
    _pc.getSenders().forEach(sender => {
      if (sender.track) {
        sender.track.stop();
      }
    });

    _pc.close();
    _pc = null;
  }
}