import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';

import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { fetchMessages, resetUnread, markRead } from '../../store/slices/chat.slice';
import { useTypingUsers } from '../../hooks/useTyping';
import { useWallpaper } from '../../hooks/useWallpaper';
import { subscribeToChat } from '../../socket/message.events';
import { prepareUpload, type PreparedUpload } from '../../services/upload.service';

interface Props {
  onFilePrepared: (upload: PreparedUpload) => void;
}

const MAX_FILE_SIZE_MB = 20;

function buildWallpaperStyle(wallpaper?: {
  wallpaperType: string;
  wallpaperData?: string;
  wallpaperColor?: string;
}): React.CSSProperties {
  if (!wallpaper) return { backgroundColor: '#f8f9fa' };
  switch (wallpaper.wallpaperType) {
    case 'COLOR':    return { backgroundColor: wallpaper.wallpaperColor || '#f8f9fa' };
    case 'GRADIENT': return { background: wallpaper.wallpaperColor || '#f8f9fa' };
    case 'PATTERN': {
      const patterns: Record<string, { backgroundImage: string; backgroundSize: string }> = {
        dots:       { backgroundImage: `radial-gradient(circle, rgba(147,51,234,0.1) 1px, transparent 1px)`,       backgroundSize: '24px 24px' },
        grid:       { backgroundImage: `linear-gradient(rgba(147,51,234,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(147,51,234,0.06) 1px, transparent 1px)`, backgroundSize: '32px 32px' },
        diagonal:   { backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(147,51,234,0.05) 12px, rgba(147,51,234,0.05) 13px)`,         backgroundSize: 'auto' },
        waves:      { backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 6px, rgba(147,51,234,0.04) 6px, rgba(147,51,234,0.04) 7px)`,           backgroundSize: 'auto' },
        crosshatch: { backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(147,51,234,0.05) 15px, rgba(147,51,234,0.05) 16px), repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(147,51,234,0.05) 15px, rgba(147,51,234,0.05) 16px)`, backgroundSize: 'auto' },
      };
      return { backgroundColor: wallpaper.wallpaperColor || '#f8f9fa', ...(patterns[wallpaper.wallpaperData || ''] || {}) };
    }
    case 'IMAGE':
      return {
        backgroundImage: `url(${wallpaper.wallpaperData})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
      };
    default:
      return { backgroundColor: '#f8f9fa' };
  }
}

// ── WhatsApp-style empty state illustration ───────────────────────────────────
function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white h-full px-8">
      <div className="flex flex-col items-center text-center" style={{ maxWidth: 340 }}>
        {/* Brand label */}
        <p className="text-violet-600 text-xs font-semibold tracking-widest uppercase mb-4">
          Radius
        </p>

        {/* Bold headline */}
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginBottom: 16 }}>
          Conversations, with intent.
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          Select a chat on the left to continue, or start something new.
        </p>

        {/* Buttons row */}
        <div className="flex items-center gap-5">
          <button
            className="text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors duration-200"
            style={{ background: '#0f172a' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1e293b')}
            onMouseLeave={e => (e.currentTarget.style.background = '#0f172a')}
          >
            New message
          </button>
          <button className="text-gray-700 text-sm font-medium hover:text-gray-900 transition-colors duration-200 flex items-center gap-1">
            Find people <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatWindow({ onFilePrepared }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const messages        = useSelector((s: RootState) => s.chat.selectedChatId ? s.chat.messages.filter(m => m.chatId === s.chat.selectedChatId) : []);
  const { user }        = useSelector((s: RootState) => s.auth);
  const loadingMessages = useSelector((s: RootState) => s.chat.loadingMessages);
  const selectedChatId  = useSelector((s: RootState) => s.chat.selectedChatId);
  const chats           = useSelector((s: RootState) => s.chat.chats);

  const bottomRef      = useRef<HTMLDivElement>(null);
  const dragCounterRef = useRef(0);
  const markedReadRef  = useRef<string | null>(null);
  const subscribedRef  = useRef<Set<string>>(new Set());

  const [isDragging, setIsDragging] = useState(false);
  const [dragError,  setDragError]  = useState<string | null>(null);

  const { wallpaper }  = useWallpaper(selectedChatId);
  const wallpaperStyle = useMemo(() => buildWallpaperStyle(wallpaper), [wallpaper]);
  const typingUsers    = useTypingUsers(selectedChatId);

  useEffect(() => {
    chats?.forEach(c => {
      if (!c.chatId.startsWith('temp-') && !subscribedRef.current.has(c.chatId)) {
        subscribedRef.current.add(c.chatId);
        subscribeToChat(c.chatId);
      }
    });
  }, [chats]);

  useEffect(() => {
    if (!selectedChatId || selectedChatId.startsWith('temp-')) return;
    subscribeToChat(selectedChatId);
    if (!messages.some(m => !m.id.startsWith('temp-') && m.chatId === selectedChatId)) {
      dispatch(fetchMessages(selectedChatId));
    }
    dispatch(resetUnread(selectedChatId));
    if (markedReadRef.current !== selectedChatId) {
      markedReadRef.current = selectedChatId;
      dispatch(markRead(selectedChatId));
    }
  }, [selectedChatId, dispatch]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typingUsers]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!selectedChatId) return;
    dragCounterRef.current++;
    setIsDragging(true);
  }, [selectedChatId]);

  const handleDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (--dragCounterRef.current <= 0) { dragCounterRef.current = 0; setIsDragging(false); }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    dragCounterRef.current = 0; setIsDragging(false);
    if (!selectedChatId) return;
    const file = Array.from(e.dataTransfer.files)[0];
    if (!file) return;
    if (file.size / (1024 * 1024) > MAX_FILE_SIZE_MB) {
      setDragError(`File too large. Max ${MAX_FILE_SIZE_MB}MB.`); setTimeout(() => setDragError(null), 3000); return;
    }
    try { onFilePrepared(await prepareUpload(file)); }
    catch (err: any) { setDragError(err.message || 'Failed to load file'); setTimeout(() => setDragError(null), 3000); }
  }, [selectedChatId, onFilePrepared]);

  // Empty state
  if (!selectedChatId) {
    return <EmptyState />;
  }

  return (
    <div
      className="h-full overflow-y-auto relative"
      style={wallpaperStyle}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-white/80 border-2 border-dashed border-purple-400 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-6xl mb-3">📂</p>
          <p className="text-purple-600 font-semibold text-xl">Drop file to send</p>
          <p className="text-gray-400 text-sm mt-2">Any file up to {MAX_FILE_SIZE_MB}MB</p>
        </div>
      )}

      {/* Error toast */}
      {dragError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white text-sm px-4 py-2 rounded-xl shadow">
          {dragError}
        </div>
      )}

      {/* Messages */}
      {loadingMessages ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-purple-400 text-sm">Loading messages…</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-2">
          <p className="text-gray-400 text-sm">No messages yet. Say hello! 👋</p>
        </div>
      ) : (
        <div className="p-4 space-y-1.5 min-h-full flex flex-col">
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} isMe={msg.senderId === user?.id} />
          ))}
          {typingUsers.map(u => (
            <TypingIndicator key={u} username={u} variant="bubble" />
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}