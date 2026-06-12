import { useState } from 'react';
import type { WallpaperPayload } from '../../hooks/useWallpaper';

const SOLID_COLORS = [
  { label: 'Lavender',  value: '#ede9fe' },
  { label: 'Soft Blue', value: '#eff6ff' },
  { label: 'Mint',      value: '#ecfdf5' },
  { label: 'Blush',     value: '#fdf2f8' },
  { label: 'Peach',     value: '#fff7ed' },
  { label: 'Sky',       value: '#f0f9ff' },
  { label: 'Rose',      value: '#fff1f2' },
  { label: 'Sage',      value: '#f0fdf4' },
  { label: 'Slate',     value: '#f8fafc' },
  { label: 'Sand',      value: '#fefce8' },
  { label: 'Lilac',     value: '#faf5ff' },
  { label: 'Ice',       value: '#f0fdfa' },
];

const GRADIENTS = [
  { label: 'Violet Mist',  value: 'linear-gradient(135deg, #ede9fe 0%, #fdf4ff 100%)' },
  { label: 'Ocean Breeze', value: 'linear-gradient(135deg, #eff6ff 0%, #ecfdf5 100%)' },
  { label: 'Sunset',       value: 'linear-gradient(135deg, #fff7ed 0%, #fdf2f8 100%)' },
  { label: 'Morning Sky',  value: 'linear-gradient(135deg, #f0f9ff 0%, #ede9fe 100%)' },
  { label: 'Rose Garden',  value: 'linear-gradient(135deg, #fff1f2 0%, #fdf4ff 100%)' },
  { label: 'Fresh Mint',   value: 'linear-gradient(135deg, #ecfdf5 0%, #f0f9ff 100%)' },
  { label: 'Cosmic Latte', value: 'linear-gradient(135deg, #fefce8 0%, #fff7ed 100%)' },
  { label: 'Dreamy',       value: 'linear-gradient(135deg, #fdf2f8 0%, #ede9fe 50%, #eff6ff 100%)' },
];

const PATTERNS = [
  {
    label: 'Dots',
    value: 'dots',
    css: `radial-gradient(circle, rgba(139,92,246,0.15) 1px, transparent 1px)`,
    size: '24px 24px',
    bg: '#faf5ff',
  },
  {
    label: 'Grid',
    value: 'grid',
    css: `linear-gradient(rgba(139,92,246,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139,92,246,0.1) 1px, transparent 1px)`,
    size: '32px 32px',
    bg: '#faf5ff',
  },
  {
    label: 'Diagonal',
    value: 'diagonal',
    css: `repeating-linear-gradient(
      45deg, transparent, transparent 12px,
      rgba(139,92,246,0.08) 12px, rgba(139,92,246,0.08) 13px)`,
    size: 'auto',
    bg: '#faf5ff',
  },
  {
    label: 'Hexagon',
    value: 'hexagon',
    css: `radial-gradient(circle at 50% 50%, rgba(139,92,246,0.12) 0%, transparent 60%)`,
    size: '40px 40px',
    bg: '#faf5ff',
  },
  {
    label: 'Waves',
    value: 'waves',
    css: `repeating-linear-gradient(
      -45deg, transparent, transparent 6px,
      rgba(139,92,246,0.07) 6px, rgba(139,92,246,0.07) 7px)`,
    size: 'auto',
    bg: '#faf5ff',
  },
  {
    label: 'Crosshatch',
    value: 'crosshatch',
    css: `repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(139,92,246,0.07) 15px, rgba(139,92,246,0.07) 16px),
          repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(139,92,246,0.07) 15px, rgba(139,92,246,0.07) 16px)`,
    size: 'auto',
    bg: '#faf5ff',
  },
];

// ── Image tab removed — only 3 tabs remain ────────────────────────────────────
type Tab = 'color' | 'gradient' | 'pattern';

interface Props {
  onSelect: (payload: WallpaperPayload) => void;
  onReset: () => void;
  currentWallpaper?: {
    wallpaperType: string;
    wallpaperData?: string;
    wallpaperColor?: string;
  };
  loading?: boolean;
}

