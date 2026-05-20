import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { ensureSocketConnected } from '../socket/socket.client';
import { initMessageEvents } from '../socket/message.events';
import { connectPresence } from '../socket/presence.events';
import {
  receiveMessage,
  updateMessageStatus
} from '../store/slices/chat.slice';
import { store } from '../store';

let initialized = false;

export const useSocket = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!isAuthenticated || initialized) return;
    initialized = true;

    // ✅ Wire up message event handlers with the store
    initMessageEvents(store, receiveMessage, updateMessageStatus);

    // ✅ Start presence subscription (waits for connection internally)
    connectPresence();

    // ✅ Activate socket connection once
    ensureSocketConnected();

    return () => {
      initialized = false;
    };
  }, [isAuthenticated]);
};