export interface RegisterRequest {
  username: string;
  email: string;
  phoneNumber?: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OtpRequest {
  email: string;
  otp: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  profilePicture?: string;
  active: boolean;
  createdAt: string;
}

// Matches your backend AuthTokenResponse
export interface AuthResponse {
  token: string;          // ← backend returns "token" not "accessToken"
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}