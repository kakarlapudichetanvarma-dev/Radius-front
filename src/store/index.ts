/**
 * store/index.ts  — updated version
 * Add profileReducer and call connectAvatarEvents after login.
 */
import { configureStore } from '@reduxjs/toolkit';
import chatReducer, {
  receiveMessage,
  updateMessageStatus,
} from './slices/chat.slice';
import authReducer from './slices/auth.slice';
import friendReducer from './slices/friend.slice';
import groupReducer from './slices/group.slice';
import callReducer from './slices/call.slice';
import profileReducer from './slices/profile.slice'; // ← ADD
import { initMessageEvents } from '../socket/message.events';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    auth: authReducer,
    friend: friendReducer,
    group: groupReducer,
    call: callReducer,
    profile: profileReducer, // ← ADD
  },
});

initMessageEvents(store, receiveMessage, updateMessageStatus);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;