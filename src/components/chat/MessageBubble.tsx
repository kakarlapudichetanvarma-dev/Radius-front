import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import type { Message } from '../../types/chat.types';
import { chatService } from '../../services/chat.service';
import {
  deleteMessageLocally,
  setReplyingTo,
  starMessage,
  unstarMessage,
} from '../../store/slices/chat.slice';
import ForwardModal from '../common/ForwardModal';

interface Props {
  message: Message;
  isMe: boolean;
}

// ── Ticks ─────────────────────────────────────────────────────────────────────

function MessageTicks({ status, isMe }: { status: string; isMe: boolean }) {
  if (status === 'READ') {
    return <span style={{ color: isMe ? '#c4b5fd' : '#3b82f6' }} className="text-xs font-bold leading-none">✓✓</span>;
  }
  if (status === 'DELIVERED') {
    return <span className={`text-xs font-bold leading-none ${isMe ? 'text-purple-200/70' : 'text-gray-400'}`}>✓✓</span>;
  }
  return <span className={`text-xs leading-none ${isMe ? 'text-purple-200/70' : 'text-gray-400'}`}>✓</span>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getFileIcon(fileType: string | null | undefined): string {
  if (!fileType) return '📎';
  if (fileType.includes('pdf'))   return '📄';
  if (fileType.includes('word') || fileType.includes('doc')) return '📝';
  if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
  if (fileType.includes('zip') || fileType.includes('rar')) return '🗜️';
  if (fileType.includes('video')) return '🎥';
  if (fileType.includes('audio')) return '🎵';
  if (fileType.includes('text'))  return '📃';
  return '📎';
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function buildImageSrc(path: string | null | undefined, type: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('blob:')) return path;
  return `data:${type || 'image/jpeg'};base64,${path}`;
}

function buildMediaSrc(path: string | null | undefined, type: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('blob:') || path.startsWith('data:')) return path;
  return `data:${type || 'application/octet-stream'};base64,${path}`;
}

function downloadBase64(path: string, name: string, type: string | null | undefined) {
  try {
    if (path.startsWith('blob:') || path.startsWith('data:')) {
      const a = document.createElement('a'); a.href = path; a.download = name; a.click(); return;
    }
    const mime = type || 'application/octet-stream';
    const bytes = new Uint8Array(atob(path).split('').map(c => c.charCodeAt(0)));
    const url   = URL.createObjectURL(new Blob([bytes], { type: mime }));
    const a     = document.createElement('a'); a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } catch { /* ignore */ }
}

// Short label used in the reply preview when no previewText is available
function replyPreviewIcon(messageType: string | null | undefined): string {
  switch (messageType) {
    case 'IMAGE':   return '📷 ';
    case 'FILE':    return '📎 ';
    case 'STICKER': return '🩻 ';
    case 'CONTACT': return '👤 ';
    case 'LINK':    return '🔗 ';
    default:        return '';
  }
}

// ── Context Menu ──────────────────────────────────────────────────────────────

