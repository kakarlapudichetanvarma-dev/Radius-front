import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import type { AppDispatch, RootState } from '../../store';
import {
  setSelectedChat,
  unarchiveChat,
  markChatArchived,
  selectOnlineUsers,
  selectLastSeenMap,
} from '../../store/slices/chat.slice';
import type { ChatSummary } from '../../types/chat.types';
import TypingIndicator from './TypingIndicator';
import { useIsTyping } from '../../hooks/useTyping';
import { chatService } from '../../services/chat.service';
import { Archive } from 'lucide-react';
import { formatLastSeen } from '../../presence/last-seen';

// ── Message Tick ──────────────────────────────────────────────────────────────

function MessageTick({ status }: { status: 'SENT' | 'DELIVERED' | 'READ' | null }) {
  if (!status) return null;
  if (status === 'READ') {
    return (
      <svg className="w-5 h-4 flex-shrink-0 text-blue-500" viewBox="0 0 20 11" fill="none">
        <path d="M1 5.5L5.5 10L15 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 5.5L10.5 10L20 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (status === 'DELIVERED') {
    return (
      <svg className="w-5 h-4 flex-shrink-0 text-gray-400" viewBox="0 0 20 11" fill="none">
        <path d="M1 5.5L5.5 10L15 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 5.5L10.5 10L20 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 flex-shrink-0 text-gray-400" viewBox="0 0 16 11" fill="none">
      <path d="M1 5.5L5.5 10L15 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function ChatAvatar({
  avatarUrl, chatName, isGroup, isOnline, size = 44,
}: {
  avatarUrl: string | null;
  chatName: string;
  isGroup: boolean;
  isOnline?: boolean;
  size?: number;
}) {
  const initials = chatName.charAt(0).toUpperCase() || '?';
  const colors = [
    'bg-purple-500','bg-pink-500','bg-blue-500','bg-green-500',
    'bg-amber-500','bg-rose-500','bg-teal-500','bg-indigo-500',
  ];
  const bgColor = colors[(chatName.charCodeAt(0) || 0) % colors.length];

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={chatName} className="w-full h-full rounded-full object-cover" />
      ) : (
        <div className={`w-full h-full rounded-full ${bgColor} flex items-center justify-center text-white font-semibold text-base`}>
          {initials}
        </div>
      )}
      {!isGroup && (
        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white transition-colors duration-300 ${isOnline ? 'bg-green-400' : 'bg-gray-300'}`} />
      )}
    </div>
  );
}

// ── Chat Context Menu ─────────────────────────────────────────────────────────

function ChatContextMenu({ chatId, onClose, onArchived }: {
  chatId: string;
  onClose: () => void;
  onArchived: (chatId: string) => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleArchive = async () => {
    try {
      await chatService.archiveChat(chatId);
      dispatch(markChatArchived(chatId));
      onArchived(chatId);
    } catch (err) { console.error('Archive failed:', err); }
    onClose();
  };

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.1 }}
      className="absolute right-0 top-full mt-1 z-50 min-w-[150px] rounded-xl overflow-hidden shadow-lg bg-white border border-gray-100"
    >
      <button
        onClick={handleArchive}
        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
      >
        <Archive size={14} className="text-gray-400" />
        Archive Chat
      </button>
    </motion.div>
  );
}

// ── Chat Item ─────────────────────────────────────────────────────────────────

function ChatItem({
  chat, chatName, isGroup, avatarUrl, isSelected, currentUserId,
  isOnline, lastSeenText, onClick, onArchived,
}: {
  chat: ChatSummary;
  chatName: string;
  isGroup: boolean;
  avatarUrl: string | null;
  isSelected: boolean;
  currentUserId: string | null;
  isOnline: boolean;
  lastSeenText: string;
  onClick: () => void;
  onArchived: (id: string) => void;
}) {
  const isTyping  = useIsTyping(chat.chatId);
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isMyLast   = currentUserId && chat.lastMessageSenderId === currentUserId;
  const tickStatus = isMyLast ? chat.lastMessageStatus : null;

  const subLabel = (() => {
    if (isTyping) return null;
    if (!isGroup) {
      if (isOnline)     return { text: 'Online', green: true };
      if (lastSeenText) return { text: lastSeenText, green: false };
    }
    return null;
  })();

  return (
    <div
      className="relative px-3 py-1.5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
    >
      <button
        onClick={onClick}
        className={`w-full text-left px-4 py-3 flex items-center gap-3 rounded-2xl transition-all shadow-sm
          ${isSelected
            ? 'border border-violet-200'
            : 'bg-white hover:bg-gray-50 border border-gray-100 hover:border-violet-100 hover:shadow-md'
          }`}
        style={isSelected ? { background: 'linear-gradient(135deg, #f5f0ff 0%, #fdf4ff 50%, #f0f4ff 100%)', boxShadow: '0 0 0 1px rgba(167,139,250,0.35), 0 4px 20px rgba(167,139,250,0.22)' } : undefined}
      >
        {/* Avatar */}
        <ChatAvatar
          avatarUrl={avatarUrl}
          chatName={chatName}
          isGroup={isGroup}
          isOnline={isOnline}
          size={46}
        />

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={`text-sm font-semibold truncate ${isSelected ? 'text-gray-900' : 'text-gray-900'}`}>
              {chatName}
            </p>
            <div className="flex items-center gap-1 flex-shrink-0">
              {chat.lastMessageAt && (
                <span className={`text-[11px] ${isSelected ? 'text-gray-500' : 'text-gray-400'}`}>
                  {new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              {/* WhatsApp-style small chevron — only on hover */}
              {isHovered && (
                <button
                  onClick={e => { e.stopPropagation(); setShowMenu(p => !p); }}
                  className="flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                  style={{ lineHeight: 0 }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 5L7 9L11 5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-1 mt-0.5">
            <div className="flex items-center gap-1 min-w-0 flex-1">
              {!isTyping && tickStatus && <MessageTick status={tickStatus} />}
              {isTyping ? (
                <TypingIndicator variant="inline" />
              ) : subLabel ? (
                <p className={`text-xs truncate ${subLabel.green ? 'text-green-500' : 'text-gray-400'}`}>
                  {subLabel.text}
                </p>
              ) : (
                <p className={`text-xs truncate ${isSelected ? 'text-gray-500' : 'text-gray-400'}`}>
                  {chat.lastMessage?.startsWith('🎵') || chat.lastMessage?.startsWith('🎥')
                    ? chat.lastMessage
                    : chat.lastMessage
                      ? (isMyLast ? `↩ ${chat.lastMessage}` : chat.lastMessage)
                      : 'No messages yet'}
                </p>
              )}
            </div>

            {/* Unread badge */}
            {!isTyping && chat.unreadCount > 0 && !isSelected && (
              <span className="ml-1 bg-violet-600 text-white text-[11px] font-bold rounded-full
                               min-w-[20px] h-5 px-1.5 flex items-center justify-center flex-shrink-0">
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Context menu dropdown */}
      <AnimatePresence>
        {showMenu && (
          <div className="absolute right-4 top-10 z-50">
            <ChatContextMenu chatId={chat.chatId} onClose={() => setShowMenu(false)} onArchived={onArchived} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Archived Panel ────────────────────────────────────────────────────────────

function ArchivedChatsPanel({ onClose }: { onClose: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const friends  = useSelector((s: RootState) => s.friend.friends);
  const [archivedChats, setArchivedChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await chatService.getArchivedChats();
        setArchivedChats(res.data.data || []);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  const handleUnarchive = async (chatId: string) => {
    try {
      const chat = archivedChats.find(c => c.chatId === chatId);
      await chatService.unarchiveChat(chatId);
      setArchivedChats(p => p.filter(c => c.chatId !== chatId));
      if (chat) dispatch(unarchiveChat(chat));
    } catch { /* ignore */ }
  };

  const getAvatarUrl = (chat: ChatSummary): string | null => {
    if (chat.type === 'GROUP') {
      if (chat.groupInfo?.profilePicture) {
        const p = chat.groupInfo.profilePicture;
        return p.startsWith('data:') || p.startsWith('http') ? p : `http://localhost:8080${p}`;
      }
      return null;
    }
    const u = chat.otherParticipantUsername;
    if (!u) return null;
    const f = friends.find(f => f.username === u);
    if (f?.profilePicture) return `http://localhost:8080${f.profilePicture}`;
    if (chat.otherParticipantAvatar) return `http://localhost:8080${chat.otherParticipantAvatar}`;
    return null;
  };

  const getName = (c: ChatSummary) =>
    c.type === 'GROUP' ? (c.groupInfo?.name || 'Group') : (c.otherParticipantUsername || '?');

  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'tween', duration: 0.22 }}
      className="absolute inset-0 z-40 bg-white flex flex-col"
    >
      <div className="h-14 border-b border-gray-100 flex items-center px-4 gap-3 flex-shrink-0">
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">←</button>
        <p className="text-gray-800 font-semibold">Archived Chats</p>
        <span className="text-gray-400 text-xs">{archivedChats.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Loading…</div>
        ) : archivedChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Archive size={28} className="mb-2" />
            <p className="text-sm">No archived chats</p>
          </div>
        ) : (
          archivedChats.map(chat => (
            <div key={chat.chatId} className="relative group border-b border-gray-50 hover:bg-gray-50 transition">
              <button
                onClick={() => { dispatch(setSelectedChat(chat)); onClose(); }}
                className="w-full text-left p-4 flex items-center gap-3"
              >
                <ChatAvatar avatarUrl={getAvatarUrl(chat)} chatName={getName(chat)} isGroup={chat.type === 'GROUP'} size={44} />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 text-sm font-semibold truncate">{getName(chat)}</p>
                  <p className="text-gray-400 text-xs truncate">{chat.lastMessage || 'No messages yet'}</p>
                </div>
              </button>
              <button
                onClick={e => { e.stopPropagation(); handleUnarchive(chat.chatId); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-violet-600 hover:bg-violet-700 text-white px-2 py-1 rounded-lg"
              >
                Unarchive
              </button>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

// ── Main ChatList ─────────────────────────────────────────────────────────────

interface ChatListProps {
  activeTab: 'direct' | 'groups' | 'archived';
}

export default function ChatList({ activeTab }: ChatListProps) {
  const dispatch = useDispatch<AppDispatch>();

  const [liveUpdates, setLiveUpdates] = useState<Record<string, string>>({});
  const [localChats, setLocalChats]   = useState<ChatSummary[] | null>(null);
  const [archivedChats, setArchivedChats] = useState<ChatSummary[]>([]);
  const [archivedLoading, setArchivedLoading] = useState(false);

  const chats          = useSelector((s: RootState) => s.chat.chats);
  const friends        = useSelector((s: RootState) => s.friend.friends);
  const selectedChatId = useSelector((s: RootState) => s.chat.selectedChatId);
  const currentUserId  = useSelector((s: RootState) => (s.auth as any)?.user?.userId ?? null);
  const onlineUsers    = useSelector(selectOnlineUsers);
  const lastSeenMap    = useSelector(selectLastSeenMap);

  const visibleChats = localChats ?? chats;

  useEffect(() => { setLocalChats(null); }, [chats]);

  useEffect(() => {
    if (activeTab !== 'archived') return;
    setArchivedLoading(true);
    (async () => {
      try {
        const res = await chatService.getArchivedChats();
        setArchivedChats(res.data.data || []);
      } catch { /* ignore */ }
      finally { setArchivedLoading(false); }
    })();
  }, [activeTab]);

  useEffect(() => {
    const h = (e: CustomEvent) => {
      const { username, profilePicture } = e.detail;
      if (!username || !profilePicture) return;
      const url = profilePicture.startsWith('http') ? profilePicture : `http://localhost:8080${profilePicture}`;
      setLiveUpdates(p => ({ ...p, [username]: url }));
    };
    window.addEventListener('profile-updated', h as EventListener);
    return () => window.removeEventListener('profile-updated', h as EventListener);
  }, []);

  const getAvatarUrl = useCallback((chat: ChatSummary): string | null => {
    if (chat.type === 'GROUP') {
      if (chat.groupInfo?.profilePicture) {
        const p = chat.groupInfo.profilePicture;
        return p.startsWith('data:') || p.startsWith('http') ? p : `http://localhost:8080${p}`;
      }
      return null;
    }
    const u = chat.otherParticipantUsername;
    if (!u) return null;
    if (liveUpdates[u]) return liveUpdates[u];
    const f = friends.find(f => f.username === u);
    if (f?.profilePicture) return `http://localhost:8080${f.profilePicture}`;
    if (chat.otherParticipantAvatar) return `http://localhost:8080${chat.otherParticipantAvatar}`;
    return null;
  }, [liveUpdates, friends]);

  const handleChatClick = (chat: ChatSummary) => {
    dispatch(setSelectedChat(selectedChatId === chat.chatId ? null : chat));
  };

  const handleArchived = useCallback((chatId: string) => {
    setLocalChats(p => (p ?? chats).filter(c => c.chatId !== chatId));
    if (selectedChatId === chatId) dispatch(setSelectedChat(null));
  }, [chats, selectedChatId, dispatch]);

  const handleUnarchive = async (chatId: string) => {
    try {
      const chat = archivedChats.find(c => c.chatId === chatId);
      await chatService.unarchiveChat(chatId);
      setArchivedChats(p => p.filter(c => c.chatId !== chatId));
      if (chat) dispatch(unarchiveChat(chat));
    } catch { /* ignore */ }
  };

  const getName = (c: ChatSummary) =>
    c.type === 'GROUP' ? (c.groupInfo?.name || 'Group') : (c.otherParticipantUsername || '?');

  const getArchivedAvatarUrl = (chat: ChatSummary): string | null => {
    if (chat.type === 'GROUP') {
      if (chat.groupInfo?.profilePicture) {
        const p = chat.groupInfo.profilePicture;
        return p.startsWith('data:') || p.startsWith('http') ? p : `http://localhost:8080${p}`;
      }
      return null;
    }
    const u = chat.otherParticipantUsername;
    if (!u) return null;
    const f = friends.find(f => f.username === u);
    if (f?.profilePicture) return `http://localhost:8080${f.profilePicture}`;
    if (chat.otherParticipantAvatar) return `http://localhost:8080${chat.otherParticipantAvatar}`;
    return null;
  };

  // ── Archived tab ────────────────────────────────────────────────────────────
  if (activeTab === 'archived') {
    if (archivedLoading) {
      return (
        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
          Loading…
        </div>
      );
    }
    if (archivedChats.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
          <Archive size={28} className="mb-2" />
          <p className="text-sm">No archived chats</p>
        </div>
      );
    }
    return (
      <div className="flex-1 overflow-y-auto">
        {archivedChats.map(chat => (
          <div key={chat.chatId} className="relative group border-b border-gray-50 hover:bg-gray-50 transition">
            <button
              onClick={() => dispatch(setSelectedChat(chat))}
              className="w-full text-left p-4 flex items-center gap-3"
            >
              <ChatAvatar
                avatarUrl={getArchivedAvatarUrl(chat)}
                chatName={getName(chat)}
                isGroup={chat.type === 'GROUP'}
                size={44}
              />
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 text-sm font-semibold truncate">{getName(chat)}</p>
                <p className="text-gray-400 text-xs truncate">{chat.lastMessage || 'No messages yet'}</p>
              </div>
            </button>
            <button
              onClick={e => { e.stopPropagation(); handleUnarchive(chat.chatId); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100
                         transition-opacity text-xs bg-violet-600 hover:bg-violet-700 text-white px-2 py-1 rounded-lg"
            >
              Unarchive
            </button>
          </div>
        ))}
      </div>
    );
  }

  // ── Direct / Groups tabs ────────────────────────────────────────────────────
  const filteredChats = visibleChats.filter(chat =>
    activeTab === 'direct'
      ? chat.type === 'PRIVATE' && !chat.archived
      : chat.type === 'GROUP'  && !chat.archived
  );

  return (
    <div className="flex-1 overflow-y-auto">
      {filteredChats.length > 0 ? (
        filteredChats.map(chat => {
          const chatName      = getName(chat);
          const isGroup       = chat.type === 'GROUP';
          const avatarUrl     = getAvatarUrl(chat);
          const otherUsername = chat.type === 'PRIVATE' ? (chat.otherParticipantUsername ?? '') : '';
          const isOnline      = !isGroup && onlineUsers.includes(otherUsername);
          const lastSeenText  = !isGroup && !isOnline ? formatLastSeen(lastSeenMap[otherUsername] ?? null) : '';

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
        })
      ) : (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
          <p className="text-sm font-medium">
            {activeTab === 'groups' ? 'No groups yet' : 'No chats yet'}
          </p>
          <p className="text-xs mt-1">
            {activeTab === 'groups' ? 'Create a group to get started' : 'Add a friend to get started'}
          </p>
        </div>
      )}
    </div>
  );
}