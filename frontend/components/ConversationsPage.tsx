import React, { useEffect, useState } from 'react';
import { MessageSquare, Trash2, Clock, MessageCircle, Plus } from 'lucide-react';

interface Conversation {
  id: number;
  title: string;
  created_at: string;
  message_count?: number;
  last_message?: string;
}

interface ConversationsPageProps {
  token: string;
  onSelectConversation: (conversationId: number) => void;
  onNewConversation: () => void;
  onClose: () => void;
}

export const ConversationsPage: React.FC<ConversationsPageProps> = ({
  token,
  onSelectConversation,
  onNewConversation,
  onClose
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const BACKEND_URL = '/api';

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to load conversations');

      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the conversation
    
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`${BACKEND_URL}/conversations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete conversation');

      // Remove from list
      setConversations(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 bg-brand-base z-50 flex flex-col">
      <div className="border-b border-brand-border bg-brand-darker">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle size={20} className="mx-auto text-gray-600" />

            <h1 className="text-lg font-bold text-white">Conversations</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onNewConversation();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-brand-accent text-white hover:bg-brand-accent/80 transition-all flex items-center gap-2 text-sm font-medium"
            >
              <Plus size={16} />
              New Chat
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-brand-base border border-brand-border text-gray-300 hover:bg-brand-accent/10 hover:border-brand-accent hover:text-brand-accent transition-all text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle size={40} className="mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400 text-base">No conversations yet</p>
              <p className="text-gray-500 text-sm mt-1">Start chatting to create your first conversation</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => {
                    onSelectConversation(conversation.id);
                    onClose();
                  }}
                  className="group bg-brand-darker border border-brand-border rounded-lg p-3 hover:border-brand-accent hover:bg-brand-accent/5 transition-all cursor-pointer relative"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-white mb-1.5 group-hover:text-brand-accent transition-colors truncate">
                        {conversation.title}
                      </h3>
                      
                      {conversation.last_message && (
                        <p className="text-gray-400 text-xs line-clamp-2 mb-2">
                          {conversation.last_message}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{formatDate(conversation.created_at)}</span>
                        </div>
                        {conversation.message_count !== undefined && (
                          <div className="flex items-center gap-1">
                            <MessageCircle size={12} />
                            <span>{conversation.message_count} msgs</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDelete(conversation.id, e)}
                      disabled={deletingId === conversation.id}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      aria-label="Delete conversation"
                    >
                      {deletingId === conversation.id ? (
                        <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationsPage;
