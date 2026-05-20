import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatService } from '../../services/chat.service';
import type { CreateGroupRequest } from '../../types/chat.types';

interface GroupState {
  loading: boolean;
  error: string | null;
}

const initialState: GroupState = {
  loading: false,
  error: null
};

export const createGroup = createAsyncThunk(
  'group/createGroup',
  async (data: CreateGroupRequest, { rejectWithValue }) => {
    try {
      const res = await chatService.createGroup(data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create group');
    }
  }
);

const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export default groupSlice.reducer;