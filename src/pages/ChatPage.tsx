import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';

import MainLayout from '../layouts/MainLayout';
import Sidebar from '../components/chat/Sidebar';
import ChatHeader from '../components/chat/ChatHeader';
import ChatWindow from '../components/chat/ChatWindow';
import MessageInput from '../components/chat/MessageInput';
import IncomingCallModal from '../components/call/IncomingCallModal';

import { fetchChats, setTyping, updateOnlineUsers } from '../store/slices/chat.slice';
import { fetchFriends, fetchPendingRequests } from '../store/slices/friend.slice';
import { ensureSocketConnected, safeSubscribe } from '../socket/socket.client';
import { revokePreview, type PreparedUpload } from '../services/upload.service';

export default function ChatPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  // ✅ Shared pendingUpload state — ChatWindow sets it on drop, MessageInput uses it
  const [pendingUpload, setPendingUpload] = useState<PreparedUpload | null>(null);

  const handleSetPendingUpload = (upload: PreparedUpload | null) => {
    if (pendingUpload?.previewUrl) revokePreview(pendingUpload.previewUrl);
    setPendingUpload(upload);
  };

  useEffect(() => {
    if (!user?.username) return;
    dispatch(fetchChats(user.username));
    dispatch(fetchFriends());
    dispatch(fetchPendingRequests());

    const pollInterval = setInterval(() => {
      dispatch(fetchPendingRequests());
      dispatch(fetchChats(user.username));
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [dispatch, user]);

  useEffect(() => {
    ensureSocketConnected();
    safeSubscribe('/topic/typing', msg => {
      dispatch(setTyping(msg.body));
      setTimeout(() => dispatch(setTyping(null)), 3000);
    });
    safeSubscribe('/topic/presence', msg => {
      try { dispatch(updateOnlineUsers(JSON.parse(msg.body))); }
      catch (err) { console.error(err); }
    });
  }, [dispatch]);

  return (
    <MainLayout>
      <IncomingCallModal />
      <div className="grid grid-cols-12 h-full overflow-hidden">

        <div className="col-span-4 min-h-0 overflow-hidden">
          <Sidebar />
        </div>

        <div className="col-span-8 flex flex-col min-h-0 overflow-hidden">
          <ChatHeader />

          {/* ✅ ChatWindow gets full remaining space and handles drag-drop */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ChatWindow onFilePrepared={handleSetPendingUpload} />
          </div>

          {/* ✅ MessageInput receives pendingUpload from parent */}
          <MessageInput
            pendingUpload={pendingUpload}
            setPendingUpload={handleSetPendingUpload}
          />
        </div>

      </div>
    </MainLayout>
  );
}