import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import type { RootState } from '../store';

interface Props {
  children: React.ReactNode;
}

const GuestGuard = ({ children }: Props) => {
  const { isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // If already logged in → redirect to chat
  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return <>{children}</>;
};

export default GuestGuard;