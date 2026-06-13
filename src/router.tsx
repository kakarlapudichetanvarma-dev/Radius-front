import { createBrowserRouter } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtpPage from './pages/OtpPage';
import ChatPage from './pages/ChatPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import CommunityPage from './pages/CommunityPage';
import CommunityDetailsPage from './pages/CommunityDetailsPage';

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
    path: '/forgot-password',
    element: (
      <GuestGuard>
        <ForgotPasswordPage />
      </GuestGuard>
    )
  },
  {
    path: '/reset-password',
    element: (
      <GuestGuard>
        <ResetPasswordPage />
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
  },

  /*
   * Communities
   */

  {
    path: '/communities',
    element: (
      <AuthGuard>
        <CommunityPage />
      </AuthGuard>
    )
  },

  {
    path: '/communities/:communityId',
    element: (
      <AuthGuard>
        <CommunityDetailsPage />
      </AuthGuard>
    )
  }
]);