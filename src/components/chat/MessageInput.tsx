import { useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';

import {
  sendPrivateMessage,
  sendGroupMessage,
  promoteTempChat,
  receiveMessage,
  updateMessageStatus
} from '../../store/slices/chat.slice';

import { trackOptimisticMessage } from '../../socket/message.events';

import VueWrapper from '../../vue/VueWrapper';
import DragDropZone from './DragDropZone';

import {
  prepareUpload,
  revokePreview,
  getFileIcon,
  formatFileSize,
  INPUT_ACCEPT,
  type PreparedUpload
} from '../../services/upload.service';

export default function MessageInput() {
  const dispatch = useDispatch<AppDispatch>();

  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<PreparedUpload | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedChat = useSelector((state: RootState) => state.chat.selectedChat);
  const { user } = useSelector((state: RootState) => state.auth);

  // ─────────────────────────────────────────────
  // Handle file pick / drag drop
  // ─────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    setUploadError(null);
    try {
      if (pendingUpload?.previewUrl) revokePreview(pendingUpload.previewUrl);
      const prepared = await prepareUpload(file);
      setPendingUpload(prepared);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to load file');
      setTimeout(() => setUploadError(null), 3000);
    }
  }, [pendingUpload]);

  const clearPending = () => {
    if (pendingUpload?.previewUrl) revokePreview(pendingUpload.previewUrl);
    setPendingUpload(null);
  };

  // ─────────────────────────────────────────────
  // SEND MESSAGE
  // ─────────────────────────────────────────────
  const handleSend = async () => {
    if (!selectedChat) return;
    if (!text.trim() && !pendingUpload) return;

    setUploading(true);

    const content = text.trim();
    setText('');

    const uploadSnapshot = pendingUpload;
    setPendingUpload(null);

    // ✅ OPTIMISTIC LOCAL MESSAGE
    const optimisticId = crypto.randomUUID();
    const optimisticContent = content || uploadSnapshot?.fileName || '';

    const optimisticMessage = {
      id: optimisticId,
      chatId: selectedChat.chatId,
      senderId: user?.id || '',
      senderUsername: user?.username || '',
      content: optimisticContent,
      messageType: uploadSnapshot ? uploadSnapshot.uploadType : 'TEXT',
      status: 'SENT' as const,
      sentAt: new Date().toISOString(),
      deliveredAt: null,
      readAt: null,
      editedAt: null,
      isEdited: false,
      isDeleted: false,
      replyToId: null,
      date: null,
      attachment: uploadSnapshot
        ? {
          id: optimisticId,
          fileName: uploadSnapshot.fileName,
          fileType: uploadSnapshot.fileType,
          fileSizeBytes: uploadSnapshot.fileSizeBytes,
          mediaType: uploadSnapshot.uploadType,
          storagePath: uploadSnapshot.previewUrl,
          url: uploadSnapshot.previewUrl,
          previewTitle: null,
          previewDesc: null,
          uploadedAt: new Date().toISOString()
        }
        : null
    };

    // ✅ Register FIRST so the map is ready before WS can fire
    trackOptimisticMessage(selectedChat.chatId, optimisticContent, optimisticId);

    // ✅ Then show message instantly
    dispatch(receiveMessage(optimisticMessage as any));

    try {
      const messageType = uploadSnapshot ? uploadSnapshot.uploadType : 'TEXT';

      const basePayload = {
        content: optimisticContent,
        messageType,
        ...(uploadSnapshot
          ? {
            fileData: uploadSnapshot.base64,
            fileName: uploadSnapshot.fileName,
            fileType: uploadSnapshot.fileType,
            fileSizeBytes: uploadSnapshot.fileSizeBytes
          }
          : {})
      };

      // ─────────────────────────────
      // PRIVATE MESSAGE
      // ─────────────────────────────
      if (selectedChat.type === 'PRIVATE' && selectedChat.otherParticipantUsername) {
        const result = await dispatch(
          sendPrivateMessage({
            receiverUsername: selectedChat.otherParticipantUsername,
            ...basePayload
          })
        );

        if (sendPrivateMessage.fulfilled.match(result) && result.payload) {
          const sentMsg = result.payload;

          // ✅ Upgrade optimistic to DELIVERED immediately
          dispatch(updateMessageStatus({ messageId: optimisticId, status: 'DELIVERED' }));

          // temp chat → real chat
          if (selectedChat.chatId.startsWith('temp-') && sentMsg.chatId) {
            dispatch(
              promoteTempChat({
                ...selectedChat,
                chatId: sentMsg.chatId,
                lastMessage: sentMsg.content,
                lastMessageAt: sentMsg.sentAt,
                unreadCount: 0
              })
            );
          }

          // refresh sidebar
          // Removed fetchChats — causes duplicate by re-fetching DB while optimistic still in state
        }
      }

      // ─────────────────────────────
      // GROUP MESSAGE
      // ─────────────────────────────
      else if (selectedChat.type === 'GROUP') {
        await dispatch(sendGroupMessage({ chatId: selectedChat.chatId, ...basePayload }));
        dispatch(updateMessageStatus({ messageId: optimisticId, status: 'DELIVERED' }));
      }

      if (uploadSnapshot?.previewUrl) revokePreview(uploadSnapshot.previewUrl);

    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setUploading(false);
    }
  };

  // ─────────────────────────────────────────────
  // Emoji
  // ─────────────────────────────────────────────
  const handleEmoji = (emoji: string) => {
    setText(prev => prev + emoji);
    setShowEmoji(false);
  };

  // ─────────────────────────────────────────────
  // Enter key
  // ─────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DragDropZone onFileDrop={handleFile} disabled={!selectedChat || uploading}>
      <div className="relative">

        {/* Upload Error */}
        {uploadError && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-600 text-yellow-400 text-xs px-3 py-1.5 rounded-lg z-50">
            {uploadError}
          </div>
        )}

        {/* Emoji Picker */}
        {showEmoji && (
          <div className="absolute bottom-20 left-4 z-50">
            <VueWrapper onSelect={handleEmoji} />
          </div>
        )}

        {/* File Preview */}
        {pendingUpload && (
          <div className="bg-black border-t border-yellow-500/20 px-4 py-3 flex items-center gap-3">
            {pendingUpload.uploadType === 'IMAGE' && pendingUpload.previewUrl ? (
              <img
                src={pendingUpload.previewUrl}
                alt="preview"
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-yellow-500/20 flex items-center justify-center text-3xl flex-shrink-0">
                {getFileIcon(pendingUpload.fileType)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-yellow-400 text-sm truncate font-medium">{pendingUpload.fileName}</p>
              <p className="text-yellow-500/70 text-xs">{formatFileSize(pendingUpload.fileSizeBytes)}</p>
            </div>
            <button onClick={clearPending} className="text-yellow-500/70 hover:text-yellow-400 text-xl transition flex-shrink-0">
              ✕
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="h-16 bg-black border-t border-yellow-500/20 flex items-center gap-2 px-4">

          {/* Emoji */}
          <button
            onClick={() => setShowEmoji(prev => !prev)}
            className="text-2xl hover:scale-110 transition flex-shrink-0"
            disabled={!selectedChat}
          >
            😀
          </button>

          {/* File */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-yellow-500/70 hover:text-yellow-400 text-xl transition flex-shrink-0"
            disabled={!selectedChat || uploading}
          >
            📎
          </button>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={INPUT_ACCEPT}
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />

          {/* Text */}
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedChat ? 'Type message...' : 'Select a chat to start messaging'}
            disabled={!selectedChat || uploading}
            className="flex-1 p-3 rounded-xl bg-zinc-800 text-yellow-400 outline-none disabled:opacity-50 placeholder:text-zinc-500"
          />

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={!selectedChat || uploading || (!text.trim() && !pendingUpload)}
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-xl disabled:opacity-50 transition flex-shrink-0 text-yellow-400 font-medium"
          >
            {uploading ? (
              <span className="flex items-center gap-1">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75" />
                </svg>
              </span>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </DragDropZone>
  );
}