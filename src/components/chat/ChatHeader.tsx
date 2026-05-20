import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import CallButton from '../call/CallButton';
import CallModal from '../call/CallModal';
import { createOffer } from '../../webrtc/peer.service';
import { sendOffer } from '../../webrtc/signaling.service';
import { getAudioStream } from '../../webrtc/media.service';

export default function ChatHeader() {
  const [calling, setCalling] = useState(false);

  // ✅ Live avatar updates
  const [liveAvatar, setLiveAvatar] = useState<string | null>(null);

  const selectedChat = useSelector(
    (state: RootState) => state.chat.selectedChat
  );

  const typingUser = useSelector(
    (state: RootState) => state.chat.typingUser
  );

  const onlineUsers = useSelector(
    (state: RootState) => state.chat.onlineUsers
  );

  const friends = useSelector(
    (state: RootState) => state.friend.friends
  );

  const chatName = selectedChat
    ? selectedChat.type === 'GROUP'
      ? selectedChat.groupInfo?.name
      : selectedChat.otherParticipantUsername
    : null;

  // ✅ Listen for instant profile updates
  useEffect(() => {
    const handler = (e: any) => {
      if (
        e.detail.username ===
        selectedChat?.otherParticipantUsername
      ) {
        setLiveAvatar(
          `http://localhost:8080${e.detail.profilePicture}`
        );
      }
    };

    window.addEventListener(
      'profile-updated',
      handler
    );

    return () =>
      window.removeEventListener(
        'profile-updated',
        handler
      );
  }, [selectedChat]);

  // ✅ Get avatar URL
  const avatarUrl =
    liveAvatar ||
    (() => {
      if (
        !selectedChat ||
        selectedChat.type === 'GROUP'
      ) {
        return null;
      }

      const friend = friends.find(
        f =>
          f.username ===
          selectedChat.otherParticipantUsername
      );

      return friend?.profilePicture
        ? `http://localhost:8080${friend.profilePicture}?t=${Date.now()}`
        : null;
    })();

  // ✅ Check if other user is online
  const isOtherUserOnline = (): boolean => {
    if (
      !selectedChat ||
      selectedChat.type === 'GROUP'
    ) {
      return false;
    }

    const username =
      selectedChat.otherParticipantUsername;

    if (!username) {
      return false;
    }

    if (onlineUsers.includes(username)) {
      return true;
    }

    const friend = friends.find(
      f => f.username === username
    );

    if (
      friend &&
      onlineUsers.includes(friend.userId)
    ) {
      return true;
    }

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
      console.error(
        'Microphone error:',
        error
      );

      alert(
        'Microphone access failed. Check browser permissions.'
      );
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

      <div className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4">

        <div className="flex items-center gap-3">

          {/* ✅ Avatar */}
          {selectedChat &&
            selectedChat.type === 'PRIVATE' && (
              <div className="relative">

                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={chatName || ''}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold">
                    {chatName
                      ?.charAt(0)
                      .toUpperCase() || '?'}
                  </div>
                )}

                {/* ✅ Online dot */}
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900 ${
                    online
                      ? 'bg-green-500'
                      : 'bg-zinc-600'
                  }`}
                />
              </div>
            )}

          <div>
            <p className="text-white font-medium">
              {chatName || 'Select a chat'}
            </p>

            {typingUser ? (
              <p className="text-sm text-green-500">
                {typingUser} is typing...
              </p>
            ) : selectedChat &&
              selectedChat.type === 'PRIVATE' ? (
              <p
                className={`text-xs ${
                  online
                    ? 'text-green-400'
                    : 'text-zinc-500'
                }`}
              >
                {online ? 'Online' : 'Offline'}
              </p>
            ) : null}
          </div>
        </div>

        {selectedChat && (
          <CallButton onClick={handleCall} />
        )}
      </div>
    </>
  );
}