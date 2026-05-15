import {
  createSlice
} from '@reduxjs/toolkit';

interface Message {
  id: string;

  sender: string;

  type?:
    | 'chat'
    | 'system';

  text?: string;

  image?: string;

  fileName?: string;

  time: string;

  status:
    | 'sent'
    | 'delivered'
    | 'read';
}

interface ChatState {
  selectedChat:
    string | null;

  isGroup:
    boolean;

  messages:
    Message[];

  typingUser:
    string | null;

  onlineUsers:
    string[];
}

const initialState:
  ChatState = {
    selectedChat:
      null,

    isGroup:
      false,

    typingUser:
      null,

    onlineUsers: [],

    messages: []
  };

const chatSlice =
  createSlice({
    name: 'chat',

    initialState,

    reducers: {
      setTyping:
        (
          state,
          action
        ) => {
          state.typingUser =
            action.payload;
        },

      clearTyping:
        state => {
          state.typingUser =
            null;
        },

      updateOnlineUsers:
        (
          state,
          action
        ) => {
          state.onlineUsers =
            action.payload;
        },

      addSystemMessage:
        (
          state,
          action
        ) => {
          state.messages.push(
            action.payload
          );
        },

      setSelectedChat:
        (
          state,
          action
        ) => {
          const {
            name,

            isGroup
          } =
            action.payload;

          state.selectedChat =
            name;

          state.isGroup =
            isGroup;

          if (
            isGroup
          ) {
            state.messages =
              [];

            return;
          }

          state.messages = [
            {
              id: '1',

              sender:
                name,

              type:
                'chat',

              text:
                'Hey 👋',

              time:
                '10:30',

              status:
                'read'
            },

            {
              id: '2',

              sender:
                'me',

              type:
                'chat',

              text:
                'Hello!',

              time:
                '10:31',

              status:
                'read'
            }
          ];
        },

      sendMessage:
        (
          state,
          action
        ) => {
          state.messages.push(
            action.payload
          );
        }
    }
  });

export const {
  setSelectedChat,

  sendMessage,

  setTyping,

  clearTyping,

  updateOnlineUsers,

  addSystemMessage
} =
  chatSlice.actions;

export default
  chatSlice.reducer;