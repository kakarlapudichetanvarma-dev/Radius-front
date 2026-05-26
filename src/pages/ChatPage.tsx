import { useEffect, useState, useRef, useCallback } from 'react';
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
      if (!isNaN(parsed) && parsed >= SIDEBAR_MIN && parsed <= SIDEBAR_MAX) {
        return parsed;
      }
    }
  } catch {}
  return SIDEBAR_DEFAULT;
}

export default function ChatPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [pendingUpload, setPendingUpload] = useState<PreparedUpload | null>(null);

  // ── Resizable sidebar — initialised from localStorage ─────────────────────
  const [sidebarWidth, setSidebarWidth] = useState(getInitialSidebarWidth);
  const isDraggingDivider = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSetPendingUpload = (upload: PreparedUpload | null) => {
    if (pendingUpload?.previewUrl) revokePreview(pendingUpload.previewUrl);
    setPendingUpload(upload);
  };

  // ── Divider drag handlers ─────────────────────────────────────────────────
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

  // ── Persist sidebar width to localStorage whenever it changes ─────────────
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarWidth));
    } catch {}
  }, [sidebarWidth]);

  // ── Data fetching ─────────────────────────────────────────────────────────
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

      <div ref={containerRef} className="flex h-full overflow-hidden">

        {/* Sidebar — fixed pixel width from localStorage */}
        <div
          className="flex-shrink-0 h-full overflow-hidden"
          style={{ width: sidebarWidth }}
        >
          <Sidebar />
        </div>

        {/* Draggable divider */}
        <div
          onMouseDown={onDividerMouseDown}
          className="flex-shrink-0 w-1 h-full cursor-col-resize bg-yellow-500/20 hover:bg-yellow-500/60 active:bg-yellow-500 transition-colors duration-150 relative group"
          title="Drag to resize"
        >
          <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-yellow-500/10" />
        </div>

        {/* Chat panel — remaining space */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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