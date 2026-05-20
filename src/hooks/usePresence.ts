import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { connectPresence, disconnectPresence } from '../socket/presence.events';

export const usePresence = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) return;
    connectPresence();
    return () => {
      disconnectPresence();
    };
  }, [isAuthenticated]);
};