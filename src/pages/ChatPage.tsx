import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';

import MainLayout from '../layouts/MainLayout';
import Sidebar from '../components/chat/Sidebar';
import ChatHeader from '../components/chat/ChatHeader';
import ChatWindow from '../components/chat/ChatWindow';
import MessageInput from '../components/chat/MessageInput';
import IncomingCallModal from '../components/call/IncomingCallModal';

import {
  fetchChats,
  setTyping,
  updateOnlineUsers
} from '../store/slices/chat.slice';

import {
  fetchFriends,
  fetchPendingRequests
} from '../store/slices/friend.slice';

import { ensureSocketConnected, safeSubscribe } from '../socket/socket.client';

export default function ChatPage() {
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector(
    (state: RootState) => state.auth
  );

  // ─── Initial data load ───────────────────────
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

  // ─── Socket subscriptions ────────────────────
  // ✅ Use safeSubscribe instead of reassigning onConnect.
  // This works whether the socket is already connected or not,
  // and does NOT disconnect/reconnect the socket on unmount.
  useEffect(() => {
    ensureSocketConnected();

    safeSubscribe('/topic/typing', msg => {
      dispatch(setTyping(msg.body));
      setTimeout(() => dispatch(setTyping(null)), 3000);
    });

    safeSubscribe('/topic/presence', msg => {
      try {
        dispatch(updateOnlineUsers(JSON.parse(msg.body)));
      } catch (err) {
        console.error(err);
      }
    });

    // ✅ No cleanup that deactivates the socket —
    // socket must stay alive across re-renders
  }, [dispatch]);

  return (
    <MainLayout>
      <IncomingCallModal />

      <div className="grid grid-cols-12 h-full overflow-hidden">

        {/* Sidebar */}
        <div className="col-span-4 min-h-0 overflow-hidden">
          <Sidebar />
        </div>

        {/* Chat Area */}
        <div className="col-span-8 flex flex-col min-h-0 overflow-hidden">
          <ChatHeader />

          <div className="flex-1 min-h-0 overflow-hidden">
            <ChatWindow />
          </div>

          <MessageInput />
        </div>
      </div>
    </MainLayout>
  );
}