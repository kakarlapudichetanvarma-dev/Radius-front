import { useState, useRef, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';

import {
  sendPrivateMessage,
  sendGroupMessage,
  promoteTempChat,
  receiveMessage,
  updateMessageStatus,
} from '../../store/slices/chat.slice';

import { trackOptimisticMessage } from '../../socket/message.events';
import { socketClient } from '../../socket/socket.client';
import VueWrapper from '../../vue/VueWrapper';

import {
  prepareUpload,
  revokePreview,
  getFileIcon,
  formatFileSize,
  type PreparedUpload,
} from '../../services/upload.service';

interface Props {
  pendingUpload: PreparedUpload | null;
  setPendingUpload: (u: PreparedUpload | null) => void;
}

export default function MessageInput({ pendingUpload, setPendingUpload }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const [text, setText]             = useState('');
  const [showEmoji, setShowEmoji]   = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef     = useRef<HTMLInputElement>(null);
  const typingTimeout    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef      = useRef(false);

  const selectedChat = useSelector((s: RootState) => s.chat.selectedChat);
  const { user }     = useSelector((s: RootState) => s.auth);

  // ── File handling ─────────────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    setUploadError(null);
    try {
      if (pendingUpload?.previewUrl) revokePreview(pendingUpload.previewUrl);
      setPendingUpload(await prepareUpload(file));
    } catch (err: any) {
      setUploadError(err.message || 'Failed to load file');
      setTimeout(() => setUploadError(null), 3000);
    }
  }, [pendingUpload, setPendingUpload]);

  const clearPending = () => {
    if (pendingUpload?.previewUrl) revokePreview(pendingUpload.previewUrl);
    setPendingUpload(null);
  };

  // ── Typing ────────────────────────────────────────────────────────────────
  const sendTyping = () => {
    if (!selectedChat || !socketClient.connected) return;
    socketClient.publish({ destination: '/app/chat.typing', body: JSON.stringify({ chatId: selectedChat.chatId, username: user?.username }) });
  };
  const sendStopTyping = () => {
    if (!selectedChat || !socketClient.connected) return;
    socketClient.publish({ destination: '/app/chat.stopTyping', body: JSON.stringify({ chatId: selectedChat.chatId, username: user?.username }) });
    isTypingRef.current = false;
  };

  const handleTyping = (val: string) => {
    setText(val);
    if (!selectedChat) return;
    sendTyping();
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(sendStopTyping, 1000);
  };

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!selectedChat || (!text.trim() && !pendingUpload)) return;
    sendStopTyping();

    const content        = text.trim();
    const uploadSnapshot = pendingUpload;
    setText('');
    setPendingUpload(null);

    const optimisticId = `temp-${crypto.randomUUID()}`;
    const optimistic = {
      id: optimisticId, chatId: selectedChat.chatId,
      senderId: user?.id || '', senderUsername: user?.username || '',
      content, messageType: uploadSnapshot ? uploadSnapshot.uploadType : 'TEXT',
      status: 'SENT' as const, sentAt: new Date().toISOString(),
      deliveredAt: null, readAt: null, editedAt: null,
      isEdited: false, isDeleted: false, replyToId: null, date: null,
      attachment: uploadSnapshot ? {
        id: optimisticId, fileName: uploadSnapshot.fileName, fileType: uploadSnapshot.fileType,
        fileSizeBytes: uploadSnapshot.fileSizeBytes, mediaType: uploadSnapshot.uploadType,
        storagePath: uploadSnapshot.previewUrl, url: uploadSnapshot.previewUrl,
        previewTitle: null, previewDesc: null, uploadedAt: new Date().toISOString(),
      } : null,
    };

    trackOptimisticMessage(selectedChat.chatId, content, optimisticId);
    dispatch(receiveMessage(optimistic as any));
    setUploading(true);

    try {
      const isLink      = /^https?:\/\/\S+$/i.test(content);
      const msgType     = uploadSnapshot ? uploadSnapshot.uploadType : isLink ? 'LINK' : 'TEXT';
      const basePayload = {
        content, messageType: msgType,
        ...(msgType === 'LINK' ? { url: content } : {}),
        ...(uploadSnapshot ? {
          fileData: uploadSnapshot.base64, fileName: uploadSnapshot.fileName,
          fileType: uploadSnapshot.fileType, fileSizeBytes: uploadSnapshot.fileSizeBytes,
        } : {}),
      };

      if (selectedChat.type === 'PRIVATE' && selectedChat.otherParticipantUsername) {
        const result = await dispatch(sendPrivateMessage({ receiverUsername: selectedChat.otherParticipantUsername, ...basePayload }));
        if (sendPrivateMessage.fulfilled.match(result) && result.payload) {
          dispatch(updateMessageStatus({ messageId: optimisticId, status: 'DELIVERED' }));
          const sent = result.payload;
          if (selectedChat.chatId.startsWith('temp-') && sent.chatId) {
            dispatch(promoteTempChat({ ...selectedChat, chatId: sent.chatId, lastMessage: sent.content, lastMessageAt: sent.sentAt, unreadCount: 0 }));
          }
        }
      } else if (selectedChat.type === 'GROUP') {
        await dispatch(sendGroupMessage({ chatId: selectedChat.chatId, ...basePayload }));
        dispatch(updateMessageStatus({ messageId: optimisticId, status: 'DELIVERED' }));
      }

      if (uploadSnapshot?.previewUrl) revokePreview(uploadSnapshot.previewUrl);
    } catch (err) { console.error('Send failed:', err); }
    finally { setUploading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  useEffect(() => () => { if (typingTimeout.current) clearTimeout(typingTimeout.current); sendStopTyping(); }, []);

  if (!selectedChat) return null;

  return (
    <div className="relative flex-shrink-0">
      {/* Upload error */}
      {uploadError && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg z-50 shadow">
          {uploadError}
        </div>
      )}

      {/* Emoji picker */}
      {showEmoji && (
        <div className="absolute bottom-[72px] left-4 z-50 shadow-xl rounded-2xl overflow-hidden">
          <VueWrapper onSelect={emoji => { setText(p => p + emoji); setShowEmoji(false); }} />
        </div>
      )}

      {/* File preview strip */}
      {pendingUpload && (
        <div className="bg-gray-50 border-t border-gray-100 px-4 py-3 flex items-center gap-3">
          {pendingUpload.uploadType === 'IMAGE' && pendingUpload.previewUrl ? (
            <img src={pendingUpload.previewUrl} alt="preview" className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-200" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-2xl flex-shrink-0">
              {getFileIcon(pendingUpload.fileType)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-gray-800 text-sm font-medium truncate">{pendingUpload.fileName}</p>
            <p className="text-gray-400 text-xs">{formatFileSize(pendingUpload.fileSizeBytes)}</p>
          </div>
          <button onClick={clearPending} className="text-gray-400 hover:text-gray-600 text-xl transition">✕</button>
        </div>
      )}

      {/* Input bar — matches image 2 exactly */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3">

        {/* Attachment clip icon */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-purple-500 hover:bg-purple-50 transition flex-shrink-0"
          title="Attach file"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
          </svg>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="*"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
        />

        {/* Pill text input */}
        <div className="flex-1 relative">
          <input
            value={text}
            onChange={e => handleTyping(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message here..."
            disabled={uploading}
            className="w-full h-11 pl-4 pr-10 rounded-full bg-gray-50 border border-gray-200
                       text-gray-800 text-sm placeholder:text-gray-400 outline-none
                       focus:border-purple-300 focus:bg-white transition-colors disabled:opacity-50"
          />
          {/* Emoji inside input right */}
          <button
            onClick={() => setShowEmoji(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500 transition text-lg"
          >
            😀
          </button>
        </div>

        {/* Purple circular send button */}
        <button
          onClick={handleSend}
          disabled={uploading || (!text.trim() && !pendingUpload)}
          className="w-11 h-11 rounded-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40
                     text-white flex items-center justify-center transition-colors flex-shrink-0 shadow"
          title="Send"
        >
          {uploading ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
              <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}