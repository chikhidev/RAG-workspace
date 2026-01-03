import React, { useRef, useEffect, useState } from 'react';
import { Message } from '../types';
import { Search, Bot, Loader2, CheckCircle2, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  messages: Message[];
}

const PipelineDetails: React.FC<{ msg: Message }> = ({ msg }) => {
  const [isExpendedToggled, setIsExpandedToggled] = useState(false);
  const [isFilesToggled, setIsFilesToggled] = useState(false);

  if (!msg.status || msg.role === 'user') return null;

  const usedFiles = msg.sources ? Array.from(new Set(msg.sources.map(s => s.docName))) : [];

  return (
    <div className="w-full max-w-2xl space-y-2 mt-4">
      {/* Brain 1: Expansion */}
      <div className="bg-white dark:bg-brand-darker border border-gray-100 dark:border-brand-border rounded-2xl overflow-hidden transition-all duration-300 message-shadow">
        <button 
          onClick={() => setIsExpandedToggled(!isExpendedToggled)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-brand-base transition-colors"
        >
          <div className="flex items-center gap-3 text-[11px] font-semibold text-purple-600 dark:text-brand-accent uppercase tracking-widest">
            Brain 1 Expansion
          </div>
          <div className="flex items-center gap-3">
            {msg.expandedQuery ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Loader2 size={14} className="animate-spin text-purple-400 dark:text-brand-accent" />}
            {isExpendedToggled ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
          </div>
        </button>
        
        {isExpendedToggled && (
          <div className="px-4 pb-4 animate-[fadeIn_0.2s_ease-out]">
            {msg.expandedQuery ? (
              <div className="text-[12px] font-mono text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-brand-base p-3 border border-gray-100 dark:border-brand-border rounded-xl">
                {msg.expandedQuery}
              </div>
            ) : (
              <div className="h-10 shimmer rounded-xl opacity-20"></div>
            )}
          </div>
        )}
      </div>

      {/* Knowledge Base Scan & File Usage */}
      {(msg.expandedQuery || msg.status === 'searching') && (
        <div className="bg-white dark:bg-brand-darker border border-gray-100 dark:border-brand-border rounded-2xl overflow-hidden message-shadow animate-[fadeIn_0.5s_ease-out]">
          <button 
            onClick={() => setIsFilesToggled(!isFilesToggled)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-brand-base transition-colors"
          >
            <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              <Search size={16} className="text-gray-300 dark:text-gray-600" />
              Knowledge Base
            </div>
            <div className="flex items-center gap-3">
              {msg.sources ? (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
                    {msg.sources.length} hits
                  </span>
                  <CheckCircle2 size={14} className="text-emerald-500" />
                </div>
              ) : (
                <Loader2 size={14} className="animate-spin text-gray-300 dark:text-gray-600" />
              )}
              {usedFiles.length > 0 && (
                isFilesToggled ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />
              )}
            </div>
          </button>
          
          {isFilesToggled && usedFiles.length > 0 && (
            <div className="px-4 pb-4 border-t border-gray-50 dark:border-brand-border pt-3 animate-[fadeIn_0.2s_ease-out]">
              <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-2 tracking-tighter">Sources Consulted</div>
              <div className="flex flex-wrap gap-2">
                {usedFiles.map((name, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-brand-base rounded-md border border-gray-100 dark:border-brand-border text-[11px] text-gray-600 dark:text-gray-400 font-medium">
                    <FileText size={10} className="text-purple-400 dark:text-brand-accent" />
                    {name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Thought for {time} */}
      {(msg.sources && (msg.status === 'reasoning' || msg.status === 'completed')) && (
        <div className="bg-white dark:bg-brand-darker border border-gray-100 dark:border-brand-border p-4 flex items-center justify-between message-shadow animate-[fadeIn_0.5s_ease-out] rounded-xl">
          <div className="flex items-center gap-3 text-[11px] font-semibold text-purple-600 dark:text-brand-accent uppercase tracking-widest">
            {msg.status === 'completed' && msg.reasoningDuration 
              ? `Thought for ${msg.reasoningDuration.toFixed(1)}s` 
              : 'Thinking...'}
          </div>
          {msg.status === 'reasoning' ? (
            <div className="flex items-center gap-2">
               <span className="text-[10px] text-purple-400 dark:text-brand-accent animate-pulse font-bold">Deep Reasoning...</span>
               <Loader2 size={14} className="animate-spin text-purple-400 dark:text-brand-accent" />
            </div>
          ) : <CheckCircle2 size={14} className="text-emerald-500" />}
        </div>
      )}
    </div>
  );
};

export const ChatInterface: React.FC<Props> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-[#F8F9FB] dark:bg-brand-base flex-1 transition-colors">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-16">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 space-y-8">
            <div className="p-8 rounded-full bg-white dark:bg-brand-darker shadow-xl shadow-purple-500/5 dark:shadow-none">
              <Bot size={60} className="text-purple-200 dark:text-brand-accent/20" />
            </div>
            <div className="text-center space-y-3">
              <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 tracking-tight">System Ready</p>
              <p className="text-sm max-w-sm mx-auto text-gray-400 dark:text-gray-500 leading-relaxed">
                Your knowledge vault is indexed. Send a message in the right panel to begin.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="max-w-4xl mx-auto w-full fade-in">
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-4`}>
                <div className={`p-6 rounded-3xl leading-relaxed text-[15px] ${
                  msg.role === 'user' 
                    ? 'bg-gray-100 dark:bg-brand-darker text-gray-700 dark:text-gray-300 max-w-xl' 
                    : 'bg-white dark:bg-brand-darker text-gray-800 dark:text-gray-200 w-full message-shadow border border-gray-50 dark:border-brand-border'
                }`}>
                  {msg.status === 'completed' || msg.role === 'user' ? (
                     <div className="prose dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                     </div>
                  ) : msg.status === 'error' ? (
                     <p className="text-red-400 italic">Failed to process request.</p>
                  ) : (
                    <div className="flex gap-1.5 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 dark:bg-brand-accent animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 dark:bg-brand-accent animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 dark:bg-brand-accent animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  )}
                </div>
                <PipelineDetails msg={msg} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};