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

import { socketClient } from '../socket/socket.client';

export default function ChatPage() {
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector(
    (state: RootState) => state.auth
  );

  // ─────────────────────────────────────────────
  // Initial Load
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!user?.username) return;

    // ✅ FIXED
    dispatch(fetchChats(user.username));

    dispatch(fetchFriends());
    dispatch(fetchPendingRequests());

    const pollInterval = setInterval(() => {
      dispatch(fetchPendingRequests());

      // ✅ FIXED
      dispatch(fetchChats(user.username));
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [dispatch, user]);

  // ─────────────────────────────────────────────
  // Socket Connection
  // ─────────────────────────────────────────────
  useEffect(() => {
    socketClient.onConnect = () => {
      console.log('Socket connected');

      // Typing
      socketClient.subscribe('/topic/typing', msg => {
        dispatch(setTyping(msg.body));

        setTimeout(() => {
          dispatch(setTyping(null));
        }, 3000);
      });

      // Presence
      socketClient.subscribe('/topic/presence', msg => {
        try {
          dispatch(updateOnlineUsers(JSON.parse(msg.body)));
        } catch (err) {
          console.error(err);
        }
      });
    };

    socketClient.onStompError = frame => {
      console.error('STOMP error:', frame);
    };

    if (!socketClient.active) {
      socketClient.activate();
    }

    return () => {
      if (socketClient.active) {
        socketClient.deactivate();
      }
    };
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