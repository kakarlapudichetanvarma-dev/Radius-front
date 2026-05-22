import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Message } from '../../types/chat.types';

interface Props {
  message: Message;
  isMe: boolean;
}

function MessageTicks({ status }: { status: string }) {
  if (status === 'READ') {
    return <span style={{ color: '#53bdeb' }} className="text-xs font-bold leading-none">✓✓</span>;
  }
  if (status === 'DELIVERED') {
    return <span className="text-zinc-400 text-xs font-bold leading-none">✓✓</span>;
  }
  return <span className="text-zinc-400 text-xs leading-none">✓</span>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getFileIcon(fileType: string | null | undefined): string {
  if (!fileType) return '📎';
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('doc')) return '📝';
  if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
  if (fileType.includes('zip') || fileType.includes('rar')) return '🗜️';
  if (fileType.includes('video')) return '🎥';
  if (fileType.includes('audio')) return '🎵';
  if (fileType.includes('text')) return '📃';
  return '📎';
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Build a proper src string from whatever the server returns ────────────────

function buildImageSrc(storagePath: string | null | undefined, fileType: string | null | undefined): string {
  if (!storagePath) return '';
  if (storagePath.startsWith('data:')) return storagePath;
  if (storagePath.startsWith('blob:')) return storagePath;

  const mime = fileType || 'image/jpeg';
  return `data:${mime};base64,${storagePath}`;
}

// ── Convert storagePath to a downloadable blob URL ───────────────────────────

function downloadFromBase64(
  storagePath: string,
  fileName: string,
  fileType: string | null | undefined
) {
  try {
    if (storagePath.startsWith('blob:') || storagePath.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = storagePath;
      a.download = fileName;
      a.click();
      return;
    }

    const mime = fileType || 'application/octet-stream';
    const binary = atob(storagePath);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: mime });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } catch (err) {
    console.error('Download failed:', err);
  }
}

// ── Build audio/video src ─────────────────────────────────────────────────────

function buildMediaSrc(
  storagePath: string | null | undefined,
  fileType: string | null | undefined
): string {
  if (!storagePath) return '';

  if (storagePath.startsWith('blob:') || storagePath.startsWith('data:')) {
    return storagePath;
  }

  const mime = fileType || 'application/octet-stream';
  return `data:${mime};base64,${storagePath}`;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function MessageBubble({ message, isMe }: Props) {

  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

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

  const att = message.attachment;
  const isVideo = att?.fileType?.includes('video');
  const isAudio = att?.fileType?.includes('audio');

  return (
    <>
      {/* ── FULLSCREEN IMAGE VIEWER ── */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <img
            src={fullscreenImage}
            alt="fullscreen"
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="absolute top-4 right-4 text-white text-5xl leading-none hover:text-zinc-300 transition"
            onClick={() => setFullscreenImage(null)}
          >
            ×
          </button>
        </div>
      )}

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

          {/* ── TEXT ── */}
          {message.messageType === 'TEXT' && message.content && (
            <p className="text-white text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}

          {/* ── IMAGE ── */}
          {message.messageType === 'IMAGE' && (
            <div>
              {att?.storagePath ? (
                <img
                  src={buildImageSrc(att.storagePath, att.fileType)}
                  alt={att.fileName || 'image'}
                  className="rounded-xl max-w-[250px] max-h-[300px] object-cover cursor-pointer hover:opacity-95 transition"
                  onClick={() =>
                    setFullscreenImage(
                      buildImageSrc(att.storagePath, att.fileType)
                    )
                  }
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-48 h-32 bg-zinc-700 rounded-xl flex items-center justify-center text-zinc-500 text-sm">
                  Image unavailable
                </div>
              )}

              {message.content && (
                <p className="text-white text-sm mt-1 whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              )}
            </div>
          )}

          {/* ── FILE (non-video, non-audio) ── */}
          {message.messageType === 'FILE' && att && !isVideo && !isAudio && (
            <div
              className="flex items-center gap-3 bg-black/20 rounded-xl p-3 cursor-pointer hover:bg-black/30 transition min-w-[200px]"
              onClick={() => {
                if (att.storagePath) {
                  downloadFromBase64(
                    att.storagePath,
                    att.fileName || 'file',
                    att.fileType
                  );
                }
              }}
            >
              <span className="text-3xl flex-shrink-0">
                {getFileIcon(att.fileType)}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-medium truncate max-w-[160px]">
                  {att.fileName || 'File'}
                </p>

                <p className="text-zinc-400 text-xs">
                  {formatFileSize(att.fileSizeBytes)}
                </p>
              </div>

              <span className="text-zinc-300 text-lg flex-shrink-0">
                ⬇
              </span>
            </div>
          )}

          {/* ── VIDEO ── */}
          {message.messageType === 'FILE' && att && isVideo && (
            <div className="rounded-xl overflow-hidden max-w-[280px]">
              <video
                controls
                className="w-full rounded-xl max-h-[220px]"
                src={buildMediaSrc(att.storagePath, att.fileType)}
              >
                Your browser does not support video.
              </video>

              {att.fileName && (
                <p className="text-zinc-400 text-xs mt-1 truncate">
                  {att.fileName}
                </p>
              )}
            </div>
          )}

          {/* ── AUDIO ── */}
          {message.messageType === 'FILE' && att && isAudio && (
            <div className="min-w-[220px]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">🎵</span>

                <p className="text-white text-sm truncate max-w-[160px]">
                  {att.fileName || 'Audio'}
                </p>
              </div>

              <audio
                controls
                className="w-full"
                src={buildMediaSrc(att.storagePath, att.fileType)}
              >
                Your browser does not support audio.
              </audio>
            </div>
          )}

          {/* ── LINK ── */}
          {message.messageType === 'LINK' && (
            <div>
              <button
                onClick={() =>
                  window.open(att?.url || message.content || '#', '_blank')
                }
                className="text-blue-400 underline text-sm break-all text-left"
              >
                {att?.url || message.content}
              </button>

              {att?.previewTitle && (
                <p className="text-zinc-300 text-xs mt-1">
                  {att.previewTitle}
                </p>
              )}
            </div>
          )}

          {/* ── CONTACT ── */}
          {message.messageType === 'CONTACT' && (
            <div className="flex items-center gap-2 bg-zinc-700 rounded-xl p-2">
              <div className="w-8 h-8 rounded-full bg-zinc-600 flex items-center justify-center text-white">
                👤
              </div>

              <p className="text-white text-sm font-medium">
                {att?.fileName || 'Contact'}
              </p>
            </div>
          )}

          {/* ── STICKER ── */}
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
              <span className="text-xs text-zinc-500">
                edited
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}