import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { updateProfile } from '../../store/slices/auth.slice';
import Avatar from '../common/Avatar';

interface AvatarUploaderProps {
  size?: number;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ size = 80 }) => {
  const dispatch        = useDispatch<AppDispatch>();
  const user            = useSelector((s: RootState) => s.auth.user);
  const updatingProfile = useSelector((s: RootState) => s.auth.updatingProfile);

  const inputRef = useRef<HTMLInputElement>(null);

  // ── State ──────────────────────────────────────────────────────────────────
  // blobPreview  : local object URL shown instantly when user picks a file
  // confirmedSrc : server URL we switch to only after the <img> confirms it loaded
  // error        : upload error message
  const [blobPreview,  setBlobPreview]  = useState<string | null>(null);
  const [confirmedSrc, setConfirmedSrc] = useState<string | null>(null);
  const [error,        setError]        = useState<string | null>(null);

  // ── When Redux updates user.profilePicture, pre-load the new server image ──
  // We do NOT show it yet — we wait for onLoad so there is never a blank flash.
  useEffect(() => {
    if (!user?.profilePicture) return;

    const serverUrl = `http://localhost:8080${user.profilePicture}?t=${Date.now()}`;

    if (blobPreview) {
      // Still showing a blob preview — silently pre-warm the server image
      const img = new Image();
      img.onload = () => {
        // Server image confirmed ready — swap blob -> server URL seamlessly
        setConfirmedSrc(serverUrl);
        setBlobPreview(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
      };
      img.onerror = () => {
        // Server image failed to load — keep blob preview, don't flash broken img
      };
      img.src = serverUrl;
    } else {
      // No blob active — just update confirmed src normally
      setConfirmedSrc(serverUrl);
    }
  }, [user?.profilePicture]);

  // ── What src to actually render ────────────────────────────────────────────
  // Priority: blob preview (instant) -> confirmed server URL -> null (initials)
  const displaySrc = blobPreview ?? confirmedSrc ?? null;

  // ── File picker handler ────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setError('Only JPG, PNG, WEBP or GIF images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.');
      return;
    }

    setError(null);

    // 1. Show the new image INSTANTLY via local blob URL — no waiting
    const objectUrl = URL.createObjectURL(file);
    setBlobPreview(objectUrl);

    // 2. Upload silently in the background — UI already shows the new pic
    const formData = new FormData();
    formData.append('profilePicture', file);

    const result = await dispatch(updateProfile(formData));

    if (!updateProfile.fulfilled.match(result)) {
      // Upload failed — revert back to the last confirmed server src
      URL.revokeObjectURL(objectUrl);
      setBlobPreview(null);
      setError('Failed to update avatar. Please try again.');
    }
    // On success: the useEffect above detects user.profilePicture changed in Redux,
    // pre-loads the server image, and swaps blobPreview -> confirmedSrc seamlessly.

    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div
        style={{ position: 'relative', cursor: 'pointer' }}
        onClick={() => inputRef.current?.click()}
        title="Change profile picture"
      >
        {/* Avatar — shows blob instantly, then server image once confirmed */}
        {displaySrc ? (
          <img
            src={displaySrc}
            alt={user?.username ?? 'avatar'}
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              objectFit: 'cover',
              display: 'block',
              transition: 'opacity 0.2s ease',
            }}
          />
        ) : (
          <Avatar
            src={null}
            username={user?.username ?? ''}
            size={size}
          />
        )}

        {/* Camera overlay icon */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: size * 0.35,
            height: size * 0.35,
            borderRadius: '50%',
            background: '#7c3aed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #fff',
          }}
        >
          <svg
            width={size * 0.18}
            height={size * 0.18}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </div>

        {/* Upload spinner — visible while request is in-flight */}
        {updatingProfile && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: size * 0.32,
                height: size * 0.32,
                border: '3px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
              }}
            />
          </div>
        )}
      </div>

      {error && (
        <p style={{ fontSize: 12, color: '#e53e3e', margin: 0, textAlign: 'center', maxWidth: size * 2 }}>
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AvatarUploader;