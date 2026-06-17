import { api } from './axios.config';

export interface IceServer {
  urls: string;
  username?: string;
  credential?: string;
}

let cachedIceServers: IceServer[] | null = null;

function isValidIceServer(server: IceServer): boolean {
  return typeof server.urls === 'string' && server.urls.trim().length > 0;
}

export async function getIceServers(): Promise<IceServer[]> {
  if (cachedIceServers) return cachedIceServers;
  try {
    const res = await api.get('/api/v1/chat/webrtc/ice-servers');
    const servers: IceServer[] = res.data.data || [];
    const validServers = servers.filter(isValidIceServer);

    // If filtering removed everything (e.g. TURN not configured), fall back to public STUN
    if (validServers.length === 0) {
      cachedIceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
    } else {
      cachedIceServers = validServers;
    }

    return cachedIceServers;
  } catch {
    // fallback to Google STUN
    return [{ urls: 'stun:stun.l.google.com:19302' }];
  }
}

export function createPeerConnection(iceServers: IceServer[]): RTCPeerConnection {
  return new RTCPeerConnection({ iceServers });
}