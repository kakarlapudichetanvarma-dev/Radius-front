import { createBrowserRouter } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtpPage from './pages/OtpPage';
import ChatPage from './pages/ChatPage';
import AuthGuard from './security/auth.guard';
import GuestGuard from './router/GuestGuard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />
  },
  {
    path: '/login',
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    )
  },
  {
    path: '/register',
    element: (
      <GuestGuard>
        <RegisterPage />
      </GuestGuard>
    )
  },
  {
    path: '/otp',
    element: (
      <GuestGuard>
        <OtpPage />
      </GuestGuard>
    )
  },
  {
    path: '/chat',
    element: (
      <AuthGuard>
        <ChatPage />
      </AuthGuard>
    )
  }
]);