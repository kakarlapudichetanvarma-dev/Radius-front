import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import type { AppDispatch, RootState } from '../../store';
import { setSelectedChat, unarchiveChat, markChatArchived } from '../../store/slices/chat.slice';
import type { ChatSummary } from '../../types/chat.types';
import TypingIndicator from './TypingIndicator';
import { useIsTyping } from '../../hooks/useTyping';
import { chatService } from '../../services/chat.service';
import { Archive } from 'lucide-react';
// ── Avatar ────────────────────────────────────────────────────────────────────

interface AvatarProps {
  chat: ChatSummary;
  size?: number;
  avatarUrl: string | null;
  online: boolean;
  chatName: string;
  isGroup: boolean;
}

function Avatar({ size = 10, avatarUrl, online, chatName, isGroup }: AvatarProps) {
  return (
    <div className="relative flex-shrink-0">
      {avatarUrl ? (
        <img
          key={avatarUrl}
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

// ── Chat context menu ─────────────────────────────────────────────────────────

interface ChatMenuProps {
  chatId: string;
  onClose: () => void;
  onArchived: (chatId: string) => void;
}

function ChatContextMenu({ chatId, onClose, onArchived }: ChatMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const dispatch = useDispatch<AppDispatch>();

  const handleArchive = async () => {
    try {
      await chatService.archiveChat(chatId);
      // ✅ Remove from sidebar + track as archived in Redux immediately
      dispatch(markChatArchived(chatId));
      onArchived(chatId);
    } catch (err) {
      console.error('Archive failed:', err);
    }
    onClose();
  };

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.92, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -4 }}
      transition={{ duration: 0.1 }}
      className="absolute right-0 top-full mt-1 z-50 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden min-w-[150px]"
    >
      <button
        onClick={handleArchive}
        className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-zinc-800 transition flex items-center gap-2"
      >
        <Archive size={16} /> Archive Chat
      </button>
    </motion.div>
  );
}

// ── Chat Item ─────────────────────────────────────────────────────────────────

interface ChatItemProps {
  chat: ChatSummary;
  chatName: string;
  isGroup: boolean;
  avatarUrl: string | null;
  online: boolean;
  isSelected: boolean;
  onClick: () => void;
  onArchived: (chatId: string) => void;
}

function ChatItem({ chat, chatName, isGroup, avatarUrl, online, isSelected, onClick, onArchived }: ChatItemProps) {
  const isTyping = useIsTyping(chat.chatId);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`w-full text-left p-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition ${isSelected ? 'bg-zinc-800' : ''}`}
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
              <p className="text-white text-sm font-medium truncate">{chatName}</p>
              {chat.lastMessageAt && (
                <p className="text-zinc-500 text-xs flex-shrink-0 ml-2">
                  {new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>

            <div className="flex justify-between items-center">
              {isTyping ? (
                <TypingIndicator variant="inline" />
              ) : (
                <p className="text-zinc-500 text-xs truncate">{chat.lastMessage || 'No messages yet'}</p>
              )}
              {!isTyping && chat.unreadCount > 0 && !isSelected && (
                <span className="ml-2 bg-green-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center flex-shrink-0">
                  {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* ▾ arrow — bottom-right corner just above the border */}
      <div className="absolute bottom-0.5 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={e => { e.stopPropagation(); setShowMenu(prev => !prev); }}
          className="w-5 h-5 flex items-center justify-center rounded-full bg-zinc-700/80 hover:bg-zinc-600 text-zinc-300 text-xs"
          title="Chat options"
        >
          ▾
        </button>

        <AnimatePresence>
          {showMenu && (
            <ChatContextMenu
              chatId={chat.chatId}
              onClose={() => setShowMenu(false)}
              onArchived={onArchived}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Archived Chats Panel ──────────────────────────────────────────────────────

interface ArchivedPanelProps {
  onClose: () => void;
}

function ArchivedChatsPanel({ onClose }: ArchivedPanelProps) {
  const dispatch = useDispatch<AppDispatch>();
  const friends = useSelector((state: RootState) => state.friend.friends);
  const onlineUsers = useSelector((state: RootState) => state.chat.onlineUsers);
  const [archivedChats, setArchivedChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await chatService.getArchivedChats();
        setArchivedChats(res.data.data || []);
      } catch (err) {
        console.error('Failed to load archived chats:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUnarchive = async (chatId: string) => {
    try {
      // ✅ Find the chat BEFORE the API call
      const chat = archivedChats.find(c => c.chatId === chatId);
      await chatService.unarchiveChat(chatId);
      // ✅ Remove from archived panel immediately
      setArchivedChats(prev => prev.filter(c => c.chatId !== chatId));
      // ✅ Use imported action creator — dispatches correctly into Redux
      if (chat) {
        dispatch(unarchiveChat(chat));
      }
    } catch (err) {
      console.error('Unarchive failed:', err);
    }
  };

  const getAvatarUrl = (chat: ChatSummary): string | null => {
    if (chat.type !== 'PRIVATE') return null;
    const username = chat.otherParticipantUsername;
    if (!username) return null;
    const friend = friends.find(f => f.username === username);
    if (friend?.profilePicture) return `http://localhost:8080${friend.profilePicture}`;
    if (chat.otherParticipantAvatar) return `http://localhost:8080${chat.otherParticipantAvatar}`;
    return null;
  };

  const getChatName = (chat: ChatSummary) =>
    chat.type === 'GROUP' ? (chat.groupInfo?.name || 'Group') : (chat.otherParticipantUsername || '?');

  const isOnline = (chat: ChatSummary) => {
    if (chat.type !== 'PRIVATE') return false;
    return onlineUsers.includes(chat.otherParticipantUsername || '');
  };

  const handleOpen = (chat: ChatSummary) => {
    dispatch(setSelectedChat(chat));
    onClose();
  };

  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'tween', duration: 0.22 }}
      className="absolute inset-0 z-40 bg-zinc-950 flex flex-col"
    >
      {/* Header */}
      <div className="h-16 border-b border-zinc-800 flex items-center px-4 gap-3 flex-shrink-0">
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white transition text-lg"
        >
          ←
        </button>
        <div>
          <p className="text-white font-semibold">Archived Chats</p>
          <p className="text-zinc-500 text-xs">{archivedChats.length} chat{archivedChats.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-zinc-500 text-sm">Loading…</p>
          </div>
        ) : archivedChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
            <Archive size={32} className="text-zinc-500 mb-2" />
            <p className="text-sm">No archived chats</p>
          </div>
        ) : (
          archivedChats.map(chat => {
            const chatName = getChatName(chat);
            const isGroup = chat.type === 'GROUP';
            const avatarUrl = getAvatarUrl(chat);
            const online = isOnline(chat);

            return (
              <div key={chat.chatId} className="relative group border-b border-zinc-800 hover:bg-zinc-800/40 transition">
                <button
                  onClick={() => handleOpen(chat)}
                  className="w-full text-left p-4"
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
                      <p className="text-white text-sm font-medium truncate">{chatName}</p>
                      <p className="text-zinc-500 text-xs truncate">{chat.lastMessage || 'No messages yet'}</p>
                    </div>
                    {chat.lastMessageAt && (
                      <p className="text-zinc-600 text-xs flex-shrink-0">
                        {new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </button>

                {/* Unarchive button */}
                <button
                  onClick={e => { e.stopPropagation(); handleUnarchive(chat.chatId); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-zinc-700 hover:bg-zinc-600 text-white px-2 py-1 rounded-lg"
                  title="Unarchive"
                >
                  Unarchive
                </button>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

// ── Main ChatList ─────────────────────────────────────────────────────────────

export default function ChatList() {
  const dispatch = useDispatch<AppDispatch>();

  const [liveUpdates, setLiveUpdates] = useState<Record<string, string>>({});
  const [localChats, setLocalChats] = useState<ChatSummary[] | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const chats = useSelector((state: RootState) => state.chat.chats);
  const friends = useSelector((state: RootState) => state.friend.friends);
  const onlineUsers = useSelector((state: RootState) => state.chat.onlineUsers);
  const selectedChatId = useSelector((state: RootState) => state.chat.selectedChatId);

  // Use localChats for optimistic archive removal, fall back to Redux chats
  const visibleChats = localChats ?? chats;

  useEffect(() => {
    // Sync localChats when Redux chats change externally
    setLocalChats(null);
  }, [chats]);

  // Listen for archive panel open event from ProfileBar
  useEffect(() => {
    const handler = () => setShowArchived(true);
    window.addEventListener('open-archived-chats', handler);
    return () => window.removeEventListener('open-archived-chats', handler);
  }, []);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { username, profilePicture } = e.detail;
      if (!username || !profilePicture) return;
      const fullUrl = profilePicture.startsWith('http') ? profilePicture : `http://localhost:8080${profilePicture}`;
      setLiveUpdates(prev => ({ ...prev, [username]: fullUrl }));
    };
    window.addEventListener('profile-updated', handler as EventListener);
    return () => window.removeEventListener('profile-updated', handler as EventListener);
  }, []);

  const isOnline = useCallback((username: string) => {
    if (onlineUsers.includes(username)) return true;
    const friend = friends.find(f => f.username === username);
    return !!(friend && onlineUsers.includes(friend.userId));
  }, [onlineUsers, friends]);

  const getAvatarUrl = useCallback((chat: ChatSummary): string | null => {
    if (chat.type !== 'PRIVATE') return null;
    const username = chat.otherParticipantUsername;
    if (!username) return null;
    if (liveUpdates[username]) return liveUpdates[username];
    const friend = friends.find(f => f.username === username);
    if (friend?.profilePicture) return `http://localhost:8080${friend.profilePicture}?t=${Date.now()}`;
    if (chat.otherParticipantAvatar) return `http://localhost:8080${chat.otherParticipantAvatar}?t=${Date.now()}`;
    return null;
  }, [liveUpdates, friends]);

  const getFriendAvatarUrl = useCallback((username: string, profilePicture: string | null): string | null => {
    if (liveUpdates[username]) return liveUpdates[username];
    if (profilePicture) return `http://localhost:8080${profilePicture}?t=${Date.now()}`;
    return null;
  }, [liveUpdates]);

  const handleChatClick = (chat: ChatSummary) => {
    if (selectedChatId === chat.chatId) dispatch(setSelectedChat(null));
    else dispatch(setSelectedChat(chat));
  };

  const handleFriendClick = (friendUsername: string) => {
    const existingChat = chats.find(c => c.type === 'PRIVATE' && c.otherParticipantUsername === friendUsername);
    if (existingChat) {
      if (selectedChatId === existingChat.chatId) { dispatch(setSelectedChat(null)); return; }
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

  // Optimistically remove archived chat from list
  const handleArchived = useCallback((chatId: string) => {
    setLocalChats(prev => (prev ?? chats).filter(c => c.chatId !== chatId));
    // If the archived chat was selected, deselect it
    if (selectedChatId === chatId) dispatch(setSelectedChat(null));
  }, [chats, selectedChatId, dispatch]);

  const getChatName = (chat: ChatSummary) =>
    chat.type === 'GROUP' ? (chat.groupInfo?.name || 'Group') : (chat.otherParticipantUsername || '?');

  return (
    <div className="flex-1 overflow-y-auto flex flex-col relative">

      {/* Archived panel slides in over the list */}
      <AnimatePresence>
        {showArchived && (
          <ArchivedChatsPanel onClose={() => setShowArchived(false)} />
        )}
      </AnimatePresence>

      <div className="flex-1">
        {visibleChats.length > 0 && (
          <div>
            <p className="text-zinc-500 text-xs px-4 py-2 uppercase tracking-wider">Chats</p>
            {visibleChats.map(chat => {
              const chatName = getChatName(chat);
              const isGroup = chat.type === 'GROUP';
              const avatarUrl = getAvatarUrl(chat);
              const online = !isGroup && isOnline(chat.otherParticipantUsername || '');

              return (
                <ChatItem
                  key={chat.chatId}
                  chat={chat}
                  chatName={chatName}
                  isGroup={isGroup}
                  avatarUrl={avatarUrl}
                  online={online}
                  isSelected={selectedChatId === chat.chatId}
                  onClick={() => handleChatClick(chat)}
                  onArchived={handleArchived}
                />
              );
            })}
          </div>
        )}

        {chats.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
            <p className="text-sm">No chats or friends yet</p>
            <p className="text-xs mt-1">Add a friend to get started</p>
          </div>
        )}
      </div>


    </div>
  );
}