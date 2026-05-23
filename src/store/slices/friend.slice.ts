import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type {
  FriendSummary,
  FriendRequest,
  UserSearchResult,
} from '../../types/friend.types';

import { friendService } from '../../services/friend.service';

interface FriendState {
  friends: FriendSummary[];
  pendingRequests: FriendRequest[];
  loading: boolean;
  error: string | null;

  // phone search
  phoneSearchResult: UserSearchResult | null;
  phoneSearchLoading: boolean;
  phoneSearchError: string | null;
}

const initialState: FriendState = {
  friends: [],
  pendingRequests: [],
  loading: false,
  error: null,

  phoneSearchResult: null,
  phoneSearchLoading: false,
  phoneSearchError: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// Existing thunks
// ─────────────────────────────────────────────────────────────────────────────

export const fetchFriends = createAsyncThunk(
  'friend/fetchFriends',
  async (_, { rejectWithValue }) => {
    try {

      const res = await friendService.getFriends();

      return res.data.data;

    } catch (err: any) {

      return rejectWithValue(
        err.response?.data?.message ||
        'Failed to load friends'
      );
    }
  }
);

export const fetchPendingRequests = createAsyncThunk(
  'friend/fetchPendingRequests',
  async (_, { rejectWithValue }) => {
    try {

      const res = await friendService.getPendingRequests();

      return res.data.data;

    } catch (err: any) {

      return rejectWithValue(
        err.response?.data?.message ||
        'Failed to load requests'
      );
    }
  }
);

export const sendFriendRequest = createAsyncThunk(
  'friend/sendRequest',
  async (phoneNumber: string, { rejectWithValue }) => {
    try {

      const res =
        await friendService.sendFriendRequest({
          phoneNumber,
        });

      return res.data.data;

    } catch (err: any) {

      return rejectWithValue(
        err.response?.data?.message ||
        'Failed to send request'
      );
    }
  }
);

export const respondToFriendRequest = createAsyncThunk(
  'friend/respondToRequest',
  async (
    payload: {
      requestId: string;
      action: 'ACCEPT' | 'REJECT';
    },
    { rejectWithValue }
  ) => {
    try {

      const res =
        await friendService.respondToRequest(payload);

      return {
        requestId: payload.requestId,
        action: payload.action,
        data: res.data.data,
      };

    } catch (err: any) {

      return rejectWithValue(
        err.response?.data?.message ||
        'Failed to respond to request'
      );
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Search user by phone
// ─────────────────────────────────────────────────────────────────────────────

export const searchByPhone = createAsyncThunk(
  'friend/searchByPhone',
  async (phone: string, { rejectWithValue }) => {
    try {

      const res =
        await friendService.searchByPhone(phone);

      return res.data.data;

    } catch (err: any) {

      return rejectWithValue(
        err.response?.data?.message ||
        'No user found with that number'
      );
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Add friend directly
// ─────────────────────────────────────────────────────────────────────────────

export const addFriendDirectly = createAsyncThunk(
  'friend/addFriendDirectly',
  async (phoneNumber: string, { rejectWithValue }) => {
    try {

      const res =
        await friendService.addDirectFriend(
          phoneNumber
        );

      return res.data.data;

    } catch (err: any) {

      return rejectWithValue(
        err.response?.data?.message ||
        'Failed to add friend'
      );
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────

const friendSlice = createSlice({
  name: 'friend',

  initialState,

  reducers: {

    updateFriendAvatar: (
      state,
      action: PayloadAction<{
        userId: string;
        profilePicture: string | null;
      }>
    ) => {

      const friend = state.friends.find(
        f => f.userId === action.payload.userId
      );

      if (friend) {
        friend.profilePicture =
          action.payload.profilePicture;
      }
    },

    clearPhoneSearch(state) {

      state.phoneSearchResult = null;

      state.phoneSearchError = null;

      state.phoneSearchLoading = false;
    },
  },

  extraReducers: (builder) => {

    builder

      // fetchFriends
      .addCase(fetchFriends.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchFriends.fulfilled, (state, action) => {

        state.loading = false;

        state.friends = action.payload;
      })

      .addCase(fetchFriends.rejected, (state, action) => {

        state.loading = false;

        state.error = action.payload as string;
      })

      // fetchPendingRequests
      .addCase(fetchPendingRequests.fulfilled, (state, action) => {

        state.pendingRequests = action.payload;
      })

      // respondToFriendRequest
      .addCase(respondToFriendRequest.fulfilled, (state, action) => {

        state.pendingRequests =
          state.pendingRequests.filter(
            r => r.requestId !== action.payload.requestId
          );
      })

      // searchByPhone
      .addCase(searchByPhone.pending, (state) => {

        state.phoneSearchLoading = true;

        state.phoneSearchError = null;

        state.phoneSearchResult = null;
      })

      .addCase(searchByPhone.fulfilled, (state, action) => {

        state.phoneSearchLoading = false;

        state.phoneSearchResult = action.payload;
      })

      .addCase(searchByPhone.rejected, (state, action) => {

        state.phoneSearchLoading = false;

        state.phoneSearchError =
          action.payload as string;

        state.phoneSearchResult = null;
      })

      // addFriendDirectly
      .addCase(addFriendDirectly.fulfilled, () => {

        // friends are refreshed separately
      });
  },
});

export const {
  updateFriendAvatar,
  clearPhoneSearch,
} = friendSlice.actions;

export default friendSlice.reducer;