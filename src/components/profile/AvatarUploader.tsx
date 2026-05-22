import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { updateProfile } from '../../store/slices/auth.slice';
import Avatar from '../common/Avatar';

interface AvatarUploaderProps {
  size?: number;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ size = 80 }) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.auth.user);
  const updatingProfile = useSelector((s: RootState) => s.auth.updatingProfile);

  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    // Show instant local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    const formData = new FormData();
    formData.append('profilePicture', file);

    const result = await dispatch(updateProfile(formData));

    if (updateProfile.fulfilled.match(result)) {
      // ✅ Backend handles the WebSocket broadcast automatically after save
      // No manual socket publish needed here
      URL.revokeObjectURL(objectUrl);
      setPreview(null);
    } else {
      URL.revokeObjectURL(objectUrl);
      setPreview(null);
      setError('Failed to update avatar. Please try again.');
    }

    if (inputRef.current) inputRef.current.value = '';
  };

  const currentPic = preview ?? user?.profilePicture ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div
        style={{ position: 'relative', cursor: 'pointer' }}
        onClick={() => inputRef.current?.click()}
        title="Change profile picture"
      >
        <Avatar
          src={currentPic ? `http://localhost:8080${currentPic}` : null}
          username={user?.username ?? ''}
          size={size}
        />

        {/* Camera overlay icon */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: size * 0.35,
            height: size * 0.35,
            borderRadius: '50%',
            background: '#25D366',
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

        {/* Loading spinner */}
        {updatingProfile && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: size * 0.35,
                height: size * 0.35,
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
        <p style={{ fontSize: 12, color: '#e53e3e', margin: 0, textAlign: 'center' }}>
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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AvatarUploader;