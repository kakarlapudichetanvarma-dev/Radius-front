import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { setAuth } from '../store/slices/auth.slice';
import type { AppDispatch } from '../store';
import type { OtpRequest } from '../types/auth.types';

export const useOtp = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyOtp = async (data: OtpRequest) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.verifyOtp(data);

      if (response.data.success) {
        // Save token and user to Redux + localStorage
        dispatch(setAuth(response.data.data));

        // Clean up pending email
        localStorage.removeItem('pendingEmail');

        // Go to chat page
        navigate('/chat');
      }

      return response.data;

    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Invalid OTP. Try again.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get email saved during login step
  const pendingEmail =
    localStorage.getItem('pendingEmail') || '';

  return {
    verifyOtp,
    pendingEmail,
    loading,
    error
  };
};