import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { setSelectedChat } from '../../store/slices/chat.slice';
import type { ChatSummary } from '../../types/chat.types';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const dispatch = useDispatch();

  const chats = useSelector((state: RootState) => state.chat.chats);
  const friends = useSelector((state: RootState) => state.friend.friends);
  const selectedChatId = useSelector((state: RootState) => state.chat.selectedChatId);

  const q = query.trim().toLowerCase();

  // Filter chats by name
  const filteredChats = q
    ? chats.filter(c => {
        const name = c.type === 'GROUP'
          ? (c.groupInfo?.name || '')
          : (c.otherParticipantUsername || '');
        return name.toLowerCase().includes(q);
      })
    : [];

  // Filter friends by username
  const filteredFriends = q
    ? friends.filter(f =>
        f.username.toLowerCase().includes(q) &&
        !chats.some(c => c.type === 'PRIVATE' && c.otherParticipantUsername === f.username)
      )
    : [];

  const hasResults = filteredChats.length > 0 || filteredFriends.length > 0;

  const handleSelect = (chat: ChatSummary) => {
    dispatch(setSelectedChat(chat));
    setQuery('');
  };

  const handleFriendSelect = (username: string) => {
    const existing = chats.find(c => c.type === 'PRIVATE' && c.otherParticipantUsername === username);
    if (existing) {
      dispatch(setSelectedChat(existing));
    } else {
      dispatch(setSelectedChat({
        chatId: `temp-${username}`,
        type: 'PRIVATE',
        otherParticipantUsername: username,
        otherParticipantAvatar: null,
        lastMessage: null,
        lastMessageAt: null,
        archived: false,
        unreadCount: 0,
        groupInfo: null,
      }));
    }
    setQuery('');
  };

  return (
    <div className="p-3 border-b border-zinc-800 relative">
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search chats..."
        className="w-full p-3 rounded-xl bg-zinc-800 text-white text-sm outline-none placeholder-zinc-500"
      />

      {/* Dropdown results */}
      {q && (
        <div className="absolute left-3 right-3 top-[calc(100%-4px)] z-50 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
          {!hasResults ? (
            <p className="text-zinc-500 text-sm p-4 text-center">No results for "{query}"</p>
          ) : (
            <>
              {filteredChats.length > 0 && (
                <div>
                  <p className="text-zinc-600 text-xs px-4 pt-3 pb-1 uppercase tracking-wider">Chats</p>
                  {filteredChats.map(chat => {
                    const name = chat.type === 'GROUP'
                      ? (chat.groupInfo?.name || 'Group')
                      : (chat.otherParticipantUsername || '?');
                    return (
                      <button
                        key={chat.chatId}
                        onClick={() => handleSelect(chat)}
                        className={`w-full text-left px-4 py-3 hover:bg-zinc-800 transition flex items-center gap-3 ${selectedChatId === chat.chatId ? 'bg-zinc-800' : ''}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                          {chat.type === 'GROUP' ? '👥' : name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{name}</p>
                          <p className="text-zinc-500 text-xs truncate">{chat.lastMessage || 'No messages yet'}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredFriends.length > 0 && (
                <div>
                  <p className="text-zinc-600 text-xs px-4 pt-3 pb-1 uppercase tracking-wider">Friends</p>
                  {filteredFriends.map(friend => (
                    <button
                      key={friend.userId}
                      onClick={() => handleFriendSelect(friend.username)}
                      className="w-full text-left px-4 py-3 hover:bg-zinc-800 transition flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-white text-sm font-medium">{friend.username}</p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}