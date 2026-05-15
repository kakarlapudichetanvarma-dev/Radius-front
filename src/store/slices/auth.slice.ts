import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser, AuthResponse } from '../../types/auth.types';
import { storage } from '../../utils/storage.utils';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

// Load from storage on startup
const savedAuth = storage.getAuth();

const initialState: AuthState = {
  user: savedAuth?.user || null,
  accessToken: savedAuth?.token || null,
  isAuthenticated: !!savedAuth?.token
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<AuthResponse>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.token;
      state.isAuthenticated = true;

      // Save to storage
      storage.saveAuth({
        token: action.payload.token,
        user: action.payload.user
      });
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;

      // Clear storage
      storage.clearAuth();
    }
  }
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;