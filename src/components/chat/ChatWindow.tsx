import { useEffect, useRef, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import MessageBubble from './MessageBubble';
import { fetchMessages, resetUnread } from '../../store/slices/chat.slice';
import { subscribeToChat } from '../../socket/message.events';
import { chatService } from '../../services/chat.service';
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

  const messages = useSelector((state: RootState) => state.chat.messages);
  const { user } = useSelector((state: RootState) => state.auth);
  const loadingMessages = useSelector((state: RootState) => state.chat.loadingMessages);
  const selectedChatId = useSelector((state: RootState) => state.chat.selectedChatId);

  const bottomRef = useRef<HTMLDivElement>(null);
  const dragCounterRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  useEffect(() => {
  if (!selectedChatId || selectedChatId.startsWith('temp-')) return;
  
  subscribeToChat(selectedChatId);
  
  // ✅ Only fetch if we have no real messages yet for this chat
  // This prevents wiping optimistic bubbles that were just sent
  const hasRealMessages = messages.some(
    m => !m.id.startsWith('temp-') && m.chatId === selectedChatId
  );
  
  if (!hasRealMessages) {
    dispatch(fetchMessages(selectedChatId));
  }
  
  dispatch(resetUnread(selectedChatId));
  chatService.markRead(selectedChatId).catch(() => {});
}, [selectedChatId, dispatch]), [selectedChatId, dispatch];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        <p className="text-yellow-400 text-sm">Select a chat to start messaging</p>
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
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
