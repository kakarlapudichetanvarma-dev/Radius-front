import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { endCall } from '../../store/slices/call.slice';
import { sendCallEnd } from '../../webrtc/signaling.service';
import { closePeerConnection } from '../../webrtc/peer.service';
import { stopStream } from '../../webrtc/media.service';
import { useWebRTC } from '../../hooks/useWebRTC';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useState } from 'react';

interface Props {
  localStream: MediaStream | null;
  onClose: () => void;
}

export default function CallModal({ localStream, onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const callState = useSelector((s: RootState) => s.call);

  const localVideoRef  = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [micOn,   setMicOn]   = useState(true);
  const [videoOn, setVideoOn] = useState(callState.callType === 'VIDEO');

  useWebRTC(remoteVideoRef);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const handleEnd = () => {
    if (callState.sessionId) sendCallEnd(callState.sessionId);
    closePeerConnection();
    stopStream(localStream);
    dispatch(endCall());
    onClose();
  };

  const toggleMic = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach(t => t.enabled = !t.enabled);
    setMicOn(p => !p);
  };

  const toggleVideo = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach(t => t.enabled = !t.enabled);
    setVideoOn(p => !p);
  };

  const isVideo = callState.callType === 'VIDEO';
  const isActive = callState.status === 'ACTIVE';
  const otherName = callState.calleeUsername || callState.callerUsername || 'Unknown';

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="relative w-full max-w-lg bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
        {isVideo && isActive && (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-80 object-cover bg-zinc-800"
          />
        )}

        {(!isVideo || !isActive) && (
          <div className="w-full h-48 bg-zinc-800 flex flex-col items-center justify-center gap-3">
            <div className="w-20 h-20 rounded-full bg-violet-600 flex items-center justify-center text-white text-3xl font-bold">
              {otherName.charAt(0).toUpperCase()}
            </div>
            <p className="text-white font-semibold text-lg">{otherName}</p>
            <p className="text-gray-400 text-sm">
              {isActive ? 'Connected' : 'Calling...'}
            </p>
          </div>
        )}

        {isVideo && (
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="absolute top-3 right-3 w-28 h-20 rounded-xl object-cover border-2 border-white/20 bg-zinc-700"
          />
        )}

        <div className="flex items-center justify-center gap-4 p-6">
          <button onClick={toggleMic} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${micOn ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-red-600'}`}>
            {micOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          {isVideo && (
            <button onClick={toggleVideo} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${videoOn ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-red-600'}`}>
              {videoOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
          )}

          <button onClick={handleEnd} className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white">
            <PhoneOff size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}