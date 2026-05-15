import axios from 'axios';
import { storage } from '../utils/storage.utils';

export const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach token to every request
api.interceptors.request.use(config => {
  const auth = storage.getAuth();
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      storage.clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);