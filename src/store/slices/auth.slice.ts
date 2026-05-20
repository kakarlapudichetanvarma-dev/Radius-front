import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser, AuthResponse } from '../../types/auth.types';
import { storage } from '../../utils/storage.utils';
import { authService } from '../../services/auth.service';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  updatingProfile: boolean;
  updateError: string | null;
}

// ✅ Strip base64 profile pictures before saving to localStorage
// Base64 strings are huge and blow past HTTP header size limits (431 error)
const sanitizeUserForStorage = (user: AuthUser): AuthUser => {
  if (!user) return user;
  const sanitized = { ...user };
  // If profilePicture is a base64 data URL, don't save it to localStorage
  if (
    sanitized.profilePicture &&
    sanitized.profilePicture.startsWith('data:')
  ) {
    // Remove it — the server should return a URL, not base64
    // If your backend returns base64, fix the backend to return a URL instead
    sanitized.profilePicture = null;
  }
  return sanitized;
};

const savedAuth = storage.getAuth();

const initialState: AuthState = {
  user: savedAuth?.user || null,
  accessToken: savedAuth?.token || null,
  isAuthenticated: !!savedAuth?.token,
  updatingProfile: false,
  updateError: null
};

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await authService.updateProfile(formData);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<AuthResponse>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.token;
      state.isAuthenticated = true;
      // ✅ Sanitize before saving — strip base64 profile pictures
      storage.saveAuth({
        token: action.payload.token,
        user: sanitizeUserForStorage(action.payload.user)
      });
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      storage.clearAuth();
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.pending, (state) => {
        state.updatingProfile = true;
        state.updateError = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updatingProfile = false;
        state.user = action.payload;
        // ✅ Sanitize before saving — strip base64 profile pictures
        const token = state.accessToken;
        if (token) {
          storage.saveAuth({
            token,
            user: sanitizeUserForStorage(action.payload)
          });
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updatingProfile = false;
        state.updateError = action.payload as string;
      });
  }
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;