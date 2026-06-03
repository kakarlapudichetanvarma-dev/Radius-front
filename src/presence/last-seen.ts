import { store } from '../store';

export const formatLastSeen = (isoString: string | null | undefined): string => {
  if (!isoString) return '';

  const lastSeen = new Date(isoString);
  if (isNaN(lastSeen.getTime())) return '';

  const now      = new Date();
  const diffMs   = now.getTime() - lastSeen.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);

  const timeStr = lastSeen.toLocaleTimeString([], {
    hour:   '2-digit',
    minute: '2-digit',
  });

  if (diffSecs < 60)  return 'last seen just now';
  if (diffMins < 60)  return `last seen ${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;

  const isToday = lastSeen.toDateString() === now.toDateString();
  if (isToday)        return `last seen today at ${timeStr}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = lastSeen.toDateString() === yesterday.toDateString();
  if (isYesterday)    return `last seen yesterday at ${timeStr}`;

  const dateStr = lastSeen.toLocaleDateString([], { day: 'numeric', month: 'short' });
  return `last seen ${dateStr}`;
};

/** Reads from store by username, returns formatted string */
export const getLastSeenRaw = (username: string): string | null => {
  return store.getState().chat.lastSeenMap[username] ?? null;
};

/**
 * Two call signatures:
 *   getFormattedLastSeen('syam')           ← looks up store by username
 *   getFormattedLastSeen(isoString | null) ← formats a raw ISO string directly
 *
 * ChatHeader passes the ISO string directly, FriendList can use username.
 */
export const getFormattedLastSeen = (usernameOrIso: string | null): string => {
  if (!usernameOrIso) return '';

  // If it looks like an ISO timestamp (contains 'T' and '-'), format directly
  if (usernameOrIso.includes('T') && usernameOrIso.includes('-')) {
    return formatLastSeen(usernameOrIso);
  }

  // Otherwise treat as username and look up from store
  return formatLastSeen(getLastSeenRaw(usernameOrIso));
};