import { getIceServers, createPeerConnection } from '../config/webrtc.config';

let _pc: RTCPeerConnection | null = null;

export async function initPeerConnection(): Promise<RTCPeerConnection> {
  closePeerConnection();
  const iceServers = await getIceServers();
  _pc = createPeerConnection(iceServers);
  return _pc;
}

export function getPeerConnection(): RTCPeerConnection | null {
  return _pc;
}

export function closePeerConnection() {
  if (_pc) {
    _pc.close();
    _pc = null;
  }
}