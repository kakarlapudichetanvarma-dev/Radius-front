import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router.tsx';
import { cleanupBase64FromStorage } from './clearBadStorage.ts';
import { ensureSocketConnected } from './socket/socket.client';
import { requestNotificationPermission } from './utils/notifications.utils';

cleanupBase64FromStorage();

function App() {
  useEffect(() => {
    ensureSocketConnected(); 
    requestNotificationPermission();// ✅ just open the socket
    // presence is handled by usePresence() in MainLayout after auth
  }, []);

  return <RouterProvider router={router} />;
}

export default App;