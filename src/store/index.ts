/**
 * store/index.ts
 */
import { configureStore } from '@reduxjs/toolkit';
import chatReducer, {
  receiveMessage,
  updateMessageStatus,
} from './slices/chat.slice';
import authReducer from './slices/auth.slice';
import friendReducer from './slices/friend.slice';
import groupReducer from './slices/group.slice';
import profileReducer from './slices/profile.slice';
import uiReducer from './slices/ui.slice';
import { initMessageEvents } from '../socket/message.events';
import communityReducer from './slices/community.slice';

export const store = configureStore({
  reducer: {
    chat:    chatReducer,
    auth:    authReducer,
    friend:  friendReducer,
    group:   groupReducer,
    community: communityReducer,
    profile: profileReducer,
    ui:      uiReducer,
  },
});

initMessageEvents(store, receiveMessage, updateMessageStatus);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;