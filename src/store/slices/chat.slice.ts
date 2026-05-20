import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ChatSummary, Message } from '../../types/chat.types';
import { chatService } from '../../services/chat.service';

interface ChatState {
  chats: ChatSummary[];
  selectedChatId: string | null;
  selectedChat: ChatSummary | null;
  messages: Message[];
  loadingChats: boolean;
  loadingMessages: boolean;
  typingUser: string | null;
  onlineUsers: string[];
  error: string | null;
  chatClosedAt: Record<string, string>;
  _optimisticAtFetchStart: Message[];
}

const initialState: ChatState = {
  chats: [],
  selectedChatId: null,
  selectedChat: null,
  messages: [],
  loadingChats: false,
  loadingMessages: false,
  typingUser: null,
  onlineUsers: [],
  error: null,
  chatClosedAt: {},
  _optimisticAtFetchStart: []
};

// Thunks
export const fetchChats = createAsyncThunk(
  'chat/fetchChats',
  async (username: string, { rejectWithValue }) => {
    try {
      const res = await chatService.getChatsByUsername(username);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load chats');
    }
  }
);

export const markRead = createAsyncThunk(
  'chat/markRead',
  async (chatId: string) => chatId
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (chatId: string, { rejectWithValue }) => {
    try {
      const res = await chatService.getChatMessages(chatId);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load messages');
    }
  }
);

export const sendPrivateMessage = createAsyncThunk(
  'chat/sendPrivateMessage',
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await chatService.sendPrivateMessage(payload);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send message');
    }
  }
);

