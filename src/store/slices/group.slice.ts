import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatService } from '../../services/chat.service';

import type {
  CreateGroupRequest,
} from '../../types/chat.types';

// ✅ Added
export interface UpdateGroupRequest {
  name?: string;
  profilePicture?: string;
}

interface GroupState {
  loading: boolean;
  error: string | null;
}

const initialState: GroupState = {
  loading: false,
  error: null
};

// ─────────────────────────────────────────────────────────────────────────────
// Create Group
// ─────────────────────────────────────────────────────────────────────────────

export const createGroup = createAsyncThunk(
  'group/createGroup',
  async (
    data: CreateGroupRequest,
    { rejectWithValue }
  ) => {
    try {

      const res =
        await chatService.createGroup(data);

      return res.data.data;

    } catch (err: any) {

      return rejectWithValue(
        err.response?.data?.message ||
        'Failed to create group'
      );
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Update Group Info
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Update Group Info
// ─────────────────────────────────────────────────────────────────────────────

export const updateGroupInfo = createAsyncThunk(
  'group/updateGroupInfo',
  async (
    {
      groupId,
      data,
    }: {
      groupId: string;
      data: UpdateGroupRequest;
    },
    { rejectWithValue }
  ) => {
    try {

      const res =
        await chatService.updateGroup(   // ✅ was updateGroupInfo
          groupId,
          data
        );

      return res.data.data;

    } catch (err: any) {

      return rejectWithValue(
        err.response?.data?.message ||
        'Failed to update group'
      );
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────

const groupSlice = createSlice({
  name: 'group',

  initialState,

  reducers: {},

  extraReducers: (builder) => {

    builder

      // Create Group
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
      })

      // Update Group
      .addCase(updateGroupInfo.pending, (state) => {

        state.loading = true;

        state.error = null;
      })

      .addCase(updateGroupInfo.fulfilled, (state) => {

        state.loading = false;
      })

      .addCase(updateGroupInfo.rejected, (state, action) => {

        state.loading = false;

        state.error = action.payload as string;
      });
  }
});

export default groupSlice.reducer;