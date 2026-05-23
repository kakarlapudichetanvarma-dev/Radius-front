import { useState, useRef } from 'react';
import type { WallpaperPayload } from '../../hooks/useWallpaper';

// ─── Preset options ───────────────────────────────────────────────────────────

const SOLID_COLORS = [
    { label: 'Midnight', value: '#0a0a0a' },
    { label: 'Obsidian', value: '#1a1a2e' },
    { label: 'Forest', value: '#0d2b1d' },
    { label: 'Navy', value: '#0d1b2a' },
    { label: 'Charcoal', value: '#1c1c1e' },
    { label: 'Plum', value: '#2d1b3d' },
    { label: 'Burgundy', value: '#2d0f1a' },
    { label: 'Slate', value: '#1e2a3a' },
    { label: 'Sage', value: '#2d3a2e' },
    { label: 'Espresso', value: '#2c1810' },
    { label: 'Deep Teal', value: '#0d2626' },
    { label: 'Graphite', value: '#2a2a2a' },
];

const GRADIENTS = [
    { label: 'Gold Rush', value: 'linear-gradient(135deg, #1a1a1a 0%, #2d2200 50%, #1a1200 100%)' },
    { label: 'Ocean Night', value: 'linear-gradient(135deg, #0d1b2a 0%, #1a3a4a 50%, #0d2626 100%)' },
    { label: 'Violet Dusk', value: 'linear-gradient(135deg, #1a0d2e 0%, #2d1b3d 50%, #1a0d1a 100%)' },
    { label: 'Forest Mist', value: 'linear-gradient(135deg, #0d1a0d 0%, #1a3320 50%, #0d2626 100%)' },
    { label: 'Ember', value: 'linear-gradient(135deg, #1a0800 0%, #2d1200 50%, #1a0d00 100%)' },
    { label: 'Steel', value: 'linear-gradient(135deg, #1a1a2e 0%, #2a2a3e 50%, #1a1a1a 100%)' },
    { label: 'Cosmic', value: 'linear-gradient(135deg, #0d0d1a 0%, #1a0d2e 30%, #2d1a3d 60%, #0d1a2e 100%)' },
    { label: 'Copper', value: 'linear-gradient(135deg, #1a0d00 0%, #2d1a00 40%, #1a0800 100%)' },
];

