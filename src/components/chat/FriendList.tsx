import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from '../../store';

import {
  setSelectedChat,
  setTyping,
  resetUnread,
} from '../../store/slices/chat.slice';

export default function FriendList() {
  const dispatch = useDispatch<AppDispatch>();

  const friends = useSelector((state: RootState) => state.friend.friends);
  const onlineUsers = useSelector((state: RootState) => state.chat.onlineUsers);
  const chats = useSelector((state: RootState) => state.chat.chats);
  const selectedChatId = useSelector(
    (state: RootState) => state.chat.selectedChatId
  );

  const handleClick = (friendUsername: string) => {
    const existingChat = chats.find(
      (c) =>
        c.type === 'PRIVATE' &&
        c.otherParticipantUsername === friendUsername
    );

    if (existingChat) {
      dispatch(resetUnread(existingChat.chatId));

      if (selectedChatId === existingChat.chatId) {
        dispatch(setSelectedChat(null));
      } else {
        dispatch(setSelectedChat(existingChat));
      }
    }

    dispatch(setTyping(friendUsername));

    setTimeout(() => {
      dispatch(setTyping(null));
    }, 3000);
  };

  if (friends.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-zinc-500 text-sm">No friends yet.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {friends.map((friend) => {
        const existingChat = chats.find(
          (c) =>
            c.type === 'PRIVATE' &&
            c.otherParticipantUsername === friend.username
        );

        const unreadCount = existingChat?.unreadCount || 0;

        return (
          <button
            key={friend.userId}
            onClick={() => handleClick(friend.username)}
            className={`w-full text-left p-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition ${
              selectedChatId === existingChat?.chatId ? 'bg-zinc-800' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Avatar — reads profilePicture from Redux, updates instantly */}
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-zinc-700 overflow-hidden flex items-center justify-center text-white text-sm font-medium">
                  {friend.profilePicture ? (
                    <img
                      src={`http://localhost:8080${friend.profilePicture}`}
                      alt={friend.username}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    friend.username.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Online indicator */}
                <div
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-zinc-900 ${
                    onlineUsers.includes(friend.username)
                      ? 'bg-green-500'
                      : 'bg-zinc-600'
                  }`}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Top row */}
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm truncate font-medium">
                    {friend.username}
                  </span>

                  {/* Unread count */}
                  {unreadCount > 0 && selectedChatId !== existingChat?.chatId && (
                    <span className="ml-2 bg-green-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center flex-shrink-0">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>

                {/* Last message + time */}
                <div className="flex items-center justify-between mt-1">
                  <p className="text-zinc-500 text-xs truncate">
                    {existingChat?.lastMessage || 'No messages yet'}
                  </p>

                  {existingChat?.lastMessageAt && (
                    <span className="text-zinc-600 text-[10px] ml-2 flex-shrink-0">
                      {new Date(existingChat.lastMessageAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}