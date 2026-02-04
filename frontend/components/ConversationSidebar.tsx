import React, { useCallback, useRef, useEffect } from 'react';
import { MessageSquare, Plus, Trash2, X, ChevronRight, Loader2 } from 'lucide-react';

interface Conversation {
  id: number;
  title: string;
  created_at: string;
}

interface ConversationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  currentConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: number) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onLoadMore,
  hasMore,
  isLoading
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Infinite scroll - load more when reaching bottom
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      onLoadMore();
    }
  }, [onLoadMore, isLoading, hasMore]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-96 bg-brand-darker/90 backdrop-blur-sm border-r border-brand-border rounded-r-xl
        z-50 transform transition-transform duration-300 ease-out
        shadow-lg
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brand-border">
          <h2 className="text-sm font-bold text-gray-200 flex items-center gap-2">
            <MessageSquare size={16} />
            Conversations
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onNewChat}
              className="p-2 hover:bg-brand-base rounded-lg transition-colors text-brand-accent"
              title="New Chat"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-brand-base rounded-lg transition-colors text-gray-400"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-2 space-y-1"
        >
          {conversations.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500 text-sm">
              <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
              No conversations yet
            </div>
          )}

          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`
                group relative flex items-center gap-2 p-3 rounded-xl cursor-pointer
                transition-all duration-200
                ${currentConversationId === conversation.id
                  ? 'bg-brand-accent/10 border border-brand-accent/30'
                  : 'hover:bg-brand-base border border-transparent'
                }
              `}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <ChevronRight
                size={14}
                className={`
                  text-gray-500 transition-transform duration-200
                  ${currentConversationId === conversation.id ? 'rotate-90 text-brand-accent' : ''}
                `}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 truncate font-medium">
                  {conversation.title}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(conversation.created_at)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conversation.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg transition-all text-gray-500 hover:text-red-400"
                title="Delete conversation"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={20} className="animate-spin text-brand-accent" />
            </div>
          )}

          {/* Load more indicator */}
          {hasMore && !isLoading && (
            <div className="text-center py-2">
              <button
                onClick={onLoadMore}
                className="text-xs text-gray-500 hover:text-brand-accent transition-colors"
              >
                Load older conversations...
              </button>
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default ConversationSidebar;
