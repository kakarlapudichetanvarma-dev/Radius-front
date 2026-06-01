import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { clearMessagesLocally } from '../../store/slices/chat.slice';
import { chatService } from '../../services/chat.service';
import MediaLinksFilesPage from './MediaLinksFilesPage';

interface Props {
  onClose: () => void;
}

export default function PrivateChatInfoPanel({ onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const selectedChat = useSelector((state: RootState) => state.chat.selectedChat);
  const friends = useSelector((state: RootState) => state.friend.friends);

  const [showMedia, setShowMedia] = useState(false);
  const [fullscreenAvatar, setFullscreenAvatar] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);

  const username = selectedChat?.otherParticipantUsername;
  const chatId = selectedChat?.chatId;

  const friend = friends.find(f => f.username === username);
  const avatarUrl = friend?.profilePicture
    ? `http://localhost:8080${friend.profilePicture}`
    : null;

  const handleClearAll = async () => {
    if (!chatId) return;
    setClearLoading(true);
    try {
      await chatService.clearChatForMe(chatId);
      dispatch(clearMessagesLocally(chatId));
      setConfirmClear(false);
    } catch (err) {
      console.error('Clear failed:', err);
    } finally {
      setClearLoading(false);
    }
  };

  if (!selectedChat || selectedChat.type !== 'PRIVATE') return null;

  return (
    <>
      {/* Fullscreen avatar */}
      <AnimatePresence>
        {fullscreenAvatar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4"
            onClick={() => setFullscreenAvatar(false)}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={username || ''}
                className="max-w-sm max-h-sm w-80 h-80 object-cover rounded-full"
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <div className="w-80 h-80 rounded-full bg-yellow-500 flex items-center justify-center text-black text-8xl font-bold">
                {username?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <button
              className="absolute top-4 right-4 text-white text-4xl hover:text-zinc-300 transition"
              onClick={() => setFullscreenAvatar(false)}
            >×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm clear dialog */}
      <AnimatePresence>
        {confirmClear && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[9998] flex items-center justify-center p-4"
            onClick={() => setConfirmClear(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-white font-semibold text-base mb-2">Clear all messages?</p>
              <p className="text-zinc-400 text-sm mb-5">
                This will clear the chat only for you. The other person's messages won't be affected.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={clearLoading}
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm transition disabled:opacity-50"
                >
                  {clearLoading ? 'Clearing…' : 'Clear'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMedia && chatId && (
          <MediaLinksFilesPage chatId={chatId} onBack={() => setShowMedia(false)} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="absolute inset-0 z-20 bg-zinc-950 flex flex-col overflow-y-auto"
      >
        {/* Header */}
        <div className="h-16 bg-black border-b border-yellow-500/20 flex items-center px-4 gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800 text-yellow-400 transition"
          >
            ←
          </button>
          <p className="text-yellow-400 font-semibold">Contact Info</p>
        </div>

        {/* Profile section */}
        <div className="flex flex-col items-center py-8 px-4 border-b border-zinc-800">
          <button
            onClick={() => setFullscreenAvatar(true)}
            className="relative mb-4 group"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={username || ''}
                className="w-24 h-24 rounded-full object-cover ring-2 ring-yellow-500/30 group-hover:ring-yellow-500 transition"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-yellow-500 flex items-center justify-center text-black text-3xl font-bold ring-2 ring-yellow-500/30 group-hover:ring-yellow-500 transition">
                {username?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span className="text-white text-xs">View</span>
            </div>
          </button>

          <p className="text-white font-semibold text-lg">{username || 'Unknown'}</p>

          {(friend as any)?.phoneNumber && (
            <p className="text-zinc-400 text-sm mt-1">{(friend as any).phoneNumber}</p>
          )}
          {!(friend as any)?.phoneNumber && (
            <p className="text-zinc-600 text-sm mt-1 italic">No phone number</p>
          )}
        </div>

        {/* Media, Links & Files row */}
        <button
          onClick={() => setShowMedia(true)}
          className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 hover:bg-zinc-900 transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🖼️</span>
            <p className="text-white text-sm font-medium">Media, Links & Files</p>
          </div>
          <span className="text-yellow-500 text-lg">›</span>
        </button>

        {/* Clear all messages */}
        <button
          onClick={() => setConfirmClear(true)}
          className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800 hover:bg-zinc-900 transition w-full text-left"
        >
          <span className="text-xl">🗑️</span>
          <p className="text-red-400 text-sm font-medium">Clear All Messages</p>
        </button>
      </motion.div>
    </>
  );
}