import React from 'react';

interface AvatarProps {
  src?: string | null;
  username?: string;
  size?: number;        // px — default 40
  className?: string;
  onClick?: () => void;
}

/**
 * Renders a circular avatar.
 * - If `src` is a valid URL or base64 string → shows the image.
 * - Otherwise falls back to initials derived from `username`.
 */
const Avatar: React.FC<AvatarProps> = ({
  src,
  username = '',
  size = 40,
  className = '',
  onClick,
}) => {
  const [imgError, setImgError] = React.useState(false);

  // Reset error state whenever src changes
  React.useEffect(() => {
    setImgError(false);
  }, [src]);

  const initials = username
    ? username
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('')
    : '?';

  const showImage = src && !imgError;

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    minWidth: size,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: onClick ? 'pointer' : 'default',
    background: showImage ? 'transparent' : generateBgColor(username),
    userSelect: 'none',
    flexShrink: 0,
  };

  return (
    <div
      style={containerStyle}
      className={className}
      onClick={onClick}
      title={username}
    >
      {showImage ? (
        <img
          src={src}
          alt={username}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span
          style={{
            fontSize: Math.max(size * 0.38, 10),
            fontWeight: 600,
            color: '#fff',
            lineHeight: 1,
          }}
        >
          {initials}
        </span>
      )}
    </div>
  );
};

/** Deterministic background colour from username string */
function generateBgColor(name: string): string {
  const colours = [
    '#FF6B6B', '#FF8E53', '#FFD93D', '#6BCB77',
    '#4D96FF', '#C77DFF', '#FF6BB5', '#00C9A7',
    '#F4A261', '#E76F51',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colours[Math.abs(hash) % colours.length];
}

export default Avatar;