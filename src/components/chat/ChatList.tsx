import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import type { AppDispatch, RootState } from '../../store';
import { setSelectedChat, unarchiveChat, markChatArchived, selectOnlineUsers, selectLastSeenMap } from '../../store/slices/chat.slice';
import type { ChatSummary } from '../../types/chat.types';
import TypingIndicator from './TypingIndicator';
import { useIsTyping } from '../../hooks/useTyping';
import { chatService } from '../../services/chat.service';
import { Archive } from 'lucide-react';
import { formatLastSeen } from '../../presence/last-seen';

// ── Message Tick ──────────────────────────────────────────────────────────────

interface MessageTickProps {
  status: 'SENT' | 'DELIVERED' | 'READ' | null;
}

function MessageTick({ status }: MessageTickProps) {
  if (!status) return null;
  if (status === 'SENT') {
    return (
      <svg className="w-4 h-4 flex-shrink-0 text-zinc-500" viewBox="0 0 16 11" fill="none">
        <path d="M1 5.5L5.5 10L15 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (status === 'DELIVERED') {
    return (
      <svg className="w-5 h-4 flex-shrink-0 text-zinc-500" viewBox="0 0 20 11" fill="none">
        <path d="M1 5.5L5.5 10L15 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 5.5L10.5 10L20 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (status === 'READ') {
    return (
      <svg className="w-5 h-4 flex-shrink-0 text-blue-400" viewBox="0 0 20 11" fill="none">
        <path d="M1 5.5L5.5 10L15 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 5.5L10.5 10L20 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  return null;
}

// ── Avatar ────────────────────────────────────────────────────────────────────

interface AvatarProps {
  chat: ChatSummary;
  size?: number;
  avatarUrl: string | null;
  chatName: string;
  isGroup: boolean;
  isOnline?: boolean; // ✅ new
}

function Avatar({ size = 10, avatarUrl, chatName, isGroup, isOnline }: AvatarProps) {
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
          {chatName.charAt(0).toUpperCase() || '?'}
        </div>
      )}

      {/* ✅ Online dot — only for private chats */}
      {!isGroup && (
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-950 transition-colors duration-300 ${
            isOnline ? 'bg-green-400' : 'bg-zinc-600'
          }`}
        />
      )}
    </div>
  );
}

// ── Chat Context Menu ─────────────────────────────────────────────────────────

interface ChatMenuProps {
  chatId: string;
  onClose: () => void;
  onArchived: (chatId: string) => void;
}

function ChatContextMenu({ chatId, onClose, onArchived }: ChatMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleArchive = async () => {
    try {
      await chatService.archiveChat(chatId);
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
  isSelected: boolean;
  currentUserId: string | null;
  isOnline: boolean;       // ✅ new
  lastSeenText: string;    // ✅ new
  onClick: () => void;
  onArchived: (chatId: string) => void;
}

function ChatItem({
  chat, chatName, isGroup, avatarUrl, isSelected,
  currentUserId, isOnline, lastSeenText, onClick, onArchived
}: ChatItemProps) {
  const isTyping = useIsTyping(chat.chatId);
  const [showMenu, setShowMenu] = useState(false);

  const isMyLastMessage = currentUserId && chat.lastMessageSenderId === currentUserId;
  const tickStatus = isMyLastMessage ? chat.lastMessageStatus : null;

  // ✅ Sub-label: for private chats show online/lastSeen; for groups show last message
  const subLabel = (() => {
    if (isTyping) return null; // TypingIndicator handles it
    if (!isGroup) {
      if (isOnline) return { text: 'Online', green: true };
      if (lastSeenText) return { text: lastSeenText, green: false };
    }
    return null;
  })();

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`w-full text-left p-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition ${isSelected ? 'bg-zinc-800' : ''}`}
      >
        <div className="flex items-center gap-3">
          {/* ✅ Avatar with online dot */}
          <Avatar
            chat={chat}
            size={10}
            avatarUrl={avatarUrl}
            chatName={chatName}
            isGroup={isGroup}
            isOnline={isOnline}
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

            <div className="flex justify-between items-center mt-0.5">
              <div className="flex items-center gap-1 min-w-0">
                {!isTyping && tickStatus && <MessageTick status={tickStatus} />}
                {isTyping ? (
                  <TypingIndicator variant="inline" />
                ) : subLabel ? (
                  // ✅ Show online / last seen instead of last message
                  <p className={`text-xs truncate ${subLabel.green ? 'text-green-400' : 'text-zinc-500 italic'}`}>
                    {subLabel.text}
                  </p>
                ) : (
                  <p className="text-zinc-500 text-xs truncate">
                    {chat.lastMessage || 'No messages yet'}
                  </p>
                )}
              </div>
              {!isTyping && chat.unreadCount > 0 && !isSelected && (
                <span className="ml-2 bg-green-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center flex-shrink-0">
                  {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>

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
      const chat = archivedChats.find(c => c.chatId === chatId);
      await chatService.unarchiveChat(chatId);
      setArchivedChats(prev => prev.filter(c => c.chatId !== chatId));
      if (chat) dispatch(unarchiveChat(chat));
    } catch (err) {
      console.error('Unarchive failed:', err);
    }
  };

  const getAvatarUrl = (chat: ChatSummary): string | null => {
    if (chat.type === 'GROUP') {
      if (chat.groupInfo?.profilePicture) {
        const pic = chat.groupInfo.profilePicture;
        if (pic.startsWith('data:') || pic.startsWith('http')) return pic;
        return `http://localhost:8080${pic}`;
      }
      return null;
    }
    const username = chat.otherParticipantUsername;
    if (!username) return null;
    const friend = friends.find(f => f.username === username);
    if (friend?.profilePicture) return `http://localhost:8080${friend.profilePicture}`;
    if (chat.otherParticipantAvatar) return `http://localhost:8080${chat.otherParticipantAvatar}`;
    return null;
  };

  const getChatName = (chat: ChatSummary) =>
    chat.type === 'GROUP' ? (chat.groupInfo?.name || 'Group') : (chat.otherParticipantUsername || '?');

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
      <div className="h-16 border-b border-zinc-800 flex items-center px-4 gap-3 flex-shrink-0">
        <button onClick={onClose} className="text-zinc-400 hover:text-white transition text-lg">←</button>
        <div>
          <p className="text-white font-semibold">Archived Chats</p>
          <p className="text-zinc-500 text-xs">{archivedChats.length} chat{archivedChats.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-zinc-500 text-sm">Loading…</p>
          </div>
        ) : archivedChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
            <Archive size={32} className="mb-2" />
            <p className="text-sm">No archived chats</p>
          </div>
        ) : (
          archivedChats.map(chat => {
            const chatName = getChatName(chat);
            const isGroup = chat.type === 'GROUP';
            const avatarUrl = getAvatarUrl(chat);
            return (
              <div key={chat.chatId} className="relative group border-b border-zinc-800 hover:bg-zinc-800/40 transition">
                <button onClick={() => handleOpen(chat)} className="w-full text-left p-4">
                  <div className="flex items-center gap-3">
                    <Avatar chat={chat} size={10} avatarUrl={avatarUrl} chatName={chatName} isGroup={isGroup} />
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
                <button
                  onClick={e => { e.stopPropagation(); handleUnarchive(chat.chatId); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-zinc-700 hover:bg-zinc-600 text-white px-2 py-1 rounded-lg"
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

  const chats        = useSelector((state: RootState) => state.chat.chats);
  const friends      = useSelector((state: RootState) => state.friend.friends);
  const selectedChatId = useSelector((state: RootState) => state.chat.selectedChatId);
  const currentUserId  = useSelector((state: RootState) => (state.auth as any)?.user?.userId ?? null);

  // ✅ Memoized presence selectors — no rerender warnings
  const onlineUsers  = useSelector(selectOnlineUsers);
  const lastSeenMap  = useSelector(selectLastSeenMap);

  const visibleChats = localChats ?? chats;

  useEffect(() => { setLocalChats(null); }, [chats]);

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

  const getAvatarUrl = useCallback((chat: ChatSummary): string | null => {
    if (chat.type === 'GROUP') {
      if (chat.groupInfo?.profilePicture) {
        const pic = chat.groupInfo.profilePicture;
        if (pic.startsWith('data:') || pic.startsWith('http')) return pic;
        return `http://localhost:8080${pic}`;
      }
      return null;
    }
    const username = chat.otherParticipantUsername;
    if (!username) return null;
    if (liveUpdates[username]) return liveUpdates[username];
    const friend = friends.find(f => f.username === username);
    if (friend?.profilePicture) return `http://localhost:8080${friend.profilePicture}?t=${Date.now()}`;
    if (chat.otherParticipantAvatar) return `http://localhost:8080${chat.otherParticipantAvatar}?t=${Date.now()}`;
    return null;
  }, [liveUpdates, friends]);

  const handleChatClick = (chat: ChatSummary) => {
    if (selectedChatId === chat.chatId) dispatch(setSelectedChat(null));
    else dispatch(setSelectedChat(chat));
  };

  const handleArchived = useCallback((chatId: string) => {
    setLocalChats(prev => (prev ?? chats).filter(c => c.chatId !== chatId));
    if (selectedChatId === chatId) dispatch(setSelectedChat(null));
  }, [chats, selectedChatId, dispatch]);

  const getChatName = (chat: ChatSummary) =>
    chat.type === 'GROUP' ? (chat.groupInfo?.name || 'Group') : (chat.otherParticipantUsername || '?');

  return (
    <div className="flex-1 overflow-y-auto flex flex-col relative">
      <AnimatePresence>
        {showArchived && <ArchivedChatsPanel onClose={() => setShowArchived(false)} />}
      </AnimatePresence>

      <div className="flex-1">
        {visibleChats.length > 0 && (
          <div>
            <p className="text-zinc-500 text-xs px-4 py-2 uppercase tracking-wider">Chats</p>
            {visibleChats.map(chat => {
              const chatName    = getChatName(chat);
              const isGroup     = chat.type === 'GROUP';
              const avatarUrl   = getAvatarUrl(chat);

              // ✅ Compute presence per chat item
              const otherUsername = chat.type === 'PRIVATE'
                ? chat.otherParticipantUsername ?? ''
                : '';
              const isOnline    = !isGroup && onlineUsers.includes(otherUsername);
              const lastSeenText = !isGroup && !isOnline
                ? formatLastSeen(lastSeenMap[otherUsername] ?? null)
                : '';

              return (
                <ChatItem
                  key={chat.chatId}
                  chat={chat}
                  chatName={chatName}
                  isGroup={isGroup}
                  avatarUrl={avatarUrl}
                  isSelected={selectedChatId === chat.chatId}
                  currentUserId={currentUserId}
                  isOnline={isOnline}
                  lastSeenText={lastSeenText}
                  onClick={() => handleChatClick(chat)}
                  onArchived={handleArchived}
                />
              );
            })}
          </div>
        )}

        {chats.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
            <p className="text-sm">No chats yet</p>
            <p className="text-xs mt-1">Add a friend to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}