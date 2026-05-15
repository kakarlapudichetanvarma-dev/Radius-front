import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import type { LoginRequest } from '../types/auth.types';

export const useLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: LoginRequest) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.login(data);

      if (response.data.success) {
        // OTP sent to email → go to OTP page
        // Save email so OTP page knows which email to verify
        localStorage.setItem('pendingEmail', data.email);
        navigate('/otp');
      }

      return response.data;

    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Login failed. Try again.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
    error
  };
};