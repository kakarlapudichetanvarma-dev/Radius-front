import { useState } from 'react';
import { authService } from '../services/auth.service';

export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.forgotPassword({ email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return { forgotPassword, loading, error, success };
};