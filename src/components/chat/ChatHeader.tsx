import { useState } from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import type { RootState } from '../../store';
import CallModal from '../call/CallModal';
import { createOffer } from '../../webrtc/peer.service';
import { sendOffer } from '../../webrtc/signaling.service';
import { getAudioStream } from '../../webrtc/media.service';
import TypingIndicator from './TypingIndicator';
import { useTypingUsers } from '../../hooks/useTyping';
import WallpaperSettings from '../profile/WallpaperSettings';
import PrivateChatInfoPanel from './PrivateChatInfoPanel';
import GroupChatInfoPanel from './GroupChatInfoPanel';
import { getFormattedLastSeen } from '../../presence/last-seen';

export default function ChatHeader() {
  const [calling, setCalling] = useState(false);
  const [showWallpaper, setShowWallpaper] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  const selectedChat = useSelector((s: RootState) => s.chat.selectedChat);
  const friends = useSelector((s: RootState) => s.friend.friends);
  const onlineUsers = useSelector((s: RootState) => s.chat.onlineUsers);
  const lastSeenMap = useSelector((s: RootState) => s.chat.lastSeenMap);

  const typingUsers = useTypingUsers(selectedChat?.chatId ?? null);
  const isTyping = typingUsers.length > 0;

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

  const isPrivate = selectedChat?.type === 'PRIVATE';
  const otherUsername = selectedChat?.otherParticipantUsername ?? '';
  const isOnline = isPrivate && onlineUsers.includes(otherUsername);
  const lastSeenText = isPrivate && !isOnline
    ? getFormattedLastSeen(lastSeenMap[otherUsername] ?? null)
    : '';
  const memberCount = selectedChat?.type === 'GROUP' ? selectedChat.groupInfo?.memberCount : null;

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

  const handleCall = async () => {
    try {
      const stream = await getAudioStream();
      const offer = await createOffer(stream);
      sendOffer(offer);
      setCalling(true);
    } catch {
      alert('Microphone access failed. Check browser permissions.');
    }
  };

  // Avatar initials color (consistent per name)
  const avatarColors = [
    'from-purple-400 to-purple-600', 'from-pink-400 to-pink-600',
    'from-blue-400 to-blue-600', 'from-green-400 to-green-600',
    'from-amber-400 to-amber-600', 'from-teal-400 to-teal-600',
  ];
  const colorIdx = ((chatName?.charCodeAt(0) || 0)) % avatarColors.length;

  return (
    <>
      {calling && <CallModal user={chatName || ''} onClose={() => setCalling(false)} />}

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
              {/* Avatar */}
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
                {/* Online dot */}
                {isPrivate && (
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-green-400' : 'bg-gray-300'}`} />
                )}
              </div>

              {/* Name + subtitle */}
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

        {/* Right: action icons — phone, video, dots */}
        {selectedChat && (
          <div className="flex items-center gap-1">
            {/* Phone */}
            <button
              onClick={handleCall}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
              title="Voice call"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.82a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.64a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
            </button>

            {/* Video */}
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
              title="Video call"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </button>

            {/* More / dots */}
            <button
              onClick={() => setShowWallpaper(p => !p)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${showWallpaper
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