export default function WallpaperPicker({ onSelect, onReset, currentWallpaper, loading = false }: Props) {
  const [activeTab, setActiveTab]     = useState<Tab>('color');
  const [customColor, setCustomColor] = useState('#ede9fe');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'color',    label: 'Solid',    icon: '⬛' },
    { id: 'gradient', label: 'Gradient', icon: '🌈' },
    { id: 'pattern',  label: 'Pattern',  icon: '▦'  },
    // Image tab removed
  ];

  return (
    <div className="flex flex-col h-full bg-white text-gray-900 select-none">

      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-violet-600 tracking-wide uppercase">Wallpaper</h3>
        {loading && <span className="text-xs text-gray-400 animate-pulse">Saving…</span>}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">

        {/* Solid Colors */}
        {activeTab === 'color' && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {SOLID_COLORS.map(c => {
                const isActive =
                  currentWallpaper?.wallpaperType === 'COLOR' &&
                  currentWallpaper?.wallpaperColor === c.value;
                return (
                  <button
                    key={c.value}
                    title={c.label}
                    onClick={() => onSelect({ wallpaperType: 'COLOR', wallpaperColor: c.value })}
                    className={`h-12 rounded-xl border-2 transition-all hover:scale-105 shadow-sm ${
                      isActive
                        ? 'border-violet-500 scale-105 shadow-violet-200'
                        : 'border-gray-200 hover:border-violet-300'
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                );
              })}
            </div>

            {/* Custom color */}
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-400 mb-2">Custom color</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={e => setCustomColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={e => setCustomColor(e.target.value)}
                  className="flex-1 bg-gray-50 text-gray-900 text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  placeholder="#ede9fe"
                />
                <button
                  onClick={() => onSelect({ wallpaperType: 'COLOR', wallpaperColor: customColor })}
                  className="px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gradients */}
        {activeTab === 'gradient' && (
          <div className="grid grid-cols-2 gap-2">
            {GRADIENTS.map(g => {
              const isActive =
                currentWallpaper?.wallpaperType === 'GRADIENT' &&
                currentWallpaper?.wallpaperColor === g.value;
              return (
                <button
                  key={g.value}
                  onClick={() => onSelect({ wallpaperType: 'GRADIENT', wallpaperColor: g.value })}
                  className={`h-16 rounded-xl border-2 text-xs font-medium transition-all hover:scale-[1.02] shadow-sm ${
                    isActive
                      ? 'border-violet-500 shadow-violet-200'
                      : 'border-gray-200 hover:border-violet-300'
                  }`}
                  style={{ background: g.value }}
                >
                  <span className="text-gray-600 drop-shadow-sm">{g.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Patterns */}
        {activeTab === 'pattern' && (
          <div className="grid grid-cols-2 gap-2">
            {PATTERNS.map(p => {
              const isActive =
                currentWallpaper?.wallpaperType === 'PATTERN' &&
                currentWallpaper?.wallpaperData === p.value;
              return (
                <button
                  key={p.value}
                  onClick={() => onSelect({ wallpaperType: 'PATTERN', wallpaperData: p.value, wallpaperColor: p.bg })}
                  className={`h-16 rounded-xl border-2 text-xs font-medium transition-all flex items-center justify-center shadow-sm ${
                    isActive
                      ? 'border-violet-500 shadow-violet-200'
                      : 'border-gray-200 hover:border-violet-300'
                  }`}
                  style={{ backgroundColor: p.bg, backgroundImage: p.css, backgroundSize: p.size }}
                >
                  <span className="text-violet-600 font-semibold drop-shadow-sm">{p.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 pb-3 pt-2 border-t border-gray-100">
        <button
          onClick={onReset}
          disabled={loading}
          className="w-full py-2 text-xs text-gray-500 border border-gray-200 rounded-xl hover:border-violet-300 hover:text-violet-600 transition-colors disabled:opacity-50"
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
}