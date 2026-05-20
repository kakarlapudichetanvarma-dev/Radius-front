// ReadReceipt.tsx
// Renders WhatsApp-style message ticks:
//   SENT      → single grey  ✓
//   DELIVERED → double grey  ✓✓
//   READ      → double blue  ✓✓

interface Props {
  status: 'SENT' | 'DELIVERED' | 'READ' | string;
  size?: 'sm' | 'md';
}

export default function ReadReceipt({ status, size = 'sm' }: Props) {
  const textSize = size === 'md' ? 'text-sm' : 'text-xs';

  if (status === 'READ') {
    return (
      <span
        className={`${textSize} font-bold leading-none select-none`}
        style={{ color: '#53bdeb' }}   // WhatsApp blue
        title="Seen"
        aria-label="Read"
      >
        ✓✓
      </span>
    );
  }

  if (status === 'DELIVERED') {
    return (
      <span
        className={`${textSize} font-bold leading-none text-zinc-400 select-none`}
        title="Delivered"
        aria-label="Delivered"
      >
        ✓✓
      </span>
    );
  }

  // SENT (default)
  return (
    <span
      className={`${textSize} leading-none text-zinc-400 select-none`}
      title="Sent"
      aria-label="Sent"
    >
      ✓
    </span>
  );
}