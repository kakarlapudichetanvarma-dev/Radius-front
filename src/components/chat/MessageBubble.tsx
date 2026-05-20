import { motion } from 'framer-motion';
import type { Message } from '../../types/chat.types';

interface Props {
  message: Message;
  isMe: boolean;
}

// ✅ WhatsApp-style ticks:
//   SENT     → single grey tick  ✓
//   DELIVERED → double grey tick ✓✓
//   READ      → double blue tick ✓✓ (blue)
function MessageTicks({ status }: { status: string }) {
  if (status === 'READ') {
    return (
      <span style={{ color: '#53bdeb' }} className="text-xs font-bold leading-none">
        ✓✓
      </span>
    );
  }
  if (status === 'DELIVERED') {
    return (
      <span className="text-zinc-400 text-xs font-bold leading-none">
        ✓✓
      </span>
    );
  }
  // SENT
  return (
    <span className="text-zinc-400 text-xs leading-none">
      ✓
    </span>
  );
}

export default function MessageBubble({ message, isMe }: Props) {

  if (message.messageType === 'GROUP_EVENT') {
    return (
      <div className="text-center text-xs text-zinc-500 py-1">
        {message.content}
      </div>
    );
  }

  if (message.isDeleted) {
    return (
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
        <div className="px-4 py-2 rounded-2xl bg-zinc-800/50 text-zinc-500 text-sm italic">
          🚫 Message deleted
        </div>
      </div>
    );
  }

  const formatTime = (sentAt: string) => {
    try {
      return new Date(sentAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return '📎';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('doc')) return '📝';
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
    if (fileType.includes('zip') || fileType.includes('rar')) return '🗜️';
    if (fileType.includes('video')) return '🎥';
    if (fileType.includes('audio')) return '🎵';
    return '📎';
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`
          max-w-[70%] px-4 py-2 rounded-2xl
          ${isMe ? 'bg-green-700 rounded-br-sm' : 'bg-zinc-800 rounded-bl-sm'}
        `}
      >
        {/* Sender name in group chats */}
        {!isMe && message.senderUsername && (
          <p className="text-xs text-green-400 font-medium mb-1">
            {message.senderUsername}
          </p>
        )}

        {/* Reply quote */}
        {message.replyToId && (
          <div className="border-l-2 border-green-400 pl-2 mb-2 text-xs text-zinc-400">
            Replying to a message
          </div>
        )}

        {/* TEXT */}
        {message.messageType === 'TEXT' && message.content && (
          <p className="text-white text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}

        {/* IMAGE */}
        {message.messageType === 'IMAGE' && (
          <div>
            {message.attachment?.storagePath && (
              <img
                src={
                  message.attachment.storagePath.startsWith('data:')
                    ? message.attachment.storagePath
                    : `data:image/jpeg;base64,${message.attachment.storagePath}`
                }
                alt="image"
                className="rounded-xl max-w-[250px] max-h-[300px] object-cover cursor-pointer"
                onClick={() =>
                  window.open(message.attachment?.storagePath || '', '_blank')
                }
              />
            )}
            {message.content && (
              <p className="text-white text-sm mt-1">{message.content}</p>
            )}
          </div>
        )}

        {/* FILE */}
        {message.messageType === 'FILE' && message.attachment && (
          <div
            className="flex items-center gap-3 bg-black/20 rounded-xl p-3 cursor-pointer hover:bg-black/30 transition"
            onClick={() => {
              if (message.attachment?.storagePath) {
                const link = document.createElement('a');
                link.href = message.attachment.storagePath;
                link.download = message.attachment.fileName || 'file';
                link.click();
              }
            }}
          >
            <span className="text-3xl">
              {getFileIcon(message.attachment.fileType)}
            </span>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate max-w-[180px]">
                {message.attachment.fileName || 'File'}
              </p>
              <p className="text-zinc-400 text-xs">
                {formatFileSize(message.attachment.fileSizeBytes)}
              </p>
            </div>
            <span className="text-zinc-400 text-xs ml-auto">⬇</span>
          </div>
        )}

        {/* LINK */}
        {message.messageType === 'LINK' && (
          <div>
            <button
              onClick={() =>
                window.open(
                  message.attachment?.url || message.content || '#',
                  '_blank'
                )
              }
              className="text-blue-400 underline text-sm break-all text-left"
            >
              {message.attachment?.url || message.content}
            </button>
            {message.attachment?.previewTitle && (
              <p className="text-zinc-300 text-xs mt-1">
                {message.attachment.previewTitle}
              </p>
            )}
          </div>
        )}

        {/* CONTACT */}
        {message.messageType === 'CONTACT' && (
          <div className="flex items-center gap-2 bg-zinc-700 rounded-xl p-2">
            <div className="w-8 h-8 rounded-full bg-zinc-600 flex items-center justify-center text-white">
              👤
            </div>
            <p className="text-white text-sm font-medium">
              {message.attachment?.fileName || 'Contact'}
            </p>
          </div>
        )}

        {/* STICKER */}
        {message.messageType === 'STICKER' && (
          <img
            src={message.content || ''}
            alt="sticker"
            className="w-24 h-24 object-contain"
          />
        )}

        {/* Timestamp + ticks */}
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-xs text-zinc-400">
            {formatTime(message.sentAt)}
          </span>
          {isMe && <MessageTicks status={message.status} />}
          {message.isEdited && (
            <span className="text-xs text-zinc-500">edited</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}