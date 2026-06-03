import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { connectPresence, disconnectPresence } from '../socket/presence.events';
import { startHeartbeat, stopHeartbeat } from '../presence/heartbeat';

export const usePresence = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    connectPresence();
    startHeartbeat();

    return () => {
      disconnectPresence();
      stopHeartbeat();
    };
  }, [isAuthenticated]);
};