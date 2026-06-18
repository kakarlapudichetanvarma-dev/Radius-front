export interface AiChatRequest {
  message: string;
  conversationId?: string | null;
  contextChatId?: string | null;
}

export interface AiChatResponse {
  conversationId: string;
  role: string;       // "MODEL"
  content: string;
  sentAt: string;
  type: string;        // "CHAT_REPLY" | "CODE_REPLY" | "ERROR" | "SUMMARY" | ...
}

export interface AiMessageItem {
  role: string;         // "USER" | "MODEL"
  content: string;
  sentAt: string;
}

export interface AiConversationHistoryResponse {
  conversationId: string;
  conversationType: string;
  messages: AiMessageItem[];
}