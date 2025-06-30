export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  message: string;
  timestamp: number;
  userId?: string;
  userRole?: 'student' | 'teacher';
  title?: string;
  name?: string;
  serverList?: string[];
}

export interface KafkaChatMessage {
  channel: string;
  userId: string;
  userRole: 'student' | 'teacher';
  message: string;
  timestamp: number;
  messageId: string;
}

export interface AssistantMessage {
  type: 'assistant_message' | 'user_message';
  message: string;
  title?: string;
  name?: string;
  highlight_tool?: string;
  server_list?: string[];
  timestamp: number;
  sender?: string;
  content?: string;
  datetime?: string;
  metadata?: {
    channel: string;
    userId: string;
    userRole: string;
    messageId: string;
  };
}

export interface ChatApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export type { ChatApiResponse as ChatApiResponseType };