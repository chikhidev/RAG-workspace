import React, { useRef, useEffect, useState } from 'react';
import { Message, PipelineStatus, Document, Chunk } from '../types';
import { Search, Box, Loader2, CheckCircle2, ChevronDown, ChevronRight, FileText, Sparkles, Copy, Check, Zap, Cpu, RefreshCw, Trash2, Send, AtSign, ArrowRight, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { SUPPORTED_MODELS } from '../services/modelService';

interface Props {
  messages: Message[];
  expanderModelId: string;
  reasonerModelId: string;
  onRetry: (id: string) => void;
  onRegenerate: (id: string) => void;
  onUpdateSources: (id: string, sources: Chunk[]) => void;
  onClearChat: () => void;
  inputPosition: 'floating' | 'sidebar';
  inputValue: string;
  setInputValue: (v: string) => void;
  onSend: (customValue?: string) => void;
  onStop: () => void;
  isProcessing: boolean;
  availableDocuments: Document[];
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
      <code className="bg-brand-border px-1.5 py-0.5 rounded text-brand-accent font-mono text-[0.9em]" {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-6 rounded-xl overflow-hidden border border-brand-border shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-brand-darker border-b border-brand-border">
        <span className="text-[10px] font-mono text-brand-muted uppercase tracking-wider">
          {lang || 'code'}
        </span>
        <button 
          onClick={handleCopy}
          className="p-1 hover:bg-brand-base rounded transition-colors text-gray-400 hover:text-brand-accent"
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

const ContextModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  chunks: Chunk[];
  onRemoveChunk: (index: number) => void;
  onRegenerate: () => void;
}> = ({ isOpen, onClose, fileName, chunks, onRemoveChunk, onRegenerate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-brand-darker w-[90vw] max-w-[1400px] h-[85vh] rounded-2xl border border-brand-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-brand-base/50 shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-100">Contexts from {fileName}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-brand-base rounded-lg transition-colors text-gray-400">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {chunks.length === 0 ? (
            <div className="text-center text-gray-500 py-8 text-sm">No contexts used from this file.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chunks.map((chunk, i) => (
                <div key={i} className="bg-brand-base border border-brand-border rounded-xl p-4 group relative hover:border-brand-accent/30 transition-colors h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-brand-border scrollbar-track-transparent pr-2">
                    <p className="text-[13px] text-gray-300 leading-relaxed font-mono whitespace-pre-wrap">{chunk.text}</p>
                  </div>
                  <button 
                    onClick={() => onRemoveChunk(i)}
                    className="absolute top-2 right-2 p-1.5 bg-brand-darker border border-brand-border rounded-lg text-gray-400 hover:text-red-400 hover:border-red-400/30 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                    title="Remove this context chunk"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-brand-border bg-brand-base/50 shrink-0 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-[12px] font-bold text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onRegenerate();
              onClose();
            }}
            className="px-4 py-2 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-lg text-[12px] font-bold transition-all flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Regenerate Response
          </button>
        </div>
      </div>
    </div>
  );
};

const PipelineDetails: React.FC<{ 
  msg: Message; 
  onViewContexts: (fileName: string, sources: Chunk[], messageId: string) => void;
}> = ({ msg, onViewContexts }) => {
  const [isExpendedToggled, setIsExpandedToggled] = useState(false);

  if (!msg.status || msg.role === 'user') return null;

  const usedFiles = msg.sources ? Array.from(new Set(msg.sources.map(s => s.docName))) : [];

  return (
    <>
      <div className="w-full max-w-2xl space-y-2 mt-2">
        <div className="transition-all duration-300">
        <div className="w-full flex items-center justify-between py-2">
          <button 
            onClick={() => setIsExpandedToggled(!isExpendedToggled)}
            className="flex items-center gap-3 text-[10px] font-serif font-bold text-gray-500 uppercase tracking-[0.15em] hover:text-brand-accent transition-colors"
          >
            Query Expansion
            {isExpendedToggled ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
          </button>
          <div className="flex items-center gap-3">
            {msg.status === 'expanding' && (
              <LiveTimer status={msg.status} activeAt="expanding" finalDuration={msg.expansionDuration} />
            )}
            {msg.expandedQuery ? null : <Loader2 size={14} className="animate-spin text-brand-accent" />}
          </div>
        </div>
        
        {isExpendedToggled && (
          <div className="pb-2 animate-[fadeIn_0.2s_ease-out]">
            {msg.expandedQuery ? (
              <div className="text-[12px] font-mono text-gray-400 bg-brand-base p-3 border border-brand-border rounded-lg">
                {msg.expandedQuery}
              </div>
            ) : (
              <div className="h-10 shimmer rounded-lg opacity-20"></div>
            )}
          </div>
        )}
      </div>

      {(msg.status === 'reasoning' || msg.status === 'completed' || usedFiles.length > 0) && (
        <div className="flex items-center justify-end gap-3 py-1 animate-[fadeIn_0.5s_ease-out] flex-wrap">
          {usedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mr-auto">
              {usedFiles.map((name, i) => (
                <button 
                  key={i} 
                  onClick={() => msg.sources && onViewContexts(name, msg.sources, msg.id)}
                  className="flex items-center gap-1.5 px-2 py-1 bg-brand-base rounded border border-brand-border text-[11px] text-gray-400 font-medium hover:border-brand-accent hover:text-brand-accent transition-all"
                >
                  <FileText size={10} className="text-brand-accent" />
                  {name}
                </button>
              ))}
            </div>
          )}
          
          {(msg.status === 'reasoning' || msg.status === 'completed') && (
            <div className="flex items-center gap-3">
              <LiveTimer status={msg.status} activeAt="reasoning" finalDuration={msg.reasoningDuration} />
              {msg.status === 'completed' ? null : <Loader2 size={14} className="animate-spin text-brand-accent" />}
            </div>
          )}
        </div>
      )}
      </div>
    </>
  );
};

export const ChatInterface: React.FC<Props> = ({ 
  messages, expanderModelId, reasonerModelId, onRetry, onRegenerate, onUpdateSources, onClearChat, 
  inputPosition, inputValue, setInputValue, onSend, onStop, isProcessing, availableDocuments 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewContextState, setViewContextState] = useState<{
    fileName: string;
    sources: Chunk[];
    messageId: string;
  } | null>(null);

  const handleViewContexts = (fileName: string, sources: Chunk[], messageId: string) => {
    setViewContextState({ fileName, sources, messageId });
  };

  const handleRemoveChunk = (chunkIndexInFile: number) => {
    if (!viewContextState) return;
    
    const { fileName, sources, messageId } = viewContextState;
    const fileChunks = sources.filter(s => s.docName === fileName);
    const chunkToRemove = fileChunks[chunkIndexInFile];
    const newSources = sources.filter(s => s !== chunkToRemove);
    
    onUpdateSources(messageId, newSources);
    
    // Update local state if we still have chunks for this file, otherwise close or update
    if (newSources.filter(s => s.docName === fileName).length === 0) {
        setViewContextState(null);
    } else {
        setViewContextState({ ...viewContextState, sources: newSources });
    }
  };            <FileText size={16} className="text-brand-accent" />

  const [suggestionFilter, setSuggestionFilter] = useState('');            <FileText size={16} className="text-brand-accent" />

  const [cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 240);
      textarea.style.height = `${newHeight}px`;
    }
  }, [inputValue]);

  // HANDLE @ TAGGING
  useEffect(() => {
    const lastAtPos = inputValue.lastIndexOf('@', cursorPosition - 1);
    if (lastAtPos !== -1 && !inputValue.slice(lastAtPos, cursorPosition).includes(' ')) {
      const filter = inputValue.slice(lastAtPos + 1, cursorPosition);
      setSuggestionFilter(filter);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, cursorPosition]);

  const insertTag = (fileName: string) => {
    const lastAtPos = inputValue.lastIndexOf('@', cursorPosition - 1);
    const beforeAt = inputValue.slice(0, lastAtPos);
    const afterAt = inputValue.slice(cursorPosition);
    const newValue = `${beforeAt}@${fileName} ${afterAt}`;
    setInputValue(newValue);
    setShowSuggestions(false);
    
    // Position cursor after inserted tag
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPos = lastAtPos + fileName.length + 2;
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const filteredDocs = availableDocuments.filter(doc => 
    doc.name.toLowerCase().includes(suggestionFilter.toLowerCase())
  );

  const expanderModel = SUPPORTED_MODELS.find(m => m.id === expanderModelId);
  const reasonerModel = SUPPORTED_MODELS.find(m => m.id === reasonerModelId);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && filteredDocs.length > 0) {
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        insertTag(filteredDocs[0].name);
        return;
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        return;
      }
    }
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-brand-base flex-1 transition-colors relative">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-40"></div>
      
      <div className="sticky top-0 z-50 w-full h-16 bg-brand-base/70 backdrop-blur-md border-b border-brand-border flex items-center justify-center px-8 transition-all">
        <div className="flex items-center gap-8 max-w-4xl w-full justify-between">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-lg bg-white border border-brand-border flex items-center justify-center overflow-hidden p-1.5 transition-transform hover:scale-105">
                    {expanderModel && <img src={expanderModel.logo} alt="" className="max-w-full max-h-full object-contain" />}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-brand-muted font-bold leading-none mb-1 flex items-center gap-1">
                       Context expander
                    </span>
                    <span className="text-[11px] font-medium text-gray-300 leading-none truncate max-w-[120px]">
                       {expanderModel?.name || 'Unknown'}
                    </span>
                 </div>
              </div>

              <div className="h-6 w-[1px] bg-brand-border mx-2"></div>

              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-lg bg-white border border-brand-border flex items-center justify-center overflow-hidden p-1.5 transition-transform hover:scale-105">
                    {reasonerModel && <img src={reasonerModel.logo} alt="" className="max-w-full max-h-full object-contain" />}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-brand-muted font-bold leading-none mb-1 flex items-center gap-1">
                       Reasoner
                    </span>
                    <span className="text-[11px] font-medium text-gray-300 leading-none truncate max-w-[120px]">
                       {reasonerModel?.name || 'Unknown'}
                    </span>
                 </div>
              </div>
           </div>

           <button 
             onClick={onClearChat}
             title="Clear Chat"
             className="p-2.5 hover:bg-brand-border rounded-xl transition-all text-gray-400 hover:text-red-500 flex items-center gap-2 group"
           >
              <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">Clear</span>
           </button>
        </div>
      </div>

      <div ref={scrollRef} className={`flex-1 overflow-y-auto px-6 py-12 space-y-20 relative z-10 ${inputPosition === 'floating' ? 'pb-72' : ''}`}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-12 pb-20">
            <p className="text-[14px] text-brand-muted max-w-sm leading-relaxed animate-blur-text [animation-delay:0.2s]">
               Provide documents in the Knowledge Vault and start a reasoned conversation. Type <span className="text-brand-accent font-bold">@</span> to tag specific files.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="max-w-4xl mx-auto w-full fade-in">
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start gap-4'}`}>
                
                {msg.role === 'assistant' && (
                   <div className="w-8 h-8 rounded-lg bg-white border border-brand-border flex items-center justify-center overflow-hidden p-1.5 shrink-0 mt-1">
                      {reasonerModel && <img src={reasonerModel.logo} alt="" className="max-w-full max-h-full object-contain" />}
                   </div>
                )}

                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} w-full space-y-2`}>
                  <div className={`px-7 py-3 rounded-xl leading-relaxed text-[15px] ${
                    msg.role === 'user' 
                      ? 'bg-brand-darker text-gray-200 text-gray-300 max-w-xl' 
                      : 'bg-brand-darker text-gray-200 w-full border border-brand-border'
                  }`}>
                  {msg.status === 'completed' || msg.role === 'user' ? (
                     <div className={`prose dark:prose-invert ${msg.role === 'assistant' ? 'animate-blur-text' : ''}`}>
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
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
                      <div className="text-[11px] font-mono text-brand-muted uppercase tracking-widest flex items-center gap-2">
                        Synthesizing
                        <LiveTimer status={msg.status} activeAt="reasoning" finalDuration={msg.reasoningDuration} />
                      </div>
                    </div>
                  )}
                </div>
                <PipelineDetails 
                  msg={msg} 
                  onViewContexts={handleViewContexts}
                />
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {inputPosition === 'floating' && (
        <>
          <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-brand-base via-brand-base/95 to-transparent pointer-events-none z-40" />
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-50">
          
          {/* FILE SUGGESTIONS PORTAL */}
          {showSuggestions && filteredDocs.length > 0 && (
            <div className="absolute bottom-full left-0 mb-4 w-full bg-[#202020]/90 border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden animate-in slide-in-from-bottom-2 duration-150 backdrop-blur-2xl">
              <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.03]">
                <span className="text-[10px] font-mono text-brand-muted uppercase tracking-widest">Vault Suggestions</span>
                <span className="text-[9px] px-2 py-1 bg-brand-accent/20 text-brand-accent rounded font-bold uppercase">Priority Link</span>
              </div>
              <div className="max-h-52 overflow-y-auto scrollbar-hide">
                {filteredDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => insertTag(doc.name)}
                    className="w-full flex items-center gap-4 px-5 py-3 hover:bg-white/[0.05] border-b border-white/5 last:border-0 transition-colors text-left group"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-brand-base border border-white/5 group-hover:border-brand-accent/50 transition-all">
                      <FileText size={12} className="text-emerald-500" />
                    </div>
                    <span className="text-[13px] font-medium text-gray-300 group-hover:text-white transition-colors">
                      @{doc.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="relative group/input bg-white/[0.06] backdrop-blur-[40px] rounded-[32px] border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all focus-within:border-brand-accent/40 p-2.5 flex items-end gap-2.5">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setCursorPosition(e.target.selectionStart || 0);
              }}
              onKeyUp={(e) => setCursorPosition((e.target as any).selectionStart || 0)}
              onClick={(e) => setCursorPosition((e.target as any).selectionStart || 0)}
              onKeyDown={handleKeyDown}
              placeholder="Expand context... Deep reason... Use @ to focus on specific files"
              className="flex-1 bg-transparent border-none text-[13px] font-medium px-4 py-3 resize-none outline-none text-gray-100 placeholder:text-gray-500 min-h-[63px] overflow-y-auto scrollbar-hide leading-relaxed"
              style={{ height: '63px' }}
              rows={1}
            />
            <button
              onClick={() => isProcessing ? onStop() : onSend()}
              disabled={!isProcessing && !inputValue.trim()}
              className={`shrink-0 h-9 w-16 flex items-center justify-center rounded-full transition-all mb-1 mr-1.5 ${
                isProcessing 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-gradient-to-br from-brand-accent to-[#d4480e] hover:brightness-110 disabled:grayscale disabled:opacity-20'
              }`}
            >
              {isProcessing ? (
                <div className="w-3 h-3 bg-white rounded-sm" />
              ) : (
                <ArrowRight className="text-white" size={16} strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
        </>
      )}

      {viewContextState && (
        <ContextModal 
          isOpen={!!viewContextState}
          onClose={() => setViewContextState(null)}
          fileName={viewContextState.fileName}
          chunks={viewContextState.sources.filter(s => s.docName === viewContextState.fileName)}
          onRemoveChunk={handleRemoveChunk}
          onRegenerate={() => {
            onRegenerate(viewContextState.messageId);
            setViewContextState(null);
          }}
        />
      )}
    </div>
  );
};
