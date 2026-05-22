import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { setSelectedChat } from '../../store/slices/chat.slice';
import type { ChatSummary } from '../../types/chat.types';
import CreateGroupModal from './CreateGroupModal';

// ── Avatar component defined OUTSIDE ChatList so it never gets recreated ──────
interface AvatarProps {
  chat: ChatSummary;
  size?: number;
  avatarUrl: string | null;
  online: boolean;
  chatName: string;
  isGroup: boolean;
}

function Avatar({ chat, size = 10, avatarUrl, online, chatName, isGroup }: AvatarProps) {
  return (
    <div className="relative flex-shrink-0">
      {avatarUrl ? (
        <img
          key={avatarUrl}  // ✅ Forces remount when URL changes — browser fetches fresh
          src={avatarUrl}
          alt={chatName}
          className={`w-${size} h-${size} rounded-full object-cover`}
        />
      ) : (
        <div className={`w-${size} h-${size} rounded-full bg-zinc-700 flex items-center justify-center text-white font-medium`}>
          {isGroup ? '👥' : chatName.charAt(0).toUpperCase() || '?'}
        </div>
      )}
      {!isGroup && (
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900 ${online ? 'bg-green-500' : 'bg-zinc-600'}`} />
      )}
    </div>
  );
}

export default function ChatList() {
  const dispatch = useDispatch<AppDispatch>();

  const [showCreateGroup, setShowCreateGroup] = useState(false);

  // ✅ liveUpdates stores the FULL url already (no double-prefix)
  // key = username, value = full URL with cache-bust
  const [liveUpdates, setLiveUpdates] = useState<Record<string, string>>({});

  const chats = useSelector((state: RootState) => state.chat.chats);
  const friends = useSelector((state: RootState) => state.friend.friends);
  const onlineUsers = useSelector((state: RootState) => state.chat.onlineUsers);
  const selectedChatId = useSelector((state: RootState) => state.chat.selectedChatId);

  // ✅ Listen for profile-updated events from ProfileModal (own user)
  //    AND from useSocket.ts (other users via WebSocket)
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { username, profilePicture } = e.detail;
      if (!username || !profilePicture) return;

      // ✅ profilePicture from the event is already a full URL with ?t= cache-bust
      //    (set correctly in both ProfileModal.tsx and useSocket.ts)
      //    Just prepend localhost if it's a relative path
      const fullUrl = profilePicture.startsWith('http')
        ? profilePicture
        : `http://localhost:8080${profilePicture}`;

      setLiveUpdates(prev => ({
        ...prev,
        [username]: fullUrl,
      }));
    };

    window.addEventListener('profile-updated', handler as EventListener);
    return () => window.removeEventListener('profile-updated', handler as EventListener);
  }, []);

  const isOnline = useCallback((username: string) => {
    if (onlineUsers.includes(username)) return true;
    const friend = friends.find(f => f.username === username);
    if (friend && onlineUsers.includes(friend.userId)) return true;
    return false;
  }, [onlineUsers, friends]);

  // ✅ Build avatar URL — liveUpdates takes priority (instant update),
  //    then friend store, then chat summary, then null (show initials)
  const getAvatarUrl = useCallback((chat: ChatSummary): string | null => {
    if (chat.type !== 'PRIVATE') return null;
    const username = chat.otherParticipantUsername;
    if (!username) return null;

    // Live update wins — already has cache-bust timestamp
    if (liveUpdates[username]) return liveUpdates[username];

    // Friend store
    const friend = friends.find(f => f.username === username);
    if (friend?.profilePicture) {
      return `http://localhost:8080${friend.profilePicture}?t=${Date.now()}`;
    }

    // Chat summary fallback
    if (chat.otherParticipantAvatar) {
      return `http://localhost:8080${chat.otherParticipantAvatar}?t=${Date.now()}`;
    }

    return null;
  }, [liveUpdates, friends]);

  const getFriendAvatarUrl = useCallback((username: string, profilePicture: string | null): string | null => {
    // Live update wins
    if (liveUpdates[username]) return liveUpdates[username];
    if (profilePicture) return `http://localhost:8080${profilePicture}?t=${Date.now()}`;
    return null;
  }, [liveUpdates]);

  const handleChatClick = (chat: ChatSummary) => {
    if (selectedChatId === chat.chatId) {
      dispatch(setSelectedChat(null));
    } else {
      dispatch(setSelectedChat(chat));
    }
  };

  const handleFriendClick = (friendUsername: string) => {
    const existingChat = chats.find(
      c => c.type === 'PRIVATE' && c.otherParticipantUsername === friendUsername
    );

    if (existingChat) {
      if (selectedChatId === existingChat.chatId) {
        dispatch(setSelectedChat(null));
        return;
      }
      dispatch(setSelectedChat(existingChat));
    } else {
      const tempChat: ChatSummary = {
        chatId: `temp-${friendUsername}`,
        type: 'PRIVATE',
        otherParticipantUsername: friendUsername,
        otherParticipantAvatar: null,
        lastMessage: null,
        lastMessageAt: null,
        archived: false,
        unreadCount: 0,
        groupInfo: null
      };
      dispatch(setSelectedChat(tempChat));
    }
  };

  const getChatName = (chat: ChatSummary) =>
    chat.type === 'GROUP'
      ? (chat.groupInfo?.name || 'Group')
      : (chat.otherParticipantUsername || '?');

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {showCreateGroup && (
        <CreateGroupModal onClose={() => setShowCreateGroup(false)} />
      )}

      <div className="flex-1">

        {/* Existing Chats */}
        {chats.length > 0 && (
          <div>
            <p className="text-zinc-500 text-xs px-4 py-2 uppercase tracking-wider">Chats</p>

            {chats.map(chat => {
              const chatName = getChatName(chat);
              const isGroup = chat.type === 'GROUP';
              const avatarUrl = getAvatarUrl(chat);
              const online = !isGroup && isOnline(chat.otherParticipantUsername || '');

              return (
                <button
                  key={chat.chatId}
                  onClick={() => handleChatClick(chat)}
                  className={`w-full text-left p-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition ${
                    selectedChatId === chat.chatId ? 'bg-zinc-800' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      chat={chat}
                      size={10}
                      avatarUrl={avatarUrl}
                      online={online}
                      chatName={chatName}
                      isGroup={isGroup}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="text-white text-sm font-medium truncate">
                          {chatName}
                        </p>
                        {chat.lastMessageAt && (
                          <p className="text-zinc-500 text-xs flex-shrink-0 ml-2">
                            {new Date(chat.lastMessageAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-zinc-500 text-xs truncate">
                          {chat.lastMessage || 'No messages yet'}
                        </p>
                        {chat.unreadCount > 0 && selectedChatId !== chat.chatId && (
                          <span className="ml-2 bg-green-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center flex-shrink-0">
                            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Friends without chats */}
        {friends.length > 0 && (
          <div>
            <p className="text-zinc-500 text-xs px-4 py-2 uppercase tracking-wider">Friends</p>

            {friends
              .filter(f => !chats.some(c => c.type === 'PRIVATE' && c.otherParticipantUsername === f.username))
              .map(friend => {
                const friendAvatarUrl = getFriendAvatarUrl(friend.username, friend.profilePicture);
                const online = isOnline(friend.username);

                return (
                  <button
                    key={friend.userId}
                    onClick={() => handleFriendClick(friend.username)}
                    className="w-full text-left p-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        {friendAvatarUrl ? (
                          <img
                            key={friendAvatarUrl}
                            src={friendAvatarUrl}
                            alt={friend.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-white font-medium">
                            {friend.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900 ${online ? 'bg-green-500' : 'bg-zinc-600'}`} />
                      </div>

                      <div>
                        <p className="text-white text-sm font-medium">{friend.username}</p>
                        <p className="text-zinc-500 text-xs">{online ? 'Online' : 'Offline'}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        )}

        {chats.length === 0 && friends.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
            <p className="text-sm">No chats or friends yet</p>
            <p className="text-xs mt-1">Add a friend to get started</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={() => setShowCreateGroup(true)}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-3 rounded-xl text-sm transition"
        >
          👥 New Group Chat
        </button>
      </div>
    </div>
  );
}