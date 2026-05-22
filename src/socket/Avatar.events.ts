/**
 * avatar.events.ts
 *
 * Subscribes to /topic/avatar-update and immediately updates:
 *   - friend list avatars  (friend.slice → updateFriendAvatar)
 *   - open profile modal   (profile.slice → updateViewedUserAvatar)
 *   - logged-in user       (auth.slice → updateProfile fulfilled path
 *                           is handled automatically by the thunk)
 *
 * Call connectAvatarEvents() once after the user logs in
 * (e.g. inside useAuth or alongside connectPresence).
 *
 * Backend must broadcast to /topic/avatar-update with body:
 *   { "userId": "...", "profilePicture": "https://..." }
 */
import { safeSubscribe, safeUnsubscribe } from './socket.client';
import { store } from '../store';
import { updateFriendAvatar } from '../store/slices/friend.slice';
import { updateViewedUserAvatar } from '../store/slices/profile.slice';

const AVATAR_TOPIC = '/topic/avatar-update';

let connected = false;

export const connectAvatarEvents = (): void => {
  if (connected) return;
  connected = true;

  console.log('🖼️ Subscribing to avatar updates:', AVATAR_TOPIC);

  safeSubscribe(AVATAR_TOPIC, (frame) => {
    try {
      const payload = JSON.parse(frame.body) as {
        userId: string;
        profilePicture: string | null;
      };

      if (!payload.userId) return;

      // 1. Update avatar in friend list (Syam & Pradeep see Ashok's new pic)
      store.dispatch(
        updateFriendAvatar({
          userId: payload.userId,
          profilePicture: payload.profilePicture,
        })
      );

      // 2. Update avatar in open profile modal
      store.dispatch(
        updateViewedUserAvatar({
          userId: payload.userId,
          profilePicture: payload.profilePicture,
        })
      );

      console.log(
        `✅ Avatar updated for user ${payload.userId}:`,
        payload.profilePicture
      );
    } catch (err) {
      console.error('Failed to parse avatar update event:', err);
    }
  });
};

export const disconnectAvatarEvents = (): void => {
  connected = false;
  safeUnsubscribe(AVATAR_TOPIC);
};