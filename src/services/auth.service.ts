import { api } from '../config/axios.config';
import type {
  RegisterRequest,
  LoginRequest,
  OtpRequest,
  ApiResponse,
  AuthResponse,
  AuthUser
} from '../types/auth.types';

export const authService = {

  register: (data: RegisterRequest) =>
    api.post<ApiResponse<AuthUser>>(
      '/api/v1/auth/register',
      data
    ),

  login: (data: LoginRequest) =>
    api.post<ApiResponse<null>>(
      '/api/v1/auth/login',
      data
    ),

  verifyOtp: (data: OtpRequest) =>
    api.post<ApiResponse<AuthResponse>>(
      '/api/v1/auth/verify-otp',
      data
    ),

  getProfile: () =>
    api.get<ApiResponse<AuthUser>>(
      '/api/v1/auth/profile'
    ),

  updateProfile: (formData: FormData) =>
    api.put<ApiResponse<AuthUser>>(
      '/api/v1/auth/profile',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    ),

  getUserByUsername: (username: string) =>
    api.get<ApiResponse<AuthUser>>(
      `/api/v1/auth/users/username/${username}`
    ),

  getUserById: (userId: string) =>
    api.get<ApiResponse<AuthUser>>(
      `/api/v1/auth/users/${userId}`
    ),

  getUserByPhone: (phoneNumber: string) =>
    api.get<ApiResponse<AuthUser>>(
      `/api/v1/auth/users/phone/${phoneNumber}`
    )
};