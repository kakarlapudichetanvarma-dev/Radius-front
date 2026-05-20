import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router.tsx';
import { cleanupBase64FromStorage } from './clearBadStorage.ts';
import { ensureSocketConnected, socketClient } from './socket/socket.client';
import { subscribeToPresence } from './socket/message.events';
import { store } from './store';

cleanupBase64FromStorage();

function App() {
  useEffect(() => {
    ensureSocketConnected();

    // Subscribe to presence once socket is connected
    const prevOnConnect = socketClient.onConnect;
    socketClient.onConnect = (frame) => {
      prevOnConnect?.(frame);
      subscribeToPresence(store.getState().auth.user?.id || '');
    };

    // If already connected, subscribe immediately
    if (socketClient.connected) {
      subscribeToPresence(store.getState().auth.user?.id || '');
    }
  }, []);

  return <RouterProvider router={router} />;
}

export default App;