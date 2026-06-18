import { useEffect } from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';

import MainLayout from '../layouts/MainLayout';
import Sidebar from '../components/chat/Sidebar';
import ChatHeader from '../components/chat/ChatHeader';
import ChatWindow from '../components/chat/ChatWindow';
import MessageInput from '../components/chat/MessageInput';
import NovaChatWindow from '../components/chat/NovaChatWindow';

import { fetchChats } from '../store/slices/chat.slice';
import { fetchFriends } from '../store/slices/friend.slice';
import { ensureSocketConnected, safeSubscribe } from '../socket/socket.client';
import { revokePreview, type PreparedUpload } from '../services/upload.service';

const SIDEBAR_WIDTH = 360;

export default function ChatPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const isNovaChatOpen = useSelector((state: RootState) => state.chat.isNovaChatOpen);

  const [pendingUpload, setPendingUpload] = useState<PreparedUpload | null>(null);

  const handleSetPendingUpload = (upload: PreparedUpload | null) => {
    if (pendingUpload?.previewUrl) revokePreview(pendingUpload.previewUrl);
    setPendingUpload(upload);
  };

  // ── Data fetch + polling ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.username) return;
    dispatch(fetchChats(user.username));
    dispatch(fetchFriends());
    const pollInterval = setInterval(() => {
      dispatch(fetchChats(user.username));
    }, 30000);
    return () => clearInterval(pollInterval);
  }, [dispatch, user]);

  // ── WebSocket ─────────────────────────────────────────────────────────────
  useEffect(() => {
    ensureSocketConnected();
    safeSubscribe('/topic/typing', _msg => {});
  }, [dispatch]);

  return (
    <MainLayout>

      <div className="flex h-full overflow-hidden bg-white">

        {/* Sidebar — fixed width, no resize */}
        <div
          className="flex-shrink-0 h-full overflow-hidden border-r border-gray-200"
          style={{ width: SIDEBAR_WIDTH }}
        >
          <Sidebar />
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
          {isNovaChatOpen ? (
            <NovaChatWindow />
          ) : (
            <>
              <ChatHeader />
              <div className="flex-1 min-h-0 overflow-hidden">
                <ChatWindow onFilePrepared={handleSetPendingUpload} />
              </div>
              <MessageInput
                pendingUpload={pendingUpload}
                setPendingUpload={handleSetPendingUpload}
              />
            </>
          )}
        </div>

      </div>
    </MainLayout>
  );
}