export const sendGroupMessage = createAsyncThunk(
  'chat/sendGroupMessage',
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await chatService.sendGroupMessage(payload);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send message');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,

  reducers: {
    setSelectedChat: (state, action: PayloadAction<ChatSummary>) => {
      const isSameChat = state.selectedChatId === action.payload.chatId;

      if (!isSameChat) {
        if (state.selectedChatId) {
          state.chatClosedAt[state.selectedChatId] = new Date().toISOString();
        }
        state.messages = [];
        state._optimisticAtFetchStart = [];
      }

      state.selectedChat = action.payload;
      state.selectedChatId = action.payload.chatId;

      const chat = state.chats.find(c => c.chatId === action.payload.chatId);
      if (chat) chat.unreadCount = 0;
    },

    clearSelectedChat: (state) => {
      if (state.selectedChatId) {
        state.chatClosedAt[state.selectedChatId] = new Date().toISOString();
      }
      state.selectedChat = null;
      state.selectedChatId = null;
      state.messages = [];
      state._optimisticAtFetchStart = [];
    },

    receiveMessage: (state, action: PayloadAction<Message>) => {
      const msg = action.payload;
      const exists = state.messages.some(m => m.id === msg.id);
      if (!exists) {
        state.messages = [...state.messages, msg];
      }
      const chat = state.chats.find(c => c.chatId === msg.chatId);
      if (chat) {
        chat.lastMessage = msg.content;
        chat.lastMessageAt = msg.sentAt;
      }
    },

    updateMessageStatus: (
      state,
      action: PayloadAction<{ messageId: string; status: 'SENT' | 'DELIVERED' | 'READ' }>
    ) => {
      const msg = state.messages.find(m => m.id === action.payload.messageId);
      if (msg) msg.status = action.payload.status;
    },

    replaceOptimisticWithReal: (
      state,
      action: PayloadAction<{ optimisticId: string; realMessage: Message }>
    ) => {
      const { optimisticId, realMessage } = action.payload;

      const realExists = state.messages.some(m => m.id === realMessage.id);
      const optimisticIndex = state.messages.findIndex(m => m.id === optimisticId);

      if (realExists && optimisticIndex !== -1) {
        // fetchMessages already added the real message — just remove the optimistic
        state.messages.splice(optimisticIndex, 1);
      } else if (optimisticIndex !== -1) {
        // Normal path: swap optimistic for real
        state.messages[optimisticIndex] = realMessage;
      } else if (!realExists) {
        // Neither present yet — push real
        state.messages.push(realMessage);
      }
      // realExists && no optimistic → already clean, do nothing

      const chat = state.chats.find(c => c.chatId === realMessage.chatId);
      if (chat) {
        chat.lastMessage = realMessage.content;
        chat.lastMessageAt = realMessage.sentAt;
      }
    },

    deleteOptimisticById: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter(m => m.id !== action.payload);
    },

    markAllMessagesRead: (state, action: PayloadAction<string>) => {
      if (state.selectedChatId === action.payload) {
        state.messages.forEach(m => {
          if (m.status !== 'READ') m.status = 'READ';
        });
      }
    },

    deleteMessageLocally: (state, action: PayloadAction<string>) => {
      const msg = state.messages.find(m => m.id === action.payload);
      if (msg) msg.isDeleted = true;
    },

    setTyping: (state, action: PayloadAction<string | null>) => {
      state.typingUser = action.payload;
    },

    updateOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    },

    setUserOnline: (state, action: PayloadAction<string>) => {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },

    setUserOffline: (state, action: PayloadAction<string>) => {
      state.onlineUsers = state.onlineUsers.filter(u => u !== action.payload);
    },

    addSystemMessage: (state, action: PayloadAction<Message>) => {
      state.messages = [...state.messages, action.payload];
    },

    updateChatLastMessage: (state, action: PayloadAction<Message>) => {
      const chat = state.chats.find(c => c.chatId === action.payload.chatId);
      if (chat) {
        chat.lastMessage = action.payload.content;
        chat.lastMessageAt = action.payload.sentAt;
      }
    },

    updateChatAvatar: (
      state,
      action: PayloadAction<{ username: string; profilePicture: string }>
    ) => {
      state.chats.forEach(chat => {
        if (chat.otherParticipantUsername === action.payload.username) {
          chat.otherParticipantAvatar = action.payload.profilePicture;
        }
      });
    },

    promoteTempChat: (state, action: PayloadAction<ChatSummary>) => {
      const tempIndex = state.chats.findIndex(
        c =>
          c.chatId.startsWith('temp-') &&
          c.otherParticipantUsername === action.payload.otherParticipantUsername
      );

      if (tempIndex !== -1) {
        state.chats[tempIndex] = action.payload;
      } else {
        state.chats.unshift(action.payload);
      }

      if (state.selectedChatId?.startsWith('temp-')) {
        state.selectedChatId = action.payload.chatId;
        state.selectedChat = action.payload;
      }
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loadingMessages = true;
        // Snapshot all temp-ID messages that exist at the moment the fetch
        // is dispatched. Used in fulfilled to know which optimistics were
        // in-flight vs added after the fetch started.
        state._optimisticAtFetchStart = state.messages.filter(
          m => m.id.startsWith('temp-')
        );
      })

      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loadingMessages = false;

        const incoming: Message[] = action.payload || [];
        const incomingIds = new Set(incoming.map((m: Message) => m.id));

        // IDs of temp messages that existed when the fetch was dispatched
        const snapshotIds = new Set(state._optimisticAtFetchStart.map(m => m.id));

        // Find any temp-ID messages that were added AFTER the fetch started
        // (i.e. not in the snapshot). These will be resolved by their own
        // WS replaceOptimisticWithReal and must survive the merge untouched.
        const lateOptimistics = state.messages.filter(
          m => m.id.startsWith('temp-') && !snapshotIds.has(m.id)
        );

        // The final message list is simply:
        //   incoming (authoritative server list)
        //   + late optimistics (not yet confirmed, keep them)
        //
        // We do NOT carry over real-ID messages from state — they are
        // either already in incoming (server returned them) or they arrived
        // via replaceOptimisticWithReal AFTER the fetch started, meaning the
        // server WILL include them in incoming (same request window).
        // Carrying them over was the source of the duplicate.

        const merged = new Map<string, Message>();

        // 1. Server messages are the ground truth
        incoming.forEach((m: Message) => merged.set(m.id, m));

        // 2. Late optimistics survive (will be replaced by WS shortly)
        lateOptimistics.forEach((m: Message) => merged.set(m.id, m));

        state.messages = Array.from(merged.values()).sort(
          (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        );

        state._optimisticAtFetchStart = [];
      })

      .addCase(sendPrivateMessage.fulfilled, (state, action) => {
        if (action.payload) {
          const chat = state.chats.find(c => c.chatId === action.payload.chatId);
          if (chat) {
            chat.lastMessage = action.payload.content;
            chat.lastMessageAt = action.payload.sentAt;
          }
        }
      })

      .addCase(sendGroupMessage.fulfilled, (state, action) => {
        if (action.payload) {
          const chat = state.chats.find(c => c.chatId === action.payload.chatId);
          if (chat) {
            chat.lastMessage = action.payload.content;
            chat.lastMessageAt = action.payload.sentAt;
          }
        }
      })

      .addCase(markRead.fulfilled, (state, action) => {
        const chat = state.chats.find(c => c.chatId === action.payload);
        if (chat) chat.unreadCount = 0;

        if (state.selectedChatId === action.payload) {
          state.messages.forEach(m => {
            if (m.status !== 'READ') m.status = 'READ';
          });
        }
      });
  }
});

export const {
  setSelectedChat,
  clearSelectedChat,
  receiveMessage,
  updateMessageStatus,
  replaceOptimisticWithReal,
  deleteOptimisticById,
  markAllMessagesRead,
  deleteMessageLocally,
  setTyping,
  updateOnlineUsers,
  setUserOnline,
  setUserOffline,
  addSystemMessage,
  updateChatLastMessage,
  updateChatAvatar,
  promoteTempChat
} = chatSlice.actions;

export default chatSlice.reducer;