import React, { useRef, useEffect, useState } from 'react';
import { Message, PipelineStatus } from '../types';
import { Search, Bot, Loader2, CheckCircle2, ChevronDown, ChevronRight, FileText, Sparkles, Copy, Check, Zap, Cpu, RefreshCw, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SUPPORTED_MODELS } from '../services/modelService';

interface Props {
  messages: Message[];
  expanderModelId: string;
  reasonerModelId: string;
  onRetry: (id: string) => void;
  onClearChat: () => void;
}

const LiveTimer: React.FC<{ status: PipelineStatus; activeAt: PipelineStatus; finalDuration?: number }> = ({ status, activeAt, finalDuration }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: any;
    if (status === activeAt) {
      const startTime = performance.now();
      interval = setInterval(() => {
        setElapsed((performance.now() - startTime) / 1000);
      }, 100);
    } else if (finalDuration !== undefined) {
      setElapsed(finalDuration);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [status, activeAt, finalDuration]);

  if (elapsed === 0 && status !== activeAt && finalDuration === undefined) return null;

  return (
    <div className="font-mono text-[10px] text-brand-accent font-bold tabular-nums">
      {elapsed.toFixed(1)}s
    </div>
  );
};

const CodeBlock = ({ children, className, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : '';
  const codeContent = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isInline = !className;

  if (isInline) {
    return (
      <code className="bg-gray-100 dark:bg-brand-border px-1.5 py-0.5 rounded text-brand-accent font-mono text-[0.9em]" {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-6 rounded-xl overflow-hidden border border-gray-200 dark:border-brand-border shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-brand-darker border-b border-gray-200 dark:border-brand-border">
        <span className="text-[10px] font-mono text-gray-400 dark:text-brand-muted uppercase tracking-wider">
          {lang || 'code'}
        </span>
        <button 
          onClick={handleCopy}
          className="p-1 hover:bg-gray-200 dark:hover:bg-brand-base rounded transition-colors text-gray-400 hover:text-brand-accent"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="overflow-x-auto bg-[#0d1117] p-4">
        <pre className="m-0">
          <code className={`${className} font-mono text-[13px] leading-relaxed text-[#e6edf3]`} {...props}>
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
};

const PipelineDetails: React.FC<{ msg: Message }> = ({ msg }) => {
  const [isExpendedToggled, setIsExpandedToggled] = useState(false);
  const [isFilesToggled, setIsFilesToggled] = useState(false);

  if (!msg.status || msg.role === 'user') return null;

  const usedFiles = msg.sources ? Array.from(new Set(msg.sources.map(s => s.docName))) : [];

  return (
    <div className="w-full max-w-2xl space-y-2 mt-6">
      {/* Step 1: Query Expansion */}
      <div className="bg-white dark:bg-brand-darker border border-gray-100 dark:border-brand-border rounded-xl overflow-hidden transition-all duration-300">
        <div className="w-full flex items-center justify-between p-3.5">
          <button 
            onClick={() => setIsExpandedToggled(!isExpendedToggled)}
            className="flex items-center gap-3 text-[10px] font-serif font-bold text-gray-500 dark:text-gray-500 uppercase tracking-[0.15em] hover:text-brand-accent transition-colors"
          >
            Query Expansion
            {isExpendedToggled ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
          </button>
          <div className="flex items-center gap-3">
            <LiveTimer status={msg.status} activeAt="expanding" finalDuration={msg.expansionDuration} />
            {msg.expandedQuery ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Loader2 size={14} className="animate-spin text-brand-accent" />}
          </div>
        </div>
        
        {isExpendedToggled && (
          <div className="px-3.5 pb-3.5 animate-[fadeIn_0.2s_ease-out]">
            {msg.expandedQuery ? (
              <div className="text-[12px] font-mono text-gray-400 dark:text-gray-400 bg-gray-50 dark:bg-brand-base p-3 border border-gray-100 dark:border-brand-border rounded-lg">
                {msg.expandedQuery}
              </div>
            ) : (
              <div className="h-10 shimmer rounded-lg opacity-20"></div>
            )}
          </div>
        )}
      </div>

      {/* Step 2: Vault Search */}
      {(msg.expandedQuery || msg.status === 'searching') && (
        <div className="bg-white dark:bg-brand-darker border border-gray-100 dark:border-brand-border rounded-xl overflow-hidden animate-[fadeIn_0.5s_ease-out]">
          <div className="w-full flex items-center justify-between p-3.5">
            <button 
              onClick={() => setIsFilesToggled(!isFilesToggled)}
              className="flex items-center gap-3 text-[10px] font-serif font-bold text-gray-500 dark:text-gray-500 uppercase tracking-[0.15em] hover:text-brand-accent transition-colors"
            >
              Vault Search
              {usedFiles.length > 0 && (
                isFilesToggled ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />
              )}
            </button>
            <div className="flex items-center gap-3">
              <LiveTimer status={msg.status} activeAt="searching" finalDuration={msg.searchDuration} />
              {msg.sources ? (
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-bold px-1.5 py-0.5 rounded border border-emerald-500/20">
                    {msg.sources.length} matches
                  </span>
                  <CheckCircle2 size={14} className="text-emerald-500" />
                </div>
              ) : (
                <Loader2 size={14} className="animate-spin text-gray-300 dark:text-gray-600" />
              )}
            </div>
          </div>
          
          {isFilesToggled && usedFiles.length > 0 && (
            <div className="px-3.5 pb-3.5 border-t border-gray-50 dark:border-brand-border pt-3 animate-[fadeIn_0.2s_ease-out]">
              <div className="flex flex-wrap gap-2">
                {usedFiles.map((name, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-brand-base rounded border border-gray-100 dark:border-brand-border text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                    <FileText size={10} className="text-brand-accent" />
                    {name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Synthesis / Reasoning */}
      {(msg.status === 'reasoning' || msg.status === 'completed') && (
        <div className="bg-white dark:bg-brand-darker border border-gray-100 dark:border-brand-border p-3.5 flex items-center justify-between animate-[fadeIn_0.5s_ease-out] rounded-xl">
          <div className="flex items-center gap-3 text-[10px] font-serif font-bold text-gray-500 dark:text-brand-accent uppercase tracking-[0.15em]">
            {msg.status === 'completed' ? 'Synthesis Complete' : 'Synthesizing Response'}
          </div>
          <div className="flex items-center gap-3">
            <LiveTimer status={msg.status} activeAt="reasoning" finalDuration={msg.reasoningDuration} />
            {msg.status === 'completed' ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Loader2 size={14} className="animate-spin text-brand-accent" />}
          </div>
        </div>
      )}
    </div>
  );
};

export const ChatInterface: React.FC<Props> = ({ messages, expanderModelId, reasonerModelId, onRetry, onClearChat }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const expanderModel = SUPPORTED_MODELS.find(m => m.id === expanderModelId);
  const reasonerModel = SUPPORTED_MODELS.find(m => m.id === reasonerModelId);

  return (
    <div className="flex flex-col h-full bg-[#F8F9FB] dark:bg-brand-base flex-1 transition-colors relative">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-40"></div>
      
      {/* Top Bar for active models */}
      <div className="sticky top-0 z-50 w-full h-16 bg-white/70 dark:bg-brand-base/70 backdrop-blur-md border-b border-gray-100 dark:border-brand-border flex items-center justify-center px-8 transition-all">
        <div className="flex items-center gap-8 max-w-4xl w-full justify-between">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 dark:border-brand-border flex items-center justify-center overflow-hidden p-1.5 transition-transform hover:scale-105">
                    {expanderModel && <img src={expanderModel.logo} alt="" className="max-w-full max-h-full object-contain" />}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-gray-500 font-bold leading-none mb-1 flex items-center gap-1">
                       Context expander
                    </span>
                    <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300 leading-none truncate max-w-[120px]">
                       {expanderModel?.name || 'Unknown'}
                    </span>
                 </div>
              </div>

              <div className="h-6 w-[1px] bg-gray-200 dark:bg-brand-border mx-2"></div>

              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 dark:border-brand-border flex items-center justify-center overflow-hidden p-1.5 transition-transform hover:scale-105">
                    {reasonerModel && <img src={reasonerModel.logo} alt="" className="max-w-full max-h-full object-contain" />}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-gray-500 font-bold leading-none mb-1 flex items-center gap-1">
                       Reasoner
                    </span>
                    <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300 leading-none truncate max-w-[120px]">
                       {reasonerModel?.name || 'Unknown'}
                    </span>
                 </div>
              </div>
           </div>

           <button 
             onClick={onClearChat}
             title="Clear Chat"
             className="p-2.5 hover:bg-gray-100 dark:hover:bg-brand-border rounded-xl transition-all text-gray-400 hover:text-red-500 flex items-center gap-2 group"
           >
              <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">Clear</span>
           </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-12 space-y-20 relative z-10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-12 pb-20">
            <h1 className="text-[32px] font-serif italic text-gray-900 dark:text-white tracking-tight mb-4 animate-blur-text">
               The Synthesis Engine is ready.
            </h1>
            <p className="text-[14px] text-gray-400 dark:text-brand-muted max-w-sm leading-relaxed animate-blur-text [animation-delay:0.2s]">
               Provide documents in the Knowledge Vault and start a reasoned conversation.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="max-w-4xl mx-auto w-full fade-in">
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-3`}>
                <div className={`px-7 py-6 rounded-xl leading-relaxed text-[15px] ${
                  msg.role === 'user' 
                    ? 'text-gray-700 dark:text-gray-300 max-w-xl' 
                    : 'bg-white dark:bg-brand-darker text-gray-800 dark:text-gray-200 w-full border border-gray-100 dark:border-brand-border'
                }`}>
                  {msg.status === 'completed' || msg.role === 'user' ? (
                     <div className={`prose dark:prose-invert ${msg.role === 'assistant' ? 'animate-blur-text' : ''}`}>
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code: CodeBlock
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                     </div>
                  ) : msg.status === 'error' ? (
                    <div className="flex flex-col items-start gap-4">
                       <p className="text-red-400 italic text-[13px]">Critical failure in pipeline or request timed out.</p>
                       <button 
                        onClick={() => onRetry(msg.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-[12px] font-bold transition-all"
                       >
                          <RefreshCw size={14} />
                          Retry Generation
                       </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 py-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse"></div>
                      <div className="text-[11px] font-mono text-gray-400 dark:text-brand-muted uppercase tracking-widest flex items-center gap-2">
                        Synthesizing
                        <LiveTimer status={msg.status} activeAt="reasoning" finalDuration={msg.reasoningDuration} />
                      </div>
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