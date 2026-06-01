import { useEffect, useRef, useCallback } from 'react';
import { useState } from 'react';
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

const SIDEBAR_MIN = 220;
const SIDEBAR_MAX = 600;
const SIDEBAR_DEFAULT = 380;
const SIDEBAR_STORAGE_KEY = 'chat_sidebar_width';

function getInitialSidebarWidth(): number {
  try {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= SIDEBAR_MIN && parsed <= SIDEBAR_MAX) return parsed;
    }
  } catch {}
  return SIDEBAR_DEFAULT;
}

export default function ChatPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [pendingUpload, setPendingUpload] = useState<PreparedUpload | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(getInitialSidebarWidth);
  const isDraggingDivider = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSetPendingUpload = (upload: PreparedUpload | null) => {
    if (pendingUpload?.previewUrl) revokePreview(pendingUpload.previewUrl);
    setPendingUpload(upload);
  };

  const onDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingDivider.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingDivider.current || !containerRef.current) return;
      const containerLeft = containerRef.current.getBoundingClientRect().left;
      const newWidth = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, e.clientX - containerLeft));
      setSidebarWidth(newWidth);
    };
    const onMouseUp = () => {
      if (!isDraggingDivider.current) return;
      isDraggingDivider.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  useEffect(() => {
    try { localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarWidth)); } catch {}
  }, [sidebarWidth]);

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

      <div ref={containerRef} className="flex h-full overflow-hidden bg-[#050505]">

        {/* Sidebar */}
        <div
          className="flex-shrink-0 h-full overflow-hidden border-r border-yellow-400/8"
          style={{ width: sidebarWidth }}
        >
          <Sidebar />
        </div>

        {/* Draggable divider */}
        <div
          onMouseDown={onDividerMouseDown}
          className="flex-shrink-0 w-[3px] h-full cursor-col-resize relative group transition-colors duration-150"
          style={{ background: 'rgba(250,204,21,0.08)' }}
          title="Drag to resize"
        >
          {/* hover glow strip */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: 'rgba(250,204,21,0.35)', boxShadow: '0 0 8px rgba(250,204,21,0.4)' }} />
          {/* drag handle dots */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {[0,1,2].map(i => (
              <div key={i} className="w-1 h-1 rounded-full bg-yellow-400/70" />
            ))}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#060606]">
          <ChatHeader />

          <div className="flex-1 min-h-0 overflow-hidden">
            <ChatWindow onFilePrepared={handleSetPendingUpload} />
          </div>

          <MessageInput
            pendingUpload={pendingUpload}
            setPendingUpload={handleSetPendingUpload}
          />
        </div>
      </div>
    </MainLayout>
  );
}