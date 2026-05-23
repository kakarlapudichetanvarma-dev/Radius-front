import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import {
  fetchWallpaper,
  setWallpaper,
  clearWallpaper,
} from '../store/slices/ui.slice';

export type WallpaperType = 'DEFAULT' | 'COLOR' | 'GRADIENT' | 'IMAGE' | 'PATTERN';

export interface WallpaperPayload {
  wallpaperType: WallpaperType;
  wallpaperData?: string;  // image URL or pattern name
  wallpaperColor?: string; // hex color or gradient string
}

export function useWallpaper(chatId: string | null) {
  const dispatch = useDispatch<AppDispatch>();

  const wallpaper = useSelector((state: RootState) =>
    chatId ? state.ui.wallpapers[chatId] : undefined
  );
  const loading = useSelector((state: RootState) => state.ui.wallpaperLoading);

  // Auto-fetch when chatId changes
  useEffect(() => {
    if (!chatId || chatId.startsWith('temp-')) return;
    if (wallpaper) return; // already loaded
    dispatch(fetchWallpaper(chatId));
  }, [chatId, dispatch]);

  const updateWallpaper = useCallback(
    (payload: WallpaperPayload) => {
      if (!chatId) return;
      dispatch(setWallpaper({ chatId, payload }));
    },
    [chatId, dispatch]
  );

  const resetWallpaper = useCallback(() => {
    if (!chatId) return;
    dispatch(clearWallpaper(chatId));
    dispatch(
      setWallpaper({
        chatId,
        payload: { wallpaperType: 'DEFAULT' },
      })
    );
  }, [chatId, dispatch]);

  return { wallpaper, loading, updateWallpaper, resetWallpaper };
}