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
  type PreparedUpload
} from '../../services/upload.service';

interface Props {
  pendingUpload: PreparedUpload | null;
  setPendingUpload: (upload: PreparedUpload | null) => void;
}

export default function MessageInput({
  pendingUpload,
  setPendingUpload
}: Props) {

  const dispatch = useDispatch<AppDispatch>();

  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ TYPING
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const selectedChat = useSelector(
    (state: RootState) => state.chat.selectedChat
  );

  const { user } = useSelector(
    (state: RootState) => state.auth
  );

  const handleFile = useCallback(async (file: File) => {
    setUploadError(null);

    try {

      if (pendingUpload?.previewUrl) {
        revokePreview(pendingUpload.previewUrl);
      }

      const prepared = await prepareUpload(file);

      setPendingUpload(prepared);

    } catch (err: any) {

      setUploadError(
        err.message || 'Failed to load file'
      );

      setTimeout(() => {
        setUploadError(null);
      }, 3000);
    }

  }, [pendingUpload, setPendingUpload]);

  const clearPending = () => {

    if (pendingUpload?.previewUrl) {
      revokePreview(pendingUpload.previewUrl);
    }

    setPendingUpload(null);
  };

  // ✅ SEND TYPING
  const sendTyping = () => {

    if (
      !selectedChat ||
      !socketClient.connected
    ) {
      return;
    }

    socketClient.publish({
      destination: '/app/chat.typing',

      body: JSON.stringify({
        chatId: selectedChat.chatId,
        username: user?.username
      })
    });
  };;

  // ✅ SEND STOP TYPING
  const sendStopTyping = () => {

    if (
      !selectedChat ||
      !socketClient.connected
    ) {
      return;
    }

    socketClient.publish({
      destination: '/app/chat.stopTyping',

      body: JSON.stringify({
        chatId: selectedChat.chatId,
        username: user?.username
      })
    });

    isTypingRef.current = false;
  };

  // ✅ HANDLE TYPING
  const handleTyping = (value: string) => {

    setText(value);

    if (!selectedChat) {
      return;
    }

    // ✅ SEND TYPING EVERY KEYSTROKE
    sendTyping();

    // RESET STOP TIMER
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // STOP ONLY AFTER USER REALLY STOPS
    typingTimeoutRef.current = setTimeout(() => {
      sendStopTyping();
    }, 1000);
  };

  const handleSend = async () => {

    if (!selectedChat) return;

    if (!text.trim() && !pendingUpload) return;

    // ✅ STOP TYPING IMMEDIATELY
    sendStopTyping();

    // Snapshot before clearing
    const content = text.trim();

    const uploadSnapshot = pendingUpload;

    // Clear UI instantly
    setText('');

    setPendingUpload(null);

    const optimisticId = `temp-${crypto.randomUUID()}`;

    const optimisticContent = content;

    const optimisticMessage = {
      id: optimisticId,
      chatId: selectedChat.chatId,
      senderId: user?.id || '',
      senderUsername: user?.username || '',
      content: optimisticContent,
      messageType: uploadSnapshot
        ? uploadSnapshot.uploadType
        : 'TEXT',
      status: 'SENT' as const,
      sentAt: new Date().toISOString(),
      deliveredAt: null,
      readAt: null,
      editedAt: null,
      isEdited: false,
      isDeleted: false,
      replyToId: null,
      date: null,
      attachment: uploadSnapshot ? {
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
      } : null
    };

    trackOptimisticMessage(
      selectedChat.chatId,
      optimisticContent,
      optimisticId
    );

    dispatch(
      receiveMessage(optimisticMessage as any)
    );

    setUploading(true);

    try {

      const isLinkMessage =
        /^https?:\/\/\S+$/i.test(optimisticContent);

      const messageType =
        uploadSnapshot
          ? uploadSnapshot.uploadType
          : isLinkMessage
            ? 'LINK'
            : 'TEXT';

      const basePayload = {
        content: optimisticContent,
        messageType,

        ...(messageType === 'LINK'
          ? {
            url: optimisticContent
          }
          : {}),

        ...(uploadSnapshot ? {
          fileData: uploadSnapshot.base64,
          fileName: uploadSnapshot.fileName,
          fileType: uploadSnapshot.fileType,
          fileSizeBytes: uploadSnapshot.fileSizeBytes
        } : {})
      };

      // PRIVATE
      if (
        selectedChat.type === 'PRIVATE' &&
        selectedChat.otherParticipantUsername
      ) {

        const result =
          await dispatch(
            sendPrivateMessage({
              receiverUsername:
                selectedChat.otherParticipantUsername,
              ...basePayload
            })
          );

        if (
          sendPrivateMessage.fulfilled.match(result) &&
          result.payload
        ) {

          dispatch(
            updateMessageStatus({
              messageId: optimisticId,
              status: 'DELIVERED'
            })
          );

          const sentMsg = result.payload;

          if (
            selectedChat.chatId.startsWith('temp-') &&
            sentMsg.chatId
          ) {

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
        }

        // GROUP
      } else if (selectedChat.type === 'GROUP') {

        await dispatch(
          sendGroupMessage({
            chatId: selectedChat.chatId,
            ...basePayload
          })
        );

        dispatch(
          updateMessageStatus({
            messageId: optimisticId,
            status: 'DELIVERED'
          })
        );
      }

      if (uploadSnapshot?.previewUrl) {
        revokePreview(uploadSnapshot.previewUrl);
      }

    } catch (err) {

      console.error(
        'Send failed:',
        err
      );

    } finally {

      setUploading(false);
    }
  };

  const handleEmoji = (emoji: string) => {

    setText(prev => prev + emoji);

    setShowEmoji(false);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent
  ) => {

    if (
      e.key === 'Enter' &&
      !e.shiftKey
    ) {

      e.preventDefault();

      handleSend();
    }
  };

  // ✅ CLEANUP
  useEffect(() => {

    return () => {

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      sendStopTyping();
    };

  }, []);

  return (
    <div className="relative">

      {uploadError && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg z-50">
          {uploadError}
        </div>
      )}

      {showEmoji && (
        <div className="absolute bottom-20 left-4 z-50">
          <VueWrapper onSelect={handleEmoji} />
        </div>
      )}

      {/* FILE PREVIEW */}
      {pendingUpload && (
        <div className="bg-black border-t border-yellow-500/20 px-4 py-3 flex items-center gap-3">

          {pendingUpload.uploadType === 'IMAGE' &&
            pendingUpload.previewUrl ? (

            <img
              src={pendingUpload.previewUrl}
              alt="preview"
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />

          ) : (

            <div className="w-16 h-16 rounded-lg bg-yellow-500/20 flex items-center justify-center text-3xl flex-shrink-0">
              {getFileIcon(
                pendingUpload.fileType
              )}
            </div>
          )}

          <div className="flex-1 min-w-0">

            <p className="text-yellow-400 text-sm truncate font-medium">
              {pendingUpload.fileName}
            </p>

            <p className="text-yellow-500/70 text-xs">
              {formatFileSize(
                pendingUpload.fileSizeBytes
              )}
            </p>

          </div>

          <button
            onClick={clearPending}
            className="text-yellow-500/70 hover:text-yellow-400 text-xl transition flex-shrink-0"
          >
            ✕
          </button>

        </div>
      )}

      {selectedChat && (
  <div className="h-16 bg-black border-t border-yellow-500/20 flex items-center gap-2 px-4">

    <button
      onClick={() => setShowEmoji(prev => !prev)}
      className="text-2xl hover:scale-110 transition flex-shrink-0"
      disabled={!selectedChat}
    >
      😀
    </button>

    <button
      onClick={() => fileInputRef.current?.click()}
      className="text-yellow-500/70 hover:text-yellow-400 text-xl transition flex-shrink-0"
      disabled={!selectedChat || uploading}
    >
      ✚
    </button>

    <input
      ref={fileInputRef}
      type="file"
      className="hidden"
      accept="*"
      onChange={e => {

        const file = e.target.files?.[0];

        if (file) {
          handleFile(file);
        }

        e.target.value = '';
      }}
    />

    <input
      value={text}
      onChange={e => handleTyping(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Type message..."
      disabled={!selectedChat || uploading}
      className="flex-1 p-3 rounded-xl bg-zinc-800 text-yellow-400 outline-none disabled:opacity-50 placeholder:text-zinc-500"
    />

    <button
      onClick={handleSend}
      disabled={
        !selectedChat ||
        uploading ||
        (!text.trim() && !pendingUpload)
      }
      className="bg-yellow-500 hover:bg-yellow-400 text-black w-11 h-11 rounded-full disabled:opacity-50 transition flex-shrink-0 font-medium flex items-center justify-center text-lg"
    >

      {uploading ? (
        <svg
          className="animate-spin w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            className="opacity-25"
          />

          <path
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
            className="opacity-75"
          />
        </svg>
      ) : '➤'}

    </button>
  </div>
)}
    </div>
  );
}
