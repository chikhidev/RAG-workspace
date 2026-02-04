/**
 * Conversation Service - Handles saving and loading chat conversations from backend
 */

export interface ConversationMessage {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  extra_data?: {
    sources?: Array<{ docName: string; text: string }>;
    editProposals?: Array<any>;
    thoughts?: Array<any>;
    model?: string;
  };
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  messages?: ConversationMessage[];
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
  has_more: boolean;
}

export interface MessagesResponse {
  messages: ConversationMessage[];
  total: number;
  has_more: boolean;
}

class ConversationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api';
  }

  /**
   * Get list of user's conversations with pagination
   * Returns newest conversations first
   */
  async listConversations(
    authToken: string,
    skip: number = 0,
    limit: number = 20
  ): Promise<ConversationListResponse> {
    const response = await fetch(
      `${this.baseUrl}/conversations?skip=${skip}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new conversation
   */
  async createConversation(
    authToken: string,
    title?: string
  ): Promise<Conversation> {
    const response = await fetch(`${this.baseUrl}/conversations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create conversation: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get a conversation with all its messages
   */
  async getConversation(
    authToken: string,
    conversationId: number
  ): Promise<Conversation> {
    const response = await fetch(
      `${this.baseUrl}/conversations/${conversationId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get messages for a conversation with pagination
   * Use for lazy loading older messages
   * skip=0 gets newest messages, skip=50 gets older ones, etc.
   */
  async getMessages(
    authToken: string,
    conversationId: number,
    skip: number = 0,
    limit: number = 50
  ): Promise<MessagesResponse> {
    const response = await fetch(
      `${this.baseUrl}/conversations/${conversationId}/messages?skip=${skip}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Add a message to a conversation
   */
  async addMessage(
    authToken: string,
    conversationId: number,
    message: {
      role: 'user' | 'assistant' | 'system';
      content: string;
      extra_data?: ConversationMessage['extra_data'];
    }
  ): Promise<ConversationMessage> {
    const response = await fetch(
      `${this.baseUrl}/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to add message: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete a conversation and all its messages
   */
  async deleteConversation(
    authToken: string,
    conversationId: number
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/conversations/${conversationId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete conversation: ${response.statusText}`);
    }
  }

  /**
   * Update conversation title
   */
  async updateConversation(
    authToken: string,
    conversationId: number,
    title: string
  ): Promise<Conversation> {
    const response = await fetch(
      `${this.baseUrl}/conversations/${conversationId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update conversation: ${response.statusText}`);
    }

    return response.json();
  }
}

export const conversationService = new ConversationService();
