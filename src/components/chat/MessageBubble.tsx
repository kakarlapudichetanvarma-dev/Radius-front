import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import type { Message } from '../../types/chat.types';
import { chatService } from '../../services/chat.service';
import { deleteMessageLocally } from '../../store/slices/chat.slice';

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

function buildImageSrc(storagePath: string | null | undefined, fileType: string | null | undefined): string {
  if (!storagePath) return '';
  if (storagePath.startsWith('data:')) return storagePath;
  if (storagePath.startsWith('blob:')) return storagePath;
  const mime = fileType || 'image/jpeg';
  return `data:${mime};base64,${storagePath}`;
}

function downloadFromBase64(storagePath: string, fileName: string, fileType: string | null | undefined) {
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
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
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

function buildMediaSrc(storagePath: string | null | undefined, fileType: string | null | undefined): string {
  if (!storagePath) return '';
  if (storagePath.startsWith('blob:') || storagePath.startsWith('data:')) return storagePath;
  const mime = fileType || 'application/octet-stream';
  return `data:${mime};base64,${storagePath}`;
}

// ── Context Menu ──────────────────────────────────────────────────────────────

interface ContextMenuProps {
  isMe: boolean;
  message: Message;
  onClose: () => void;
  onEdit: () => void;
}

function MessageContextMenu({ isMe, message, onClose, onEdit }: ContextMenuProps) {
  const dispatch = useDispatch<AppDispatch>();
  const menuRef = useRef<HTMLDivElement>(null);

  // 5-minute edit window check
  const canEdit = isMe && (() => {
    try {
      const sentAt = new Date(message.sentAt).getTime();
      const now = Date.now();
      return (now - sentAt) < 5 * 60 * 1000;
    } catch {
      return false;
    }
  })();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content).catch(() => {});
    }
    onClose();
  };

  const handleDeleteForMe = async () => {
    try {
      await chatService.deleteForMe(message.id);
      dispatch(deleteMessageLocally(message.id));
    } catch (err) {
      console.error('Delete for me failed:', err);
    }
    onClose();
  };

  const handleDeleteForEveryone = async () => {
    try {
      await chatService.deleteForEveryone(message.id);
      // Socket will broadcast DELETE event — no local dispatch needed
    } catch (err) {
      console.error('Delete for everyone failed:', err);
    }
    onClose();
  };

  const handleEdit = () => {
    onEdit();
    onClose();
  };

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.92, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -4 }}
      transition={{ duration: 0.1 }}
      className={`absolute top-full mt-1 z-50 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden min-w-[160px] ${isMe ? 'right-0' : 'left-0'}`}
    >
      {/* Copy — always available */}
      <button
        onClick={handleCopy}
        className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-zinc-800 transition flex items-center gap-2"
      >
        <span>📋</span> Copy
      </button>

      {/* Edit — own messages within 5 min only */}
      {canEdit && (
        <button
          onClick={handleEdit}
          className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-zinc-800 transition flex items-center gap-2"
        >
          <span>✏️</span> Edit
        </button>
      )}

      {/* Delete for me — always available */}
      <button
        onClick={handleDeleteForMe}
        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 transition flex items-center gap-2"
      >
        <span>🗑️</span> Delete for Me
      </button>

      {/* Delete for everyone — own messages only */}
      {isMe && (
        <button
          onClick={handleDeleteForEveryone}
          className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-zinc-800 transition flex items-center gap-2 border-t border-zinc-700"
        >
          <span>❌</span> Delete for Everyone
        </button>
      )}
    </motion.div>
  );
}

// ── Inline Edit Input ─────────────────────────────────────────────────────────

interface EditInputProps {
  message: Message;
  onCancel: () => void;
  onSaved: (newContent: string) => void;
}

