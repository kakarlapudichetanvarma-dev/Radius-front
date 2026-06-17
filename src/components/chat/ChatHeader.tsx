import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import type { RootState } from '../../store';
import CallModal from '../call/CallModal';
import IncomingCallModal from '../call/IncomingCallModal';
import TypingIndicator from './TypingIndicator';
import { useTypingUsers } from '../../hooks/useTyping';
import { useCall } from '../../hooks/useCall';
import WallpaperSettings from '../profile/WallpaperSettings';
import PrivateChatInfoPanel from './PrivateChatInfoPanel';
import GroupChatInfoPanel from './GroupChatInfoPanel';
import { getFormattedLastSeen } from '../../presence/last-seen';
import { Phone, Video } from 'lucide-react';

export default function ChatHeader() {
  const [showWallpaper,  setShowWallpaper]  = useState(false);
  const [showInfoPanel,  setShowInfoPanel]  = useState(false);
  const [showCallModal,  setShowCallModal]  = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);

  const selectedChat = useSelector((s: RootState) => s.chat.selectedChat);
  const callStatus   = useSelector((s: RootState) => s.call.status);
  const friends      = useSelector((s: RootState) => s.friend.friends);
  const onlineUsers  = useSelector((s: RootState) => s.chat.onlineUsers);
  const lastSeenMap  = useSelector((s: RootState) => s.chat.lastSeenMap);

  const typingUsers = useTypingUsers(selectedChat?.chatId ?? null);
  const isTyping    = typingUsers.length > 0;

  const { startCall } = useCall();

  const chatName = selectedChat
    ? selectedChat.type === 'GROUP'
      ? selectedChat.groupInfo?.name
      : selectedChat.otherParticipantUsername
    : null;

  const avatarUrl = (() => {
    if (!selectedChat || selectedChat.type === 'GROUP') return null;
    const f = friends.find(f => f.username === selectedChat.otherParticipantUsername);
    return f?.profilePicture ? `http://localhost:8080${f.profilePicture}` : null;
  })();

  const isPrivate    = selectedChat?.type === 'PRIVATE';
  const otherUsername = selectedChat?.otherParticipantUsername ?? '';
  const isOnline     = isPrivate && onlineUsers.includes(otherUsername);
  const lastSeenText = isPrivate && !isOnline
    ? getFormattedLastSeen(lastSeenMap[otherUsername] ?? null)
    : '';
  const memberCount  = selectedChat?.type === 'GROUP'
    ? selectedChat.groupInfo?.memberCount
    : null;

  const subTitle = (() => {
    if (!selectedChat || isTyping) return null;
    if (isPrivate) {
      if (isOnline) return { text: 'Online', green: true };
      if (lastSeenText) return { text: lastSeenText, green: false };
      return null;
    }
    if (selectedChat.type === 'GROUP' && memberCount) {
      return { text: `${memberCount} member${memberCount === 1 ? '' : 's'}`, green: false };
    }
    return null;
  })();

  const handleAudioCall = async () => {
    await startCall('AUDIO');
    setShowCallModal(true);
  };

  const handleVideoCall = async () => {
    await startCall('VIDEO');
    setShowCallModal(true);
  };

  const handleIncomingAccepted = (stream: MediaStream) => {
    localStreamRef.current = stream;
    setShowCallModal(true);
  };

  const avatarColors = [
    'from-purple-400 to-purple-600', 'from-pink-400 to-pink-600',
    'from-blue-400 to-blue-600',     'from-green-400 to-green-600',
    'from-amber-400 to-amber-600',   'from-teal-400 to-teal-600',
  ];
  const colorIdx = ((chatName?.charCodeAt(0) || 0)) % avatarColors.length;

  const isInCall = callStatus === 'CALLING' || callStatus === 'ACTIVE';

  return (
    <>
      {/* Incoming call modal — always mounted, shows when status=INCOMING */}
      <IncomingCallModal onAccepted={handleIncomingAccepted} />

      {/* Active / outgoing call modal */}
      {showCallModal && isInCall && (
        <CallModal
          localStream={localStreamRef.current}
          onClose={() => setShowCallModal(false)}
        />
      )}

      {showWallpaper && selectedChat && (
        <div className="absolute top-[65px] right-0 w-72 h-[calc(100%-65px)] z-40 bg-white border-l border-gray-200 shadow-xl flex flex-col">
          <WallpaperSettings onClose={() => setShowWallpaper(false)} />
        </div>
      )}

      <AnimatePresence>
        {showInfoPanel && selectedChat?.type === 'PRIVATE' && (
          <PrivateChatInfoPanel onClose={() => setShowInfoPanel(false)} />
        )}
        {showInfoPanel && selectedChat?.type === 'GROUP' && (
          <GroupChatInfoPanel onClose={() => setShowInfoPanel(false)} />
        )}
      </AnimatePresence>

      {/* Header bar */}
      <div className="h-[65px] bg-white border-b border-gray-100 flex items-center justify-between px-5 flex-shrink-0">

        {/* Left: avatar + name + status */}
        <div className="flex items-center gap-3">
          {selectedChat ? (
            <button
              onClick={() => setShowInfoPanel(p => !p)}
              className="flex items-center gap-3 hover:opacity-80 transition text-left"
            >
              <div className="relative flex-shrink-0">
                {selectedChat.type === 'GROUP' ? (
                  selectedChat.groupInfo?.profilePicture ? (
                    <img src={selectedChat.groupInfo.profilePicture} alt={chatName || ''} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[colorIdx]} flex items-center justify-center text-white font-bold text-sm`}>
                      {chatName?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt={chatName || ''} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[colorIdx]} flex items-center justify-center text-white font-bold text-sm`}>
                    {chatName?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                {isPrivate && (
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-green-400' : 'bg-gray-300'}`} />
                )}
              </div>

              <div>
                <p className="text-gray-900 font-semibold text-sm leading-tight">{chatName}</p>
                {isTyping ? (
                  <TypingIndicator variant="inline" />
                ) : subTitle ? (
                  <p className={`text-xs leading-tight mt-0.5 ${subTitle.green ? 'text-green-500' : 'text-gray-400'}`}>
                    {subTitle.text}
                  </p>
                ) : null}
              </div>
            </button>
          ) : null}
        </div>

        {/* Right: call buttons + dots — only show for PRIVATE chats */}
        {selectedChat && (
          <div className="flex items-center gap-1">

            {/* Audio call — only for private chats */}
            {isPrivate && (
              <button
                onClick={handleAudioCall}
                disabled={isInCall}
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Audio call"
              >
                <Phone size={18} />
              </button>
            )}

            {/* Video call — only for private chats */}
            {isPrivate && (
              <button
                onClick={handleVideoCall}
                disabled={isInCall}
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Video call"
              >
                <Video size={18} />
              </button>
            )}

            {/* More / dots */}
            <button
              onClick={() => setShowWallpaper(p => !p)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                showWallpaper
                  ? 'bg-purple-100 text-purple-600'
                  : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
              }`}
              title="More options"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
              </svg>
            </button>

          </div>
        )}
      </div>
    </>
  );
}