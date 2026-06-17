import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { acceptCall, rejectCall } from '../../store/slices/call.slice';
import { sendCallAnswer, sendCallDecline } from '../../webrtc/signaling.service';
import { initPeerConnection } from '../../webrtc/peer.service';
import { getAudioStream, getVideoStream } from '../../webrtc/media.service';
import { handleOffer } from '../../webrtc/answer.service';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useRef } from 'react';

interface Props {
  onAccepted: (stream: MediaStream) => void;
}

export default function IncomingCallModal({ onAccepted }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const callState = useSelector((s: RootState) => s.call);
  const handlingRef = useRef(false);

  if (callState.status !== 'INCOMING') return null;

  const callerName = callState.callerUsername || 'Unknown';
  const isVideo    = callState.callType === 'VIDEO';

  const handleAccept = async () => {
    if (handlingRef.current) return;
    handlingRef.current = true;

    try {
      if (!callState.offerSdp || !callState.sessionId) {
        throw new Error('Missing offer SDP or session ID');
      }

      const stream = isVideo ? await getVideoStream() : await getAudioStream();
      await initPeerConnection();

      // Build the SDP answer from the stored offer and send it back to the caller
      const answer = await handleOffer(callState.offerSdp, stream);
      sendCallAnswer(callState.sessionId, answer);

      dispatch(acceptCall());
      onAccepted(stream);
    } catch (err) {
      handlingRef.current = false;
      alert('Could not access camera/microphone.');
    }
  };

  const handleDecline = () => {
    if (callState.sessionId) {
      sendCallDecline(callState.sessionId);
    }
    dispatch(rejectCall());
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-2xl p-8 text-center shadow-2xl w-80">

        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-violet-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
          {callerName.charAt(0).toUpperCase()}
        </div>

        <p className="text-gray-400 text-sm mb-1">
          Incoming {isVideo ? 'Video' : 'Audio'} Call
        </p>
        <h2 className="text-white text-xl font-bold mb-6">{callerName}</h2>

        <div className="flex items-center justify-center gap-6">
          {/* Decline */}
          <button
            onClick={handleDecline}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-colors"
            title="Decline"
          >
            <PhoneOff size={22} />
          </button>

          {/* Accept */}
          <button
            onClick={handleAccept}
            className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-colors"
            title="Accept"
          >
            {isVideo ? <Video size={22} /> : <Phone size={22} />}
          </button>
        </div>

      </div>
    </div>
  );
}