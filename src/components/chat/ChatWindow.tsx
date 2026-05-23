import {
  useEffect,
  useRef,
  useCallback,
  useState
} from 'react';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import type {
  AppDispatch,
  RootState
} from '../../store';

import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

import {
  fetchMessages,
  resetUnread,
  markRead,
} from '../../store/slices/chat.slice';

import { useTypingUsers } from '../../hooks/useTyping';

import {
  subscribeToChat
} from '../../socket/message.events';

import {
  prepareUpload,
  type PreparedUpload
} from '../../services/upload.service';

interface Props {
  onFilePrepared: (upload: PreparedUpload) => void;
}

const MAX_FILE_SIZE_MB = 20;

export default function ChatWindow({ onFilePrepared }: Props) {

  const dispatch = useDispatch<AppDispatch>();

  const messages = useSelector(
    (state: RootState) => state.chat.messages
  );

  const { user } = useSelector(
    (state: RootState) => state.auth
  );

  const loadingMessages = useSelector(
    (state: RootState) => state.chat.loadingMessages
  );

  const selectedChatId = useSelector(
    (state: RootState) => state.chat.selectedChatId
  );

  const chats = useSelector(
    (state: RootState) => state.chat.chats
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  const dragCounterRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  // ✅ Read typing users from Redux — populated by message.events.ts centrally
  const typingUsers = useTypingUsers(selectedChatId);

  const markedReadRef = useRef<string | null>(null);
  const subscribedChatsRef = useRef<Set<string>>(new Set());

  // ✅ Subscribe to ALL chats so sidebar typing + messages work for all of them
  useEffect(() => {
    if (!chats || chats.length === 0) return;

    chats.forEach(chat => {
      if (
        !chat.chatId.startsWith('temp-') &&
        !subscribedChatsRef.current.has(chat.chatId)
      ) {
        subscribedChatsRef.current.add(chat.chatId);
        subscribeToChat(chat.chatId);
      }
    });
  }, [chats]);

  // ✅ Open chat — fetch messages, mark read
  useEffect(() => {
    if (!selectedChatId || selectedChatId.startsWith('temp-')) return;

    subscribeToChat(selectedChatId);

    const hasRealMessages = messages.some(
      m => !m.id.startsWith('temp-') && m.chatId === selectedChatId
    );

    if (!hasRealMessages) {
      dispatch(fetchMessages(selectedChatId));
    }

    dispatch(resetUnread(selectedChatId));

    if (markedReadRef.current !== selectedChatId) {
      markedReadRef.current = selectedChatId;
      dispatch(markRead(selectedChatId));
    }
  }, [selectedChatId, dispatch]);

  // ✅ Auto-scroll when messages or typing changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedChatId) return;
    dragCounterRef.current++;
    setIsDragging(true);
  }, [selectedChatId]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    if (!selectedChatId) return;

    const file = Array.from(e.dataTransfer.files)[0];
    if (!file) return;

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      setDragError(`File too large. Max ${MAX_FILE_SIZE_MB}MB.`);
      setTimeout(() => setDragError(null), 3000);
      return;
    }

    try {
      const prepared = await prepareUpload(file);
      onFilePrepared(prepared);
    } catch (err: any) {
      setDragError(err.message || 'Failed to load file');
      setTimeout(() => setDragError(null), 3000);
    }
  }, [selectedChatId, onFilePrepared]);

  if (!selectedChatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black h-full">
        <p className="text-yellow-400 text-sm">
          Select a chat to start messaging
        </p>
      </div>
    );
  }

  return (
    <div
      className="h-full overflow-y-auto bg-black relative"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >

      {isDragging && (
        <div className="absolute inset-0 z-50 bg-zinc-950/85 border-2 border-dashed border-yellow-500 rounded-xl flex flex-col items-center justify-center pointer-events-none">
          <div className="text-6xl mb-3">📂</div>
          <p className="text-yellow-400 font-semibold text-xl">Drop file to send</p>
          <p className="text-zinc-400 text-sm mt-2">Any file up to {MAX_FILE_SIZE_MB}MB</p>
        </div>
      )}

      {dragError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white text-sm px-4 py-2 rounded-xl shadow-lg">
          {dragError}
        </div>
      )}

      {loadingMessages ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-yellow-400 text-sm">Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-yellow-400 text-sm">No messages yet. Say hello! 👋</p>
        </div>
      ) : (
        <div className="p-4 space-y-2 min-h-full flex flex-col">

          {messages.map(message => (
            <MessageBubble
              key={message.id}
              message={message}
              isMe={message.senderId === user?.id}
            />
          ))}

          {/* ✅ Typing bubbles — one per person typing, from Redux state */}
          {typingUsers.map(username => (
            <TypingIndicator
              key={username}
              username={username}
              variant="bubble"
            />
          ))}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}