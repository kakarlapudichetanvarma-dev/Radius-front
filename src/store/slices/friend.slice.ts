import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { FriendSummary, FriendRequest } from '../../types/friend.types';
import { friendService } from '../../services/friend.service';
import { fetchChats } from './chat.slice';

interface FriendState {
  friends: FriendSummary[];
  pendingRequests: FriendRequest[];
  loading: boolean;
  error: string | null;
}

const initialState: FriendState = {
  friends: [],
  pendingRequests: [],
  loading: false,
  error: null
};

export const fetchFriends = createAsyncThunk(
  'friend/fetchFriends',
  async (_, { rejectWithValue }) => {
    try {
      const res = await friendService.getFriends();
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load friends');
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
      return rejectWithValue(err.response?.data?.message || 'Failed to load requests');
    }
  }
);

export const sendFriendRequest = createAsyncThunk(
  'friend/sendRequest',
  async (phoneNumber: string, { rejectWithValue }) => {
    try {
      const res = await friendService.sendFriendRequest({ phoneNumber });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send request');
    }
  }
);

export const respondToFriendRequest = createAsyncThunk(
  'friend/respondToRequest',
  async (
    payload: { requestId: string; action: 'ACCEPT' | 'REJECT' },
    { rejectWithValue }
  ) => {
    try {
      const res = await friendService.respondToRequest(payload);
      return { requestId: payload.requestId, action: payload.action, data: res.data.data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to respond to request');
    }
  }
);

const friendSlice = createSlice({
  name: 'friend',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriends.pending, (state) => { state.loading = true; })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.loading = false;
        state.friends = action.payload;
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPendingRequests.fulfilled, (state, action) => {
        state.pendingRequests = action.payload;
      })
      .addCase(respondToFriendRequest.fulfilled, (state, action) => {
        state.pendingRequests = state.pendingRequests.filter(
          r => r.requestId !== action.payload.requestId
        );
      });
  }
});

export default friendSlice.reducer;