/**
 * profile.slice.ts
 *
 * Manages the *viewed* profile state (e.g. when you open someone else's
 * profile modal). The logged-in user's own profile lives in auth.slice.
 */
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/user.types';

interface ProfileState {
  viewedUser: User | null;
  isOpen: boolean;
}

const initialState: ProfileState = {
  viewedUser: null,
  isOpen: false,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    openProfile: (state, action: PayloadAction<User>) => {
      state.viewedUser = action.payload;
      state.isOpen = true;
    },
    closeProfile: (state) => {
      state.isOpen = false;
      state.viewedUser = null;
    },
    /** Called by the avatar-update socket listener to keep the modal fresh */
    updateViewedUserAvatar: (
      state,
      action: PayloadAction<{ userId: string; profilePicture: string | null }>
    ) => {
      if (state.viewedUser?.id === action.payload.userId) {
        state.viewedUser.profilePicture = action.payload.profilePicture;
      }
    },
  },
});

export const { openProfile, closeProfile, updateViewedUserAvatar } =
  profileSlice.actions;
export default profileSlice.reducer;