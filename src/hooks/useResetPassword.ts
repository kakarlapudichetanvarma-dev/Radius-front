import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const resetPassword = async (data: {
    email: string;
    otp: string;
    newPassword: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword(data);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword, loading, error };
};