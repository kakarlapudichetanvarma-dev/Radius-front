import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import type { Message } from '../../types/chat.types';
import { forwardMessage } from '../../store/slices/chat.slice';

interface Props {
  message: Message;
  onClose: () => void;
}

export default function ForwardModal({ message, onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const chats = useSelector((s: RootState) => s.chat.chats);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  const toggle = (chatId: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(chatId)) next.delete(chatId);
      else next.add(chatId);
      return next;
    });
  };

  const handleForward = async () => {
    if (selected.size === 0) return;
    setSending(true);
    try {
      await dispatch(forwardMessage({
        messageId: message.id,
        targetChatIds: Array.from(selected),
      }));
      onClose();
    } catch {
      // ignore — keep modal open on failure
    } finally {
      setSending(false);
    }
  };

  const labelFor = (chat: typeof chats[number]) =>
    chat.type === 'GROUP'
      ? chat.groupInfo?.name || 'Group'
      : chat.otherParticipantUsername || 'Chat';

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Forward message</h3>
          <p className="text-xs text-gray-400 mt-0.5">Choose one or more chats</p>
        </div>

        <div className="max-h-80 overflow-y-auto py-1">
          {chats.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No chats available</p>
          ) : (
            chats
              .filter(c => !c.chatId.startsWith('temp-'))
              .map(chat => (
                <button
                  key={chat.chatId}
                  onClick={() => toggle(chat.chatId)}
                  className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 transition text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-sm font-semibold flex-shrink-0">
                    {labelFor(chat).charAt(0).toUpperCase()}
                  </div>
                  <span className="flex-1 text-sm text-gray-800 truncate">{labelFor(chat)}</span>
                  <span
                    className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition
                      ${selected.has(chat.chatId) ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}
                  >
                    {selected.has(chat.chatId) && (
                      <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                </button>
              ))
          )}
        </div>

        <div className="flex gap-2 px-5 py-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 text-sm text-gray-500 hover:text-gray-700 py-2 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleForward}
            disabled={selected.size === 0 || sending}
            className="flex-1 text-sm bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white py-2 rounded-xl transition font-medium"
          >
            {sending ? 'Sending…' : `Forward (${selected.size})`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}