function MessageContextMenu({ isMe, message, onClose, onEdit, onReply, onForward }: {
  isMe: boolean;
  message: Message;
  onClose: () => void;
  onEdit: () => void;
  onReply: () => void;
  onForward: () => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const menuRef  = useRef<HTMLDivElement>(null);

  // Copy and Edit are only ever relevant for plain TEXT messages — files,
  // images, videos, audio, links, and stickers can only be deleted.
  const isTextMessage = message.messageType === 'TEXT';

  const canCopy = isTextMessage;

  const canEdit = isMe && isTextMessage && (() => {
    try { return (Date.now() - new Date(message.sentAt).getTime()) < 5 * 60 * 1000; }
    catch { return false; }
  })();

  const isStarred = !!message.starred;

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const handleToggleStar = async () => {
    try {
      if (isStarred) await dispatch(unstarMessage(message.id));
      else await dispatch(starMessage(message.id));
    } catch { /* ignore */ }
    onClose();
  };

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.92, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -4 }}
      transition={{ duration: 0.1 }}
      className={`absolute top-full mt-1 z-50 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden min-w-[155px] ${isMe ? 'right-0' : 'left-0'}`}
    >
      <button onClick={() => { onReply(); onClose(); }}
        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2">
        ↩️ Reply
      </button>

      <button onClick={() => { onForward(); onClose(); }}
        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2">
        ➡️ Forward
      </button>

      <button onClick={handleToggleStar}
        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2">
        {isStarred ? '⭐ Unstar' : '☆ Star'}
      </button>

      {canCopy && (
        <button onClick={() => { if (message.content) navigator.clipboard.writeText(message.content).catch(() => {}); onClose(); }}
          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2">
          📋 Copy
        </button>
      )}
      {canEdit && (
        <button onClick={() => { onEdit(); onClose(); }}
          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2">
          ✏️ Edit
        </button>
      )}
      <button onClick={async () => { try { await chatService.deleteForMe(message.id); dispatch(deleteMessageLocally(message.id)); } catch {} onClose(); }}
        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition flex items-center gap-2">
        🗑️ Delete for Me
      </button>
      {isMe && (
        <button onClick={async () => { try { await chatService.deleteForEveryone(message.id); } catch {} onClose(); }}
          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2 border-t border-gray-100">
          ❌ Delete for Everyone
        </button>
      )}
    </motion.div>
  );
}

// ── Inline Edit ───────────────────────────────────────────────────────────────

