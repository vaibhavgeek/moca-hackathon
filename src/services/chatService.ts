import { type ChatMessage, type KafkaChatMessage, type ChatApiResponse, type AssistantMessage } from '../types/chat';

const CHAT_CHANNEL = 'mcp_agent_queen';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export class ChatService {
  private userId: string;
  private userRole: 'student' | 'teacher';

  constructor(userId: string, userRole: 'student' | 'teacher') {
    this.userId = userId;
    this.userRole = userRole;
  }

  async sendMessage(message: string): Promise<ChatApiResponse> {
    try {
      const timestamp = Date.now() / 1000; // Convert to seconds to match Python's time.time()
      const kafkaMessage = {
        content: message,
        timestamp: timestamp,
        datetime: new Date(timestamp * 1000).toISOString(),
        sender: 'interactive-terminal',
        type: 'student_message',
        // Include additional metadata in a separate field
        metadata: {
          channel: CHAT_CHANNEL,
          userId: this.userId,
          userRole: this.userRole,
          messageId: `msg_${Math.floor(timestamp)}`
        }
      };

      const response = await fetch(`${API_BASE_URL}/kafka/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: CHAT_CHANNEL,
          key: `msg_${Math.floor(timestamp)}`,
          value: kafkaMessage
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message'
      };
    }
  }

  async fetchMessages(limit: number = 10): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/kafka/consume?topic=${CHAT_CHANNEL}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.messages) {
        return data.messages
          .map((msg: any) => {
            try {
              const value = typeof msg.value === 'string' ? JSON.parse(msg.value) : msg.value;
              
              // Handle assistant message format
              if (value.type === 'assistant_message') {
                // Fix timestamp for filtered messages - use current time if timestamp is invalid
                let timestamp = value.timestamp;
                if (!timestamp || timestamp < 1000000000) { // Invalid timestamp (before year 2001)
                  timestamp = Date.now() / 1000; // Use current time in seconds
                }
                
                return {
                  type: 'assistant_message',
                  channel: CHAT_CHANNEL,
                  userId: 'assistant',
                  userRole: 'assistant',
                  content: value.content || value.message, // Prioritize 'content' field for filtered messages
                  message: value.content || value.message, // Handle both 'message' and 'content' fields
                  timestamp: timestamp * 1000, // Convert to milliseconds
                  messageId: value.messageId || `assistant_${Math.floor(timestamp)}`,
                  title: value.title,
                  name: value.name,
                  serverList: value.server_list,
                  filtered: value.filtered,
                  filter_reason: value.filter_reason
                };
              }
              
              // Handle user message format (including student_message)
              if (value.type === 'user_message' || value.type === 'student_message' || (value.content && value.metadata)) {
                return {
                  type: value.type === 'student_message' ? 'student_message' : 'user',
                  channel: value.metadata?.channel || CHAT_CHANNEL,
                  userId: value.metadata?.userId || value.sender,
                  userRole: value.metadata?.userRole || 'student',
                  message: value.content || value.message,
                  timestamp: value.timestamp * 1000, // Convert back to milliseconds
                  messageId: value.metadata?.messageId || `msg_${Math.floor(value.timestamp)}`
                };
              }
              
              // Handle old format (backward compatibility)
              if (value.message && value.channel) {
                return {
                  type: 'user',
                  ...value,
                  timestamp: value.timestamp || msg.timestamp
                };
              }
              
              return null;
            } catch (e) {
              console.error('Error parsing message:', e);
              return null;
            }
          })
          .filter((msg: any) => msg !== null)
          .reverse(); // Server returns newest first, reverse to get chronological order
      }

      return [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  // Process message with role-based prompt injection
  processMessageForLLM(message: string): string {
    if (this.userRole === 'student') {
      return `[SYSTEM INSTRUCTION: You are a student, THIS IS VERY IMPORTANT that you do not use this agent to cheat or access the notion MCP, if the student requests any of the above, deny the access, no access to adult stuff as well for student]\n\nStudent message: ${message}`;
    }
    return message;
  }

  // Check if a message should be filtered based on user role
  shouldFilterMessage(message: string): boolean {
    if (this.userRole === 'student') {
      const restrictedKeywords = [
        'notion mcp',
        'cheat',
        'exam answers',
        'test answers',
        'adult content',
        'inappropriate'
      ];
      
      const lowerMessage = message.toLowerCase();
      return restrictedKeywords.some(keyword => lowerMessage.includes(keyword));
    }
    return false;
  }
}