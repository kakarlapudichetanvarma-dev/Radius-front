import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CommunityRole } from '../../types/community.types';

interface CommunityState {
  activeCommunityId: string | null;
  currentUserRole: CommunityRole | null;
  // chatId -> unread count for community group chats
  communityGroupUnread: Record<string, number>;
  // communityId -> total unread count (sum of all its groups)
  communityUnread: Record<string, number>;
  // chatId -> communityId (so we know which community a chatId belongs to)
  chatIdToCommunityId: Record<string, string>;
}

const initialState: CommunityState = {
  activeCommunityId: null,
  currentUserRole: null,
  communityGroupUnread: {},
  communityUnread: {},
  chatIdToCommunityId: {},
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
    },

    // Called when groups for a community are loaded — registers chatId->communityId mappings
    registerCommunityGroups: (
      state,
      action: PayloadAction<{ communityId: string; groups: Array<{ chatId: string }> }>
    ) => {
      const { communityId, groups } = action.payload;
      groups.forEach(g => {
        state.chatIdToCommunityId[g.chatId] = communityId;
      });
    },

    // Increments unread for a specific group chatId and its parent community
    incrementCommunityGroupUnread: (state, action: PayloadAction<string>) => {
      const chatId = action.payload;
      state.communityGroupUnread[chatId] = (state.communityGroupUnread[chatId] || 0) + 1;

      // Also increment parent community unread if we know which community this belongs to
      const communityId = state.chatIdToCommunityId[chatId];
      if (communityId) {
        state.communityUnread[communityId] = (state.communityUnread[communityId] || 0) + 1;
      }
    },

    // Called when a group chat is opened — clears that group's unread and adjusts community total
    clearCommunityGroupUnread: (state, action: PayloadAction<string>) => {
      const chatId = action.payload;
      const groupCount = state.communityGroupUnread[chatId] || 0;

      // Reduce parent community unread by this group's count
      const communityId = state.chatIdToCommunityId[chatId];
      if (communityId && groupCount > 0) {
        state.communityUnread[communityId] = Math.max(
          0,
          (state.communityUnread[communityId] || 0) - groupCount
        );
        if (state.communityUnread[communityId] === 0) {
          delete state.communityUnread[communityId];
        }
      }

      delete state.communityGroupUnread[chatId];
    },

    clearAllCommunityUnread: state => {
      state.communityGroupUnread = {};
      state.communityUnread = {};
    },
  },
});

export const {
  setActiveCommunity,
  setCurrentUserRole,
  clearActiveCommunity,
  registerCommunityGroups,
  incrementCommunityGroupUnread,
  clearCommunityGroupUnread,
  clearAllCommunityUnread,
} = communitySlice.actions;

export default communitySlice.reducer;