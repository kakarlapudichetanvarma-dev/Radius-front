// src/hooks/useTyping.ts

import { useSelector } from 'react-redux';
import type { RootState } from '../store';

/**
 * Returns the list of usernames currently typing in the given chat.
 * Used in ChatWindow to show the animated bubble.
 */
export function useTypingUsers(chatId: string | null): string[] {
  return useSelector((state: RootState) =>
    chatId ? (state.chat.typingUsers[chatId] ?? []) : []
  );
}

/**
 * Returns true if anyone is typing in the given chat.
 * Used in ChatList sidebar to show "typing..." under the chat name.
 */
export function useIsTyping(chatId: string | null): boolean {
  return useSelector((state: RootState) =>
    chatId ? (state.chat.typingUsers[chatId] ?? []).length > 0 : false
  );
}