import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { FriendSummary, UserSearchResult } from '../../types/friend.types';
import { friendService } from '../../services/friend.service';

interface FriendState {
  friends: FriendSummary[];
  loading: boolean;
  error: string | null;
  phoneSearchResult: UserSearchResult | null;
  phoneSearchLoading: boolean;
  phoneSearchError: string | null;
}

const initialState: FriendState = {
  friends: [],
  loading: false,
  error: null,
  phoneSearchResult: null,
  phoneSearchLoading: false,
  phoneSearchError: null,
};

// ── Fetch friends ─────────────────────────────────────────────────────────────

export const fetchFriends = createAsyncThunk(
  'friend/fetchFriends',
  async (_, { rejectWithValue }) => {
    try {
      const res = await friendService.getFriends();
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load friends'
      );
    }
  }
);

// ── Search by phone ───────────────────────────────────────────────────────────

export const searchByPhone = createAsyncThunk(
  'friend/searchByPhone',
  async (phone: string, { rejectWithValue }) => {
    try {
      const res = await friendService.searchByPhone(phone);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'No user found with that number'
      );
    }
  }
);

// ── Add friend directly ───────────────────────────────────────────────────────

export const addFriendDirectly = createAsyncThunk(
  'friend/addFriendDirectly',
  async (phoneNumber: string, { rejectWithValue }) => {
    try {
      const res = await friendService.addDirectFriend(phoneNumber);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to add friend'
      );
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const friendSlice = createSlice({
  name: 'friend',
  initialState,

  reducers: {
    updateFriendAvatar: (
      state,
      action: PayloadAction<{ userId: string; profilePicture: string | null }>
    ) => {
      const friend = state.friends.find(f => f.userId === action.payload.userId);
      if (friend) {
        friend.profilePicture = action.payload.profilePicture;
      }
    },

    clearPhoneSearch(state) {
      state.phoneSearchResult  = null;
      state.phoneSearchError   = null;
      state.phoneSearchLoading = false;
    },
  },

  extraReducers: (builder) => {
    builder
      // fetchFriends
      .addCase(fetchFriends.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.loading = false;
        state.friends = action.payload;
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })

      // searchByPhone
      .addCase(searchByPhone.pending, (state) => {
        state.phoneSearchLoading = true;
        state.phoneSearchError   = null;
        state.phoneSearchResult  = null;
      })
      .addCase(searchByPhone.fulfilled, (state, action) => {
        state.phoneSearchLoading = false;
        state.phoneSearchResult  = action.payload;
      })
      .addCase(searchByPhone.rejected, (state, action) => {
        state.phoneSearchLoading = false;
        state.phoneSearchError   = action.payload as string;
        state.phoneSearchResult  = null;
      })

      // addFriendDirectly — re-fetch friends after adding
      .addCase(addFriendDirectly.fulfilled, (state, action) => {
        if (action.payload) {
          // Optimistically push the new friend so the list updates instantly
          const already = state.friends.some(
            f => f.userId === action.payload.userId
          );
          if (!already) {
            state.friends.push({
              userId:         action.payload.userId,
              username:       action.payload.username,
              phoneNumber:    action.payload.phoneNumber,
              profilePicture: action.payload.profilePicture ?? null,
              online:         false,
              lastSeen:       null,
            });
          }
        }
      });
  },
});

export const { updateFriendAvatar, clearPhoneSearch } = friendSlice.actions;

export default friendSlice.reducer;