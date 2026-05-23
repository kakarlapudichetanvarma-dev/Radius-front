import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { chatService } from '../../services/chat.service';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WallpaperState {
  wallpaperType: string;
  wallpaperData?: string;
  wallpaperColor?: string;
  updatedAt?: string;
}

export interface WallpaperPayload {
  wallpaperType: string;
  wallpaperData?: string;
  wallpaperColor?: string;
}

export interface UiState {
  wallpapers: Record<string, WallpaperState>; // keyed by chatId
  wallpaperLoading: boolean;
  wallpaperError: string | null;
  isSidebarOpen: boolean;
  activeModal: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: UiState = {
  wallpapers: {},
  wallpaperLoading: false,
  wallpaperError: null,
  isSidebarOpen: true,
  activeModal: null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

// Your chatService methods return Axios responses: { data: { success, message, data: T } }
// So we unwrap with .data.data to get the actual payload.

export const fetchWallpaper = createAsyncThunk(
  'ui/fetchWallpaper',
  async (chatId: string, { rejectWithValue }) => {
    try {
      const res = await chatService.getWallpaper(chatId);
      return { chatId, wallpaper: res.data.data as WallpaperState };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch wallpaper');
    }
  }
);

export const setWallpaper = createAsyncThunk(
  'ui/setWallpaper',
  async (
    { chatId, payload }: { chatId: string; payload: WallpaperPayload },
    { rejectWithValue }
  ) => {
    try {
      const res = await chatService.setWallpaper(chatId, payload);
      return { chatId, wallpaper: res.data.data as WallpaperState };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to set wallpaper');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    openModal(state, action: PayloadAction<string>) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    },
    // Optimistic local clear — resets to DEFAULT before the backend call resolves
    clearWallpaper(state, action: PayloadAction<string>) {
      const chatId = action.payload;
      if (state.wallpapers[chatId]) {
        state.wallpapers[chatId] = { wallpaperType: 'DEFAULT' };
      }
    },
  },
  extraReducers: (builder) => {
    // ── fetchWallpaper ────────────────────────────────────────────────────────
    builder
      .addCase(fetchWallpaper.pending, (state) => {
        state.wallpaperLoading = true;
        state.wallpaperError = null;
      })
      .addCase(fetchWallpaper.fulfilled, (state, action) => {
        state.wallpaperLoading = false;
        const { chatId, wallpaper } = action.payload;
        state.wallpapers[chatId] = wallpaper;
      })
      .addCase(fetchWallpaper.rejected, (state, action) => {
        state.wallpaperLoading = false;
        state.wallpaperError = action.payload as string;
      });

    // ── setWallpaper ──────────────────────────────────────────────────────────
    builder
      .addCase(setWallpaper.pending, (state) => {
        state.wallpaperLoading = true;
        state.wallpaperError = null;
      })
      .addCase(setWallpaper.fulfilled, (state, action) => {
        state.wallpaperLoading = false;
        const { chatId, wallpaper } = action.payload;
        state.wallpapers[chatId] = wallpaper;
      })
      .addCase(setWallpaper.rejected, (state, action) => {
        state.wallpaperLoading = false;
        state.wallpaperError = action.payload as string;
      });
  },
});

export const { toggleSidebar, openModal, closeModal, clearWallpaper } = uiSlice.actions;
export default uiSlice.reducer;