const PATTERNS = [
    {
        label: 'Dots',
        value: 'dots',
        css: `radial-gradient(circle, rgba(212,175,55,0.15) 1px, transparent 1px)`,
        size: '24px 24px',
    },
    {
        label: 'Grid',
        value: 'grid',
        css: `linear-gradient(rgba(212,175,55,0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(212,175,55,0.08) 1px, transparent 1px)`,
        size: '32px 32px',
    },
    {
        label: 'Diagonal',
        value: 'diagonal',
        css: `repeating-linear-gradient(
      45deg,
      transparent,
      transparent 12px,
      rgba(212,175,55,0.06) 12px,
      rgba(212,175,55,0.06) 13px
    )`,
        size: 'auto',
    },
    {
        label: 'Hexagon',
        value: 'hexagon',
        css: `radial-gradient(circle at 50% 50%, rgba(212,175,55,0.1) 0%, transparent 60%)`,
        size: '40px 40px',
    },
    {
        label: 'Waves',
        value: 'waves',
        css: `repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 6px,
      rgba(212,175,55,0.05) 6px,
      rgba(212,175,55,0.05) 7px
    )`,
        size: 'auto',
    },
    {
        label: 'Crosshatch',
        value: 'crosshatch',
        css: `repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(212,175,55,0.06) 15px, rgba(212,175,55,0.06) 16px),
          repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(212,175,55,0.06) 15px, rgba(212,175,55,0.06) 16px)`,
        size: 'auto',
    },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'color' | 'gradient' | 'pattern' | 'image';

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function WallpaperPicker({
    onSelect,
    onReset,
    currentWallpaper,
    loading = false,
}: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('color');
    const [customColor, setCustomColor] = useState('#1a1a1a');
    const [imageUrl, setImageUrl] = useState('');
    const [imageError, setImageError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const tabs: { id: Tab; label: string; icon: string }[] = [
        { id: 'color', label: 'Solid', icon: '⬛' },
        { id: 'gradient', label: 'Gradient', icon: '🌈' },
        { id: 'pattern', label: 'Pattern', icon: '▦' },
        { id: 'image', label: 'Image', icon: '🖼️' },
    ];

    const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setImageError('Please select an image file.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setImageError('Image must be under 5MB.');
            return;
        }
        setImageError('');
        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            setImageUrl(dataUrl);
            onSelect({ wallpaperType: 'IMAGE', wallpaperData: dataUrl });
        };
        reader.readAsDataURL(file);
    };

    const handleImageUrl = () => {
        if (!imageUrl.trim()) return;
        try {
            new URL(imageUrl);
            setImageError('');
            onSelect({ wallpaperType: 'IMAGE', wallpaperData: imageUrl });
        } catch {
            setImageError('Enter a valid image URL.');
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 text-white select-none">

            {/* Header */}
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-yellow-400 tracking-wide uppercase">
                    Wallpaper
                </h3>
                {loading && (
                    <span className="text-xs text-zinc-500 animate-pulse">Saving…</span>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-800">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-2.5 text-xs font-medium transition-colors
              ${activeTab === tab.id
                                ? 'text-yellow-400 border-b-2 border-yellow-400 bg-zinc-900'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        <span className="mr-1">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3">

                {/* ── Solid Colors ── */}
                {activeTab === 'color' && (
                    <div className="space-y-3">
                        <div className="grid grid-cols-4 gap-2">
                            {SOLID_COLORS.map((c) => {
                                const isActive =
                                    currentWallpaper?.wallpaperType === 'COLOR' &&
                                    currentWallpaper?.wallpaperColor === c.value;
                                return (
                                    <button
                                        key={c.value}
                                        title={c.label}
                                        onClick={() =>
                                            onSelect({ wallpaperType: 'COLOR', wallpaperColor: c.value })
                                        }
                                        className={`h-12 rounded-lg border-2 transition-all hover:scale-105
                      ${isActive ? 'border-yellow-400 scale-105' : 'border-transparent hover:border-zinc-600'}`}
                                        style={{ backgroundColor: c.value }}
                                    />
                                );
                            })}
                        </div>

                        {/* Custom color picker */}
                        <div className="border-t border-zinc-800 pt-3">
                            <p className="text-xs text-zinc-500 mb-2">Custom color</p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={customColor}
                                    onChange={(e) => setCustomColor(e.target.value)}
                                    className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
                                />
                                <input
                                    type="text"
                                    value={customColor}
                                    onChange={(e) => setCustomColor(e.target.value)}
                                    className="flex-1 bg-zinc-800 text-white text-xs px-3 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:border-yellow-400"
                                    placeholder="#1a1a1a"
                                />
                                <button
                                    onClick={() =>
                                        onSelect({ wallpaperType: 'COLOR', wallpaperColor: customColor })
                                    }
                                    className="px-3 py-2 bg-yellow-400 text-black text-xs font-bold rounded-lg hover:bg-yellow-300 transition-colors"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Gradients ── */}
                {activeTab === 'gradient' && (
                    <div className="grid grid-cols-2 gap-2">
                        {GRADIENTS.map((g) => {
                            const isActive =
                                currentWallpaper?.wallpaperType === 'GRADIENT' &&
                                currentWallpaper?.wallpaperColor === g.value;
                            return (
                                <button
                                    key={g.value}
                                    onClick={() =>
                                        onSelect({ wallpaperType: 'GRADIENT', wallpaperColor: g.value })
                                    }
                                    className={`h-16 rounded-lg border-2 text-xs font-medium transition-all hover:scale-102
                    ${isActive ? 'border-yellow-400' : 'border-transparent hover:border-zinc-600'}`}
                                    style={{ background: g.value }}
                                >
                                    <span className="drop-shadow text-white/70">{g.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* ── Patterns ── */}
                {activeTab === 'pattern' && (
                    <div className="grid grid-cols-2 gap-2">
                        {PATTERNS.map((p) => {
                            const isActive =
                                currentWallpaper?.wallpaperType === 'PATTERN' &&
                                currentWallpaper?.wallpaperData === p.value;
                            return (
                                <button
                                    key={p.value}
                                    onClick={() =>
                                        onSelect({
                                            wallpaperType: 'PATTERN',
                                            wallpaperData: p.value,
                                            wallpaperColor: '#0a0a0a',
                                        })
                                    }
                                    className={`h-16 rounded-lg border-2 text-xs font-medium transition-all flex items-center justify-center
                    ${isActive ? 'border-yellow-400' : 'border-zinc-700 hover:border-zinc-500'}`}
                                    style={{
                                        backgroundColor: '#0a0a0a',
                                        backgroundImage: p.css,
                                        backgroundSize: p.size,
                                    }}
                                >
                                    <span className="text-yellow-400/80 drop-shadow">{p.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* ── Image ── */}
                {activeTab === 'image' && (
                    <div className="space-y-3">
                        {/* Upload file */}
                        <div>
                            <p className="text-xs text-zinc-500 mb-2">Upload from device</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageFile}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-3 border-2 border-dashed border-zinc-700 rounded-lg text-zinc-400 text-sm hover:border-yellow-400 hover:text-yellow-400 transition-colors"
                            >
                                📁 Choose image file
                            </button>
                        </div>

                        {/* URL input */}

                        {/* Preview */}
                        {currentWallpaper?.wallpaperType === 'IMAGE' &&
                            currentWallpaper?.wallpaperData && (
                                <div className="border-t border-zinc-800 pt-3">
                                    <p className="text-xs text-zinc-500 mb-2">Current wallpaper</p>
                                    <div
                                        className="h-24 rounded-lg bg-cover bg-center border border-zinc-700"
                                        style={{
                                            backgroundImage: `url(${currentWallpaper.wallpaperData})`,
                                        }}
                                    />
                                </div>
                            )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-3 pb-3 pt-2 border-t border-zinc-800 flex gap-2">
                <button
                    onClick={onReset}
                    disabled={loading}
                    className="flex-1 py-2 text-xs text-zinc-400 border border-zinc-700 rounded-lg hover:border-zinc-500 hover:text-zinc-200 transition-colors disabled:opacity-50"
                >
                    Reset to Default
                </button>
            </div>
        </div>
    );
}