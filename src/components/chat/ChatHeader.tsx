import { useState } from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import type { RootState } from '../../store';
import CallButton from '../call/CallButton';
import CallModal from '../call/CallModal';
import { createOffer } from '../../webrtc/peer.service';
import { sendOffer } from '../../webrtc/signaling.service';
import { getAudioStream } from '../../webrtc/media.service';
import TypingIndicator from './TypingIndicator';
import { useTypingUsers } from '../../hooks/useTyping';
import WallpaperSettings from '../profile/WallpaperSettings';
import PrivateChatInfoPanel from './PrivateChatInfoPanel';
import GroupChatInfoPanel from './GroupChatInfoPanel';

export default function ChatHeader() {
  const [calling, setCalling] = useState(false);
  const [showWallpaper, setShowWallpaper] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  const selectedChat = useSelector((state: RootState) => state.chat.selectedChat);
  const friends = useSelector((state: RootState) => state.friend.friends);

  const typingUsers = useTypingUsers(selectedChat?.chatId ?? null);
  const isTyping = typingUsers.length > 0;

  const chatName = selectedChat
    ? selectedChat.type === 'GROUP'
      ? selectedChat.groupInfo?.name
      : selectedChat.otherParticipantUsername
    : null;

  const avatarUrl = (() => {
    if (!selectedChat || selectedChat.type === 'GROUP') return null;
    const friend = friends.find(f => f.username === selectedChat.otherParticipantUsername);
    return friend?.profilePicture ? `http://localhost:8080${friend.profilePicture}` : null;
  })();

  const handleCall = async () => {
    try {
      const stream = await getAudioStream();
      const offer = await createOffer(stream);
      sendOffer(offer);
      setCalling(true);
    } catch (error) {
      console.error('Microphone error:', error);
      alert('Microphone access failed. Check browser permissions.');
    }
  };

  return (
    <>
      {calling && (
        <CallModal user={chatName || ''} onClose={() => setCalling(false)} />
      )}

      {showWallpaper && selectedChat && (
        <div className="absolute top-16 right-0 w-72 h-[calc(100%-4rem)] z-40 bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col">
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

      <div className="h-16 bg-black border-b border-yellow-500/20 flex items-center justify-between px-4">

        <div className="flex items-center gap-3">
          {selectedChat && (
            <button
              onClick={() => setShowInfoPanel(prev => !prev)}
              className="flex items-center gap-3 hover:opacity-80 transition text-left"
            >
              <div className="relative">
                {selectedChat.type === 'GROUP' ? (
                  selectedChat.groupInfo?.profilePicture ? (
                    <img
                      src={selectedChat.groupInfo.profilePicture}
                      alt={chatName || ''}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold">
                      👥
                    </div>
                  )
                ) : avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={chatName || ''}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold">
                    {chatName?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </div>

              <div>
                <p className="text-yellow-400 font-medium">
                  {chatName || 'Select a chat'}
                </p>
                {isTyping && <TypingIndicator variant="inline" />}
              </div>
            </button>
          )}

          {!selectedChat && (
            <p className="text-yellow-400 font-medium">Select a chat</p>
          )}
        </div>

        {selectedChat && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWallpaper(prev => !prev)}
              title="Change wallpaper"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors
                ${showWallpaper
                  ? 'bg-yellow-400 text-black'
                  : 'text-yellow-500/60 hover:text-yellow-400 hover:bg-zinc-800'
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </button>
            <CallButton onClick={handleCall} />
          </div>
        )}
      </div>
    </>
  );
}