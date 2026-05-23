import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import CallButton from '../call/CallButton';
import CallModal from '../call/CallModal';
import { createOffer } from '../../webrtc/peer.service';
import { sendOffer } from '../../webrtc/signaling.service';
import { getAudioStream } from '../../webrtc/media.service';
import TypingIndicator from './TypingIndicator';
import { useTypingUsers } from '../../hooks/useTyping';
import WallpaperSettings from '../profile/WallpaperSettings';

export default function ChatHeader() {
  const [calling, setCalling] = useState(false);
  const [showWallpaper, setShowWallpaper] = useState(false);

  const selectedChat = useSelector(
    (state: RootState) => state.chat.selectedChat
  );

  const onlineUsers = useSelector(
    (state: RootState) => state.chat.onlineUsers
  );

  const friends = useSelector(
    (state: RootState) => state.friend.friends
  );

  const typingUsers = useTypingUsers(selectedChat?.chatId ?? null);
  const isTyping = typingUsers.length > 0;

  const chatName = selectedChat
    ? selectedChat.type === 'GROUP'
      ? selectedChat.groupInfo?.name
      : selectedChat.otherParticipantUsername
    : null;

  const avatarUrl = (() => {
    if (!selectedChat || selectedChat.type === 'GROUP') return null;
    const friend = friends.find(
      f => f.username === selectedChat.otherParticipantUsername
    );
    return friend?.profilePicture
      ? `http://localhost:8080${friend.profilePicture}`
      : null;
  })();

  const isOtherUserOnline = (): boolean => {
    if (!selectedChat || selectedChat.type === 'GROUP') return false;
    const username = selectedChat.otherParticipantUsername;
    if (!username) return false;
    if (onlineUsers.includes(username)) return true;
    const friend = friends.find(f => f.username === username);
    if (friend && onlineUsers.includes(friend.userId)) return true;
    return false;
  };

  const online = isOtherUserOnline();

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
        <CallModal
          user={chatName || ''}
          onClose={() => setCalling(false)}
        />
      )}

      {/* Wallpaper panel — slides in from the right */}
      {showWallpaper && selectedChat && (
        <div className="absolute top-16 right-0 w-72 h-[calc(100%-4rem)] z-40 bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col">
          <WallpaperSettings onClose={() => setShowWallpaper(false)} />
        </div>
      )}

      <div className="h-16 bg-black border-b border-yellow-500/20 flex items-center justify-between px-4">

        <div className="flex items-center gap-3">

          {/* Avatar */}
          {selectedChat && selectedChat.type === 'PRIVATE' && (
            <div className="relative">
              {avatarUrl ? (
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
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black ${
                  online ? 'bg-green-500' : 'bg-zinc-600'
                }`}
              />
            </div>
          )}

          <div>
            <p className="text-yellow-400 font-medium">
              {chatName || 'Select a chat'}
            </p>
            {isTyping ? (
              <TypingIndicator variant="inline" />
            ) : selectedChat && selectedChat.type === 'PRIVATE' ? (
              <p className={`text-xs ${online ? 'text-green-400' : 'text-yellow-500/60'}`}>
                {online ? 'Online' : 'Offline'}
              </p>
            ) : null}
          </div>
        </div>

        {/* Right side actions */}
        {selectedChat && (
          <div className="flex items-center gap-2">

            {/* Wallpaper button */}
            <button
              onClick={() => setShowWallpaper(prev => !prev)}
              title="Change wallpaper"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors
                ${showWallpaper
                  ? 'bg-yellow-400 text-black'
                  : 'text-yellow-500/60 hover:text-yellow-400 hover:bg-zinc-800'
                }`}
            >
              {/* Wallpaper / image icon */}
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