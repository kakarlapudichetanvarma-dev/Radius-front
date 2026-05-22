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
  _locallyReadChatIds: string[];
}

function loadPersistedSelection(): {
  selectedChatId: string | null;
  selectedChat: ChatSummary | null;
  chats: ChatSummary[];
} {
  try {
    const selectedChatId = localStorage.getItem('chat_selectedChatId');
    const selectedChatRaw = localStorage.getItem('chat_selectedChat');
    const chatsRaw = localStorage.getItem('chat_chats');
    return {
      selectedChatId: selectedChatId ?? null,
      selectedChat: selectedChatRaw ? JSON.parse(selectedChatRaw) : null,
      chats: chatsRaw ? JSON.parse(chatsRaw) : [],
    };
  } catch {
    return { selectedChatId: null, selectedChat: null, chats: [] };
  }
}

function deduplicateChats(chats: ChatSummary[]): ChatSummary[] {
  const seen = new Map<string, ChatSummary>();
  for (const chat of chats) {
    const existing = seen.get(chat.chatId);
    if (!existing) {
      seen.set(chat.chatId, chat);
    } else {
      const existingTime = existing.lastMessageAt ? new Date(existing.lastMessageAt).getTime() : 0;
      const incomingTime = chat.lastMessageAt ? new Date(chat.lastMessageAt).getTime() : 0;
      if (incomingTime > existingTime) seen.set(chat.chatId, chat);
    }
  }
  return Array.from(seen.values());
}

function addToReadList(list: string[], chatId: string): string[] {
  return list.includes(chatId) ? list : [...list, chatId];
}

const persisted = loadPersistedSelection();