function EditInput({ message, onCancel, onSaved }: {
  message: Message; onCancel: () => void; onSaved: (v: string) => void;
}) {
  const [value, setValue]   = useState(message.content || '');
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);

  const save = async () => {
    const t = value.trim();
    if (!t || t === message.content) { onCancel(); return; }
    setSaving(true);
    try { await chatService.editMessage(message.id, t); onSaved(t); }
    catch { /* ignore */ }
    finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <textarea ref={ref} value={value} onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save(); } if (e.key === 'Escape') onCancel(); }}
        rows={2}
        className="w-full bg-white text-gray-800 text-sm rounded-xl px-3 py-2 border border-purple-300 focus:outline-none focus:border-purple-500 resize-none"
      />
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded transition">Cancel</button>
        <button onClick={save} disabled={saving}
          className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg transition disabled:opacity-50">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function MessageBubble({ message, isMe }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const [fullscreen, setFullscreen]     = useState<string | null>(null);
  const [showMenu, setShowMenu]         = useState(false);
  const [isEditing, setIsEditing]       = useState(false);
  const [localContent, setLocalContent] = useState<string | null>(null);
  const [localEdited, setLocalEdited]   = useState(false);
  const [localEditedAt, setLocalEditedAt] = useState<string | null>(null);
  const [isHovered, setIsHovered]       = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);

  const content  = localContent ?? message.content;
  // Always prefer server values (persists after refresh); local state only for optimistic UI
  const isEdited = message.isEdited || localEdited;
  const editedAt = message.editedAt || localEditedAt;

  const handleSaved = useCallback((v: string) => {
    setLocalContent(v);
    setLocalEdited(true);
    setLocalEditedAt(new Date().toISOString());
    setIsEditing(false);
    setIsHovered(false);   // ← reset hover so arrow disappears
    setShowMenu(false);    // ← ensure menu is also closed
  }, []);

  const handleReply = useCallback(() => {
    dispatch(setReplyingTo(message));
  }, [dispatch, message]);

  const fmt = (ts: string) => {
    try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  };

  if (message.messageType === 'GROUP_EVENT') {
    return <div className="text-center text-xs text-gray-400 py-1">{message.content}</div>;
  }

  if (message.isDeleted) {
    return (
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
        <div className="px-4 py-2 rounded-2xl bg-gray-100 text-gray-400 text-sm italic">
          🚫 This message was deleted
        </div>
      </div>
    );
  }

  const att     = message.attachment;
  const isVideo = att?.fileType?.includes('video');
  const isAudio = att?.fileType?.includes('audio');

  const bubbleClass = isMe
    ? 'bg-purple-600 text-white rounded-3xl rounded-br-md shadow-md'
    : 'bg-white text-gray-800 rounded-3xl rounded-bl-md shadow-sm border border-gray-100';

  return (
    <>
      {/* Fullscreen image */}
      {fullscreen && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
             onClick={() => setFullscreen(null)}>
          <img src={fullscreen} alt="fullscreen" className="max-w-full max-h-full object-contain rounded-xl"
               onClick={e => e.stopPropagation()} />
          <button className="absolute top-4 right-4 text-white text-5xl" onClick={() => setFullscreen(null)}>×</button>
        </div>
      )}

      {/* Forward modal */}
      <AnimatePresence>
        {showForwardModal && (
          <ForwardModal message={message} onClose={() => setShowForwardModal(false)} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.12 }}
        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`relative flex items-end gap-1.5 max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>

          {/* Bubble */}
          <div
            className={`relative ${message.messageType === 'IMAGE' ? '' : 'px-4 py-2.5'} ${bubbleClass} min-w-[60px]`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
          >

            {/* Forwarded label */}
            {message.isForwarded && (
              <p className={`text-[11px] italic mb-1 flex items-center gap-1 ${isMe ? 'text-purple-200' : 'text-gray-400'} ${message.messageType === 'IMAGE' ? 'px-3 pt-2' : ''}`}>
                ➡️ Forwarded
              </p>
            )}

            {/* Sender name — group incoming */}
            {!isMe && message.senderUsername && (
              <p className={`text-xs font-semibold mb-1 text-purple-500 ${message.messageType === 'IMAGE' ? 'px-3 pt-2' : ''}`}>
                {message.senderUsername.trim()}
              </p>
            )}

            {/* Reply preview */}
            {message.replyToId && (
              <div className={`border-l-2 pl-2 mb-2 text-xs ${isMe ? 'border-purple-300 text-purple-200' : 'border-purple-400 text-gray-400'}`}>
                {message.replyPreview ? (
                  <>
                    <p className={`font-semibold text-[11px] ${isMe ? 'text-purple-100' : 'text-purple-500'}`}>
                      {message.replyPreview.senderUsername || 'Someone'}
                    </p>
                    <p className="truncate max-w-[220px]">
                      {message.replyPreview.deleted
                        ? 'This message was deleted'
                        : `${replyPreviewIcon(message.replyPreview.messageType)}${message.replyPreview.previewText || ''}`}
                    </p>
                  </>
                ) : (
                  <p>Replying to a message</p>
                )}
              </div>
            )}

            {isEditing ? (
              <EditInput message={{ ...message, content }} onCancel={() => setIsEditing(false)} onSaved={handleSaved} />
            ) : (
              <>
                {/* TEXT */}
                {message.messageType === 'TEXT' && content && (
                  <p className="text-sm leading-[1.5] whitespace-pre-wrap break-words">{content}</p>
                )}

                {/* IMAGE */}
                {message.messageType === 'IMAGE' && (
                  <div>
                    {att?.storagePath ? (
                      <img src={buildImageSrc(att.storagePath, att.fileType)} alt={att.fileName || 'image'}
                           className="block w-full max-w-[260px] max-h-[300px] object-cover cursor-pointer hover:opacity-95 transition rounded-3xl"
                           onClick={() => setFullscreen(buildImageSrc(att.storagePath, att.fileType))}
                           onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-48 h-32 bg-gray-100 flex items-center justify-center text-gray-400 text-sm rounded-2xl">Image unavailable</div>
                    )}
                    {content && <p className="text-sm px-3 pt-1 pb-1 whitespace-pre-wrap break-words">{content}</p>}
                  </div>
                )}

                {/* FILE */}
                {message.messageType === 'FILE' && att && !isVideo && !isAudio && (
                  <div className={`flex items-center gap-3 rounded-2xl p-3 cursor-pointer transition min-w-[190px]
                                   ${isMe ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-50 hover:bg-gray-100'}`}
                       onClick={() => att.storagePath && downloadBase64(att.storagePath, att.fileName || 'file', att.fileType)}>
                    <span className="text-2xl">{getFileIcon(att.fileType)}</span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate max-w-[150px] ${isMe ? 'text-white' : 'text-gray-800'}`}>{att.fileName || 'File'}</p>
                      <p className={`text-xs ${isMe ? 'text-purple-200' : 'text-gray-400'}`}>{formatFileSize(att.fileSizeBytes)}</p>
                    </div>
                    <span className={`text-lg ${isMe ? 'text-purple-200' : 'text-gray-400'}`}>⬇</span>
                  </div>
                )}

                {/* VIDEO */}
                {message.messageType === 'FILE' && att && isVideo && (
                  <div className="rounded-2xl overflow-hidden max-w-[260px]">
                    <video controls className="w-full max-h-[200px]" src={buildMediaSrc(att.storagePath, att.fileType)}>
                      Your browser does not support video.
                    </video>
                  </div>
                )}

                {/* AUDIO */}
                {message.messageType === 'FILE' && att && isAudio && (
                  <div className="min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span>🎵</span>
                      <p className={`text-sm truncate max-w-[140px] ${isMe ? 'text-white' : 'text-gray-800'}`}>{att.fileName || 'Audio'}</p>
                    </div>
                    <audio controls className="w-full" src={buildMediaSrc(att.storagePath, att.fileType)} />
                  </div>
                )}

                {/* LINK */}
                {message.messageType === 'LINK' && (
                  <div>
                    <button onClick={() => window.open(att?.url || message.content || '#', '_blank')}
                            className={`underline text-sm break-all text-left ${isMe ? 'text-purple-100' : 'text-blue-500'}`}>
                      {att?.url || message.content}
                    </button>
                    {att?.previewTitle && <p className={`text-xs mt-1 ${isMe ? 'text-purple-200' : 'text-gray-400'}`}>{att.previewTitle}</p>}
                  </div>
                )}

                {/* STICKER */}
                {message.messageType === 'STICKER' && (
                  <img src={content || ''} alt="sticker" className="w-24 h-24 object-contain" />
                )}
              </>
            )}

            {/* Time + ticks / Chevron — mutually exclusive on hover */}
            {!isEditing && (
              <div className={`flex items-center justify-end gap-1 mt-1 ${message.messageType === 'IMAGE' ? 'px-3 pb-2' : ''}`}>
                {message.starred && (
                  <span className={`text-[11px] ${isMe ? 'text-purple-200' : 'text-amber-500'}`} title="Starred">⭐</span>
                )}
                {isHovered ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(p => !p)}
                      className={`flex items-center justify-center transition-colors ${isMe ? 'text-purple-200 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                      style={{ lineHeight: 0 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {showMenu && (
                        <MessageContextMenu
                          isMe={isMe}
                          message={message}
                          onClose={() => setShowMenu(false)}
                          onEdit={() => setIsEditing(true)}
                          onReply={handleReply}
                          onForward={() => setShowForwardModal(true)}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <>
                    {isEdited ? (
                      // Edited: show "edited · 10:32 AM" only — no separate sentAt
                      <span className={`text-[11px] italic ${isMe ? 'text-purple-200' : 'text-gray-400'}`}>
                        edited · {editedAt ? fmt(editedAt) : fmt(message.sentAt)}
                      </span>
                    ) : (
                      // Not edited: show sentAt time
                      <span className={`text-[11px] ${isMe ? 'text-purple-100/80' : 'text-gray-400'}`}>
                        {fmt(message.sentAt)}
                      </span>
                    )}
                    {isMe && <MessageTicks status={message.status} isMe={isMe} />}
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </motion.div>
    </>
  );
}