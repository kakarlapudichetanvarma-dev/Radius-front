import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './slices/chat.slice';
import authReducer from './slices/auth.slice';
import friendReducer from './slices/friend.slice';
import groupReducer
  from './slices/group.slice';
  import callReducer
  from './slices/call.slice';
export const store = configureStore({
  reducer: {
    chat: chatReducer,
    auth: authReducer,
    friend: friendReducer,
    group: groupReducer,
    call: callReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;