const initialState: ChatState = {
  chats: deduplicateChats(persisted.chats),
  selectedChatId: persisted.selectedChatId,
  selectedChat: persisted.selectedChat,
  messages: [],
  loadingChats: false,
  loadingMessages: false,
  typingUser: null,
  onlineUsers: [],
  error: null,
  chatClosedAt: {},
  _optimisticAtFetchStart: [],
  _locallyReadChatIds: [],
};

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
    setSelectedChat: (state, action: PayloadAction<ChatSummary | null>) => {
      if (action.payload === null) {
        if (state.selectedChatId) {
          state.chatClosedAt[state.selectedChatId] = new Date().toISOString();
        }
        state.selectedChat = null;
        state.selectedChatId = null;
        state.messages = [];
        state._optimisticAtFetchStart = [];
        localStorage.removeItem('chat_selectedChatId');
        localStorage.removeItem('chat_selectedChat');
        return;
      }

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

      localStorage.setItem('chat_selectedChatId', action.payload.chatId);
      localStorage.setItem('chat_selectedChat', JSON.stringify(action.payload));

      const chat = state.chats.find(c => c.chatId === action.payload!.chatId);
      if (chat) chat.unreadCount = 0;
      state._locallyReadChatIds = addToReadList(state._locallyReadChatIds, action.payload.chatId);
    },

    clearSelectedChat: (state) => {
      if (state.selectedChatId) {
        state.chatClosedAt[state.selectedChatId] = new Date().toISOString();
      }
      state.selectedChat = null;
      state.selectedChatId = null;
      state.messages = [];
      state._optimisticAtFetchStart = [];
      localStorage.removeItem('chat_selectedChatId');
      localStorage.removeItem('chat_selectedChat');
    },

    clearChatState: (state) => {
      state.chats = [];
      state.selectedChatId = null;
      state.selectedChat = null;
      state.messages = [];
      state.typingUser = null;
      state.onlineUsers = [];
      state.error = null;
      state.chatClosedAt = {};
      state._optimisticAtFetchStart = [];
      state._locallyReadChatIds = [];
      localStorage.removeItem('chat_selectedChatId');
      localStorage.removeItem('chat_selectedChat');
      localStorage.removeItem('chat_chats');
    },

    receiveMessage: (state, action: PayloadAction<Message>) => {
      const msg = action.payload;
      const exists = state.messages.some(m => m.id === msg.id);
      if (!exists) {
        state.messages = [...state.messages, msg];
      }

      const chatIndex = state.chats.findIndex(c => c.chatId === msg.chatId);
      if (chatIndex !== -1) {
        const chat = state.chats[chatIndex];
        chat.lastMessage = msg.content;
        chat.lastMessageAt = msg.sentAt;

        if (state.selectedChatId !== msg.chatId) {
          state._locallyReadChatIds = state._locallyReadChatIds.filter(id => id !== msg.chatId);
          chat.unreadCount = (chat.unreadCount || 0) + 1;
        }

        // ✅ Bubble to top on new message
        const updated = { ...chat };
        state.chats.splice(chatIndex, 1);
        state.chats.unshift(updated);
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
        state.messages.splice(optimisticIndex, 1);
      } else if (optimisticIndex !== -1) {
        state.messages[optimisticIndex] = realMessage;
      } else if (!realExists) {
        state.messages.push(realMessage);
      }

      const chatIndex = state.chats.findIndex(c => c.chatId === realMessage.chatId);
      if (chatIndex !== -1) {
        const chat = state.chats[chatIndex];
        chat.lastMessage = realMessage.content;
        chat.lastMessageAt = realMessage.sentAt;

        // ✅ Bubble to top when our sent message is confirmed
        const updated = { ...chat };
        state.chats.splice(chatIndex, 1);
        state.chats.unshift(updated);
      }
    },

    deleteOptimisticById: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter(m => m.id !== action.payload);
    },

    markAllMessagesRead: (state, action: PayloadAction<string>) => {
      if (state.selectedChatId === action.payload) {
        state.messages.forEach(m => { if (m.status !== 'READ') m.status = 'READ'; });
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

    // ✅ FIXED: bubbles chat to top + correctly increments unread
    updateChatLastMessage: (
state,
action
) => {

const incomingMsg =
action.payload;

const chatIndex =
state.chats.findIndex(
c =>
c.chatId ===
incomingMsg.chatId
);

if (chatIndex !== -1) {
const updatedChat = {
  ...state.chats[
    chatIndex
  ]
};

// ✅ update preview only
updatedChat.lastMessage =
  incomingMsg.content;

updatedChat.lastMessageAt =
  incomingMsg.sentAt;

// ✅ DO NOT increment unread here

// move chat to top
state.chats.splice(
  chatIndex,
  1
);

state.chats.unshift(
  updatedChat
);
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
      state.chats = state.chats.filter(
        c =>
          !(c.chatId.startsWith('temp-') && c.otherParticipantUsername === action.payload.otherParticipantUsername) &&
          c.chatId !== action.payload.chatId
      );
      state.chats.unshift(action.payload);

      if (state.selectedChatId?.startsWith('temp-') || state.selectedChatId === action.payload.chatId) {
        state.selectedChatId = action.payload.chatId;
        state.selectedChat = action.payload;
        localStorage.setItem('chat_selectedChatId', action.payload.chatId);
        localStorage.setItem('chat_selectedChat', JSON.stringify(action.payload));
      }

      state.chats = deduplicateChats(state.chats);
      localStorage.setItem('chat_chats', JSON.stringify(state.chats));
    },

    resetUnread: (state, action: PayloadAction<string>) => {
      const chat = state.chats.find(c => c.chatId === action.payload);
      if (chat) chat.unreadCount = 0;
      state._locallyReadChatIds = addToReadList(state._locallyReadChatIds, action.payload);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.fulfilled, (state, action) => {
        const incoming: ChatSummary[] = action.payload || [];
        const tempChats = state.chats.filter(c => c.chatId.startsWith('temp-'));

        const merged: ChatSummary[] = incoming.map(serverChat => {
          const inMemory = state.chats.find(c => c.chatId === serverChat.chatId);
          if (!inMemory) return serverChat;

          const serverTime = serverChat.lastMessageAt ? new Date(serverChat.lastMessageAt).getTime() : 0;
          const memoryTime = inMemory.lastMessageAt ? new Date(inMemory.lastMessageAt).getTime() : 0;
          const base = memoryTime > serverTime ? inMemory : serverChat;

          if (state._locallyReadChatIds.includes(serverChat.chatId)) {
            return { ...base, unreadCount: 0 };
          }

          return {
  ...base,
  unreadCount: state._locallyReadChatIds.includes(serverChat.chatId)
    ? 0
    : Math.max(serverChat.unreadCount || 0, inMemory.unreadCount || 0)
};
        });

        for (const temp of tempChats) {
          const alreadyHasReal = merged.some(
            c => c.type === 'PRIVATE' && c.otherParticipantUsername === temp.otherParticipantUsername
          );
          if (!alreadyHasReal) merged.push(temp);
        }

        state.chats = deduplicateChats(merged);
        state.loadingChats = false;
        localStorage.setItem('chat_chats', JSON.stringify(state.chats));
      })

      .addCase(fetchMessages.pending, (state) => {
        state.loadingMessages = true;
        state._optimisticAtFetchStart = state.messages.filter(m => m.id.startsWith('temp-'));
      })

      .addCase(fetchMessages.fulfilled, (state, action) => {
  state.loadingMessages = false;
  const incoming: Message[] = action.payload || [];

  // ✅ Keep ALL optimistic messages regardless of snapshot timing
  const allOptimistics = state.messages.filter(m => m.id.startsWith('temp-'));

  const merged = new Map<string, Message>();
  incoming.forEach((m: Message) => merged.set(m.id, m));
  // Optimistics added last so they override any server version
  allOptimistics.forEach((m: Message) => merged.set(m.id, m));

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
        state._locallyReadChatIds = addToReadList(state._locallyReadChatIds, action.payload);

        if (state.selectedChatId === action.payload) {
          state.messages.forEach(m => { if (m.status !== 'READ') m.status = 'READ'; });
        }
      });
  }
});

export const {
  setSelectedChat,
  clearSelectedChat,
  clearChatState,
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
  promoteTempChat,
  resetUnread,
} = chatSlice.actions;

export default chatSlice.reducer;