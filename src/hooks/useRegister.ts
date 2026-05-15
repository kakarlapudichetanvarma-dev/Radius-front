import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import type { RegisterRequest } from '../types/auth.types';

export const useRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (data: RegisterRequest) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.register(data);

      if (response.data.success) {
        // Registration successful → go to login
        navigate('/login');
      }

      return response.data;

    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Registration failed. Try again.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    loading,
    error
  };
};