// src/components/chat/TypingIndicator.tsx

import React from 'react';

interface TypingIndicatorProps {
  username?: string;
  variant?: 'bubble' | 'inline';
  className?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  username,
  variant = 'bubble',
  className = '',
}) => {
  if (variant === 'inline') {
    return (
      <span
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '2px',
          color: '#25D366',
          fontSize: '12px',
          fontStyle: 'italic',
        }}
      >
        <span>typing</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', marginLeft: '1px' }}>
          <span style={dotStyle(0)} />
          <span style={dotStyle(1)} />
          <span style={dotStyle(2)} />
        </span>
        <style>{keyframes}</style>
      </span>
    );
  }

  // bubble variant — shown inside the chat window
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        margin: '4px 12px',
      }}
    >
      {username && (
        <span
          style={{
            fontSize: '11px',
            color: '#8696A0',
            marginRight: '6px',
            marginBottom: '4px',
            whiteSpace: 'nowrap',
          }}
        >
          {username}
        </span>
      )}

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          backgroundColor: '#202C33',
          padding: '12px 16px',
          borderRadius: '18px 18px 18px 4px',
          minWidth: '56px',
          justifyContent: 'center',
        }}
      >
        <span style={bubbleDotStyle(0)} />
        <span style={bubbleDotStyle(1)} />
        <span style={bubbleDotStyle(2)} />
      </div>

      <style>{keyframes}</style>
    </div>
  );
};

// ── Inline dot styles (sidebar) ───────────────────────────────────────────────
function dotStyle(index: number): React.CSSProperties {
  return {
    display: 'inline-block',
    width: '3px',
    height: '3px',
    backgroundColor: '#25D366',
    borderRadius: '50%',
    animation: `typingBounce 1.2s ease-in-out infinite`,
    animationDelay: `${index * 0.2}s`,
  };
}

// ── Bubble dot styles (chat window) ──────────────────────────────────────────
function bubbleDotStyle(index: number): React.CSSProperties {
  return {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    backgroundColor: '#8696A0',
    borderRadius: '50%',
    animation: `bubblePulse 1.4s ease-in-out infinite`,
    animationDelay: `${index * 0.2}s`,
  };
}

// ── Keyframes injected once ───────────────────────────────────────────────────
const keyframes = `
  @keyframes typingBounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-3px); opacity: 1; }
  }
  @keyframes bubblePulse {
    0%, 60%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
    30% { transform: translateY(-5px) scale(1.1); opacity: 1; }
  }
`;

export default TypingIndicator;