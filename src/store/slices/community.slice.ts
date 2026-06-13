import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CommunityRole } from '../../types/community.types';

interface CommunityState {
  activeCommunityId: string | null;
  currentUserRole: CommunityRole | null;
}

const initialState: CommunityState = {
  activeCommunityId: null,
  currentUserRole: null
};

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    setActiveCommunity: (state, action: PayloadAction<string | null>) => {
      state.activeCommunityId = action.payload;
      state.currentUserRole = null;
    },
    setCurrentUserRole: (state, action: PayloadAction<CommunityRole | null>) => {
      state.currentUserRole = action.payload;
    },
    clearActiveCommunity: state => {
      state.activeCommunityId = null;
      state.currentUserRole = null;
    }
  }
});

export const {
  setActiveCommunity,
  setCurrentUserRole,
  clearActiveCommunity
} = communitySlice.actions;

export default communitySlice.reducer;