function EditInput({ message, onCancel, onSaved }: EditInputProps) {
  const [value, setValue] = useState(message.content || '');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSave = async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === message.content) {
      onCancel();
      return;
    }
    setSaving(true);
    try {
      await chatService.editMessage(message.id, trimmed);
      onSaved(trimmed);
    } catch (err) {
      console.error('Edit failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <textarea
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
        className="w-full bg-zinc-900 text-white text-sm rounded-xl px-3 py-2 border border-yellow-500/50 focus:outline-none focus:border-yellow-400 resize-none"
      />
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MessageBubble({ message, isMe }: Props) {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState<string | null>(null);
  const [localEdited, setLocalEdited] = useState(false);
  const [localEditedAt, setLocalEditedAt] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const content = localContent ?? message.content;
  const isEdited = localEdited || message.isEdited;
  const editedAt = localEditedAt || message.editedAt;

  const handleSaved = useCallback((newContent: string) => {
    setLocalContent(newContent);
    setLocalEdited(true);
    setLocalEditedAt(new Date().toISOString());
    setIsEditing(false);
  }, []);

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

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
          🚫 This message was deleted
        </div>
      </div>
    );
  }

  const att = message.attachment;
  const isVideo = att?.fileType?.includes('video');
  const isAudio = att?.fileType?.includes('audio');

  return (
    <>
      {/* Fullscreen image viewer */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <img
            src={fullscreenImage}
            alt="fullscreen"
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white text-5xl leading-none hover:text-zinc-300 transition"
            onClick={() => setFullscreenImage(null)}
          >×</button>
        </div>
      )}

      <motion.div
        ref={wrapperRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative`}
      >
        {/* ── Down arrow button — appears on hover ── */}
        <div className={`relative flex items-start gap-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>

          {/* Bubble */}
          <div
            className={`
              max-w-[70%] rounded-2xl relative overflow-hidden
              ${message.messageType === 'IMAGE' ? '' : 'px-4 py-2'}
              ${isMe ? 'bg-green-700 rounded-br-sm' : 'bg-zinc-800 rounded-bl-sm'}
            `}
          >
            {/* Sender name in group chats */}
            {!isMe && message.senderUsername && (
              <p className={`text-xs text-green-400 font-medium mb-1 ${message.messageType === 'IMAGE' ? 'px-3 pt-2' : ''}`}>
                {message.senderUsername}
              </p>
            )}

            {/* Reply quote */}
            {message.replyToId && (
              <div className="border-l-2 border-green-400 pl-2 mb-2 text-xs text-zinc-400">
                Replying to a message
              </div>
            )}

            {/* Editing mode */}
            {isEditing ? (
              <EditInput
                message={{ ...message, content }}
                onCancel={() => setIsEditing(false)}
                onSaved={handleSaved}
              />
            ) : (
              <>
                {/* TEXT */}
                {message.messageType === 'TEXT' && content && (
                  <p className="text-white text-sm whitespace-pre-wrap break-words">{content}</p>
                )}

                {/* IMAGE */}
                {message.messageType === 'IMAGE' && (
                  <div className="flex flex-col">
                    {att?.storagePath ? (
                      <img
                        src={buildImageSrc(att.storagePath, att.fileType)}
                        alt={att.fileName || 'image'}
                        className="block w-full max-w-[280px] max-h-[320px] object-cover cursor-pointer hover:opacity-95 transition"
                        onClick={() => setFullscreenImage(buildImageSrc(att.storagePath, att.fileType))}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-48 h-32 bg-zinc-700 flex items-center justify-center text-zinc-500 text-sm">
                        Image unavailable
                      </div>
                    )}
                    {content && (
                      <p className="text-white text-sm px-3 pt-1 pb-2 whitespace-pre-wrap break-words">{content}</p>
                    )}
                    {/* Timestamp inside image bubble with padding */}
                  </div>
                )}

                {/* FILE */}
                {message.messageType === 'FILE' && att && !isVideo && !isAudio && (
                  <div
                    className="flex items-center gap-3 bg-black/20 rounded-xl p-3 cursor-pointer hover:bg-black/30 transition min-w-[200px]"
                    onClick={() => { if (att.storagePath) downloadFromBase64(att.storagePath, att.fileName || 'file', att.fileType); }}
                  >
                    <span className="text-3xl flex-shrink-0">{getFileIcon(att.fileType)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate max-w-[160px]">{att.fileName || 'File'}</p>
                      <p className="text-zinc-400 text-xs">{formatFileSize(att.fileSizeBytes)}</p>
                    </div>
                    <span className="text-zinc-300 text-lg flex-shrink-0">⬇</span>
                  </div>
                )}

                {/* VIDEO */}
                {message.messageType === 'FILE' && att && isVideo && (
                  <div className="rounded-xl overflow-hidden max-w-[280px]">
                    <video controls className="w-full rounded-xl max-h-[220px]" src={buildMediaSrc(att.storagePath, att.fileType)}>
                      Your browser does not support video.
                    </video>
                    {att.fileName && <p className="text-zinc-400 text-xs mt-1 truncate">{att.fileName}</p>}
                  </div>
                )}

                {/* AUDIO */}
                {message.messageType === 'FILE' && att && isAudio && (
                  <div className="min-w-[220px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">🎵</span>
                      <p className="text-white text-sm truncate max-w-[160px]">{att.fileName || 'Audio'}</p>
                    </div>
                    <audio controls className="w-full" src={buildMediaSrc(att.storagePath, att.fileType)}>
                      Your browser does not support audio.
                    </audio>
                  </div>
                )}

                {/* LINK */}
                {message.messageType === 'LINK' && (
                  <div>
                    <button
                      onClick={() => window.open(att?.url || message.content || '#', '_blank')}
                      className="text-blue-400 underline text-sm break-all text-left"
                    >
                      {att?.url || message.content}
                    </button>
                    {att?.previewTitle && <p className="text-zinc-300 text-xs mt-1">{att.previewTitle}</p>}
                  </div>
                )}

                {/* CONTACT */}
                {message.messageType === 'CONTACT' && (
                  <div className="flex items-center gap-2 bg-zinc-700 rounded-xl p-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-600 flex items-center justify-center text-white">👤</div>
                    <p className="text-white text-sm font-medium">{att?.fileName || 'Contact'}</p>
                  </div>
                )}

                {/* STICKER */}
                {message.messageType === 'STICKER' && (
                  <img src={content || ''} alt="sticker" className="w-24 h-24 object-contain" />
                )}
              </>
            )}

            {/* Timestamp + ticks + edited label */}
            {!isEditing && (
              <div className={`flex items-center justify-end gap-1 mt-1 flex-wrap ${message.messageType === 'IMAGE' ? 'px-3 pb-2' : ''}`}>
                {isEdited && editedAt && (
                  <span className="text-xs text-zinc-400 italic">
                    edited · {formatTime(editedAt)}
                  </span>
                )}
                {isEdited && !editedAt && (
                  <span className="text-xs text-zinc-400 italic">edited</span>
                )}
                <span className="text-xs text-zinc-400">{formatTime(message.sentAt)}</span>
                {isMe && <MessageTicks status={message.status} />}
              </div>
            )}
          </div>

          {/* ── Arrow button — shows on group hover ── */}
          {!isEditing && (
            <div className="relative self-start mt-2">
              <button
                onClick={() => setShowMenu(prev => !prev)}
                className={`
                  opacity-0 group-hover:opacity-100 transition-opacity duration-150
                  w-5 h-5 flex items-center justify-center rounded-full
                  bg-zinc-700/80 hover:bg-zinc-600 text-zinc-300 text-xs
                  ${isMe ? 'mr-1' : 'ml-1'}
                `}
                title="Message options"
              >
                ▾
              </button>

              {/* Context menu */}
              <AnimatePresence>
                {showMenu && (
                  <MessageContextMenu
                    isMe={isMe}
                    message={message}
                    onClose={() => setShowMenu(false)}
                    onEdit={() => setIsEditing(true)}
                  />
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}