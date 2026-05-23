import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useWallpaper } from '../../hooks/useWallpaper';
import WallpaperPicker from '../chat/WallpaperPicker';

interface Props {
  onClose: () => void;
}

export default function WallpaperSettings({ onClose }: Props) {
  const selectedChatId = useSelector(
    (state: RootState) => state.chat.selectedChatId
  );

  const { wallpaper, loading, updateWallpaper, resetWallpaper } =
    useWallpaper(selectedChatId);

  if (!selectedChatId) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-1"
          >
            ←
          </button>
          <span className="text-sm font-semibold text-white">
            Chat Wallpaper
          </span>
        </div>
        {loading && (
          <span className="text-xs text-yellow-400 animate-pulse">Saving…</span>
        )}
      </div>

      {/* Picker */}
      <div className="flex-1 overflow-hidden">
        <WallpaperPicker
          onSelect={(payload) => updateWallpaper(payload)}
          onReset={resetWallpaper}
          currentWallpaper={wallpaper}
          loading={loading}
        />
      </div>
    </div>
  );
}