import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import MessageBubble from './MessageBubble';
import { fetchMessages, markRead } from '../../store/slices/chat.slice';
import { subscribeToChat } from '../../socket/message.events';

export default function ChatWindow() {
  const dispatch = useDispatch<AppDispatch>();

  const messages = useSelector((state: RootState) => state.chat.messages);
  const { user } = useSelector((state: RootState) => state.auth);
  const loadingMessages = useSelector((state: RootState) => state.chat.loadingMessages);
  const selectedChatId = useSelector((state: RootState) => state.chat.selectedChatId);

  const bottomRef = useRef<HTMLDivElement>(null);
  const lastFetchedChatId = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedChatId || selectedChatId.startsWith('temp-')) return;

    // ✅ Only fetch if we switched to a different chat
    if (lastFetchedChatId.current === selectedChatId) return;
    lastFetchedChatId.current = selectedChatId;

    console.log('🔁 fetchMessages called for:', selectedChatId);
    dispatch(fetchMessages(selectedChatId));
    dispatch(markRead(selectedChatId));
    subscribeToChat(selectedChatId);
  }, [selectedChatId, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        <p className="text-zinc-500 text-sm">Loading messages...</p>
      </div>
    );
  }

  if (!selectedChatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        <p className="text-zinc-500 text-sm">Select a chat to start messaging</p>
      </div>
    );
  }

  if (messages.length === 0 && !loadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        <p className="text-zinc-500 text-sm">No messages yet. Say hello! 👋</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-zinc-950">
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
    </div>
  );
}