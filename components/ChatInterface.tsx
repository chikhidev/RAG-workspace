import React, { useRef, useEffect, useState } from 'react';
import { Message, PipelineStatus, Document, Chunk } from '../types';
import { Search, Plus, Loader2, CheckCircle2, ChevronDown, ChevronRight, FileText, Sparkles, Copy, Check, Zap, Cpu, RefreshCw, Trash2, Send, ArrowRight, X, Target, Brain, PenTool, Circle, SearchIcon, Terminal, Eye, ArrowUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { SUPPORTED_MODELS } from '../services/modelService';
import { MarkdownResponse } from './MarkdownResponse';
import { TreeLoader, FileSearchLoader, ThinkingLoader } from './animations';

interface Props {
  messages: Message[];
  selectedModelId: string;
  onRetry: (id: string) => void;
  onRegenerate: (id: string) => void;
  onUpdateSources: (id: string, sources: Chunk[]) => void;
  onClearChat: () => void;
  inputValue: string;
  setInputValue: (v: string) => void;
  onSend: (customValue?: string) => void;
  onStop: () => void;
  isProcessing: boolean;
  onClarifyAnswer: (id: string, answer: string) => void;
  onMaxIterationsDecision: (id: string, shouldContinue: boolean) => void;
  maxAgentIterations: number;
  availableDocuments: Document[];
  onHistoryNav: (direction: 'up' | 'down') => void;
}

const CopyButton: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-1.5 rounded-lg transition-all ${
        copied
          ? 'dark:bg-emerald-500/30 light:bg-emerald-500/20 text-emerald-400 dark:border border-emerald-500/50 light:border-emerald-500/40'
          : 'dark:bg-white/5 light:bg-gray-200/10 dark:text-gray-400 light:text-gray-600 dark:hover:text-gray-200 light:hover:text-gray-900 dark:hover:bg-white/10 light:hover:bg-gray-200/20 dark:border dark:border-white/10 light:border light:border-gray-200/20'
      } ${className}`}
      title={copied ? 'Copied!' : 'Copy message'}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
};

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
    <div className="font-mono text-[10px] text-gray-400 font-bold tabular-nums">
      {elapsed.toFixed(1)}s
    </div>
  );
};

// Redundant local CodeBlock removed as MarkdownResponse handles it now

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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 dark:bg-black/80 light:bg-white/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="dark:bg-brand-darker light:bg-light-base w-[90vw] max-w-[1400px] h-[85vh] rounded-2xl dark:border dark:border-brand-border light:border light:border-light-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        <div className="px-6 py-4 dark:border-b dark:border-brand-border light:border-b light:border-light-border flex items-center justify-between dark:bg-brand-base/50 light:bg-light-darker/50 shrink-0">
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
                    <p className="text-[13px] text-gray-300 leading-relaxed whitespace-pre-wrap">{chunk.text}</p>
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
  const [expandedLogs, setExpandedLogs] = useState<Record<number, boolean>>({});
  const [isMainExpanded, setIsMainExpanded] = useState(msg.status !== 'completed');

  useEffect(() => {
    if (msg.status === 'completed') {
      setIsMainExpanded(false);
      // Also clear individual expansions to ensure total collapse
      setExpandedLogs({});
    } else if (msg.status && msg.status !== 'error') {
      setIsMainExpanded(true);
    }
  }, [msg.status]);

  if (!msg.status || msg.role === 'user') return null;

  const usedFiles = msg.sources ? Array.from(new Set(msg.sources.map(s => s.docName))) : [];
  const logs = msg.thoughtLogs || [];

  const toggleLog = (idx: number) => {
    setExpandedLogs(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="w-full space-y-2 mb-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsMainExpanded(!isMainExpanded)}
          className="flex items-center gap-2 group/trace active:scale-95 transition-transform"
        >
          <span className="text-sm text-gray-500 group-hover/trace:text-gray-300 transition-colors">
            Reasoning Trace
          </span>
          <ChevronDown size={14} className={`text-gray-600 transition-transform duration-300 ${isMainExpanded ? 'rotate-180' : ''}`} />
        </button>

        {(msg.status === 'reasoning' || msg.status === 'completed' || usedFiles.length > 0) && (
          <div className="flex items-center justify-end gap-3 py-1 mt-3 animate-[fadeIn_0.5s_ease-out] flex-wrap">
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
                <LiveTimer status={msg.status} activeAt="reasoning" finalDuration={msg.reasoningDuration} />
            )}
          </div>
        )}
      </div>

      {isMainExpanded && (
        <div className="relative border-l border-white/5 ml-[7px] space-y-3 pb-1 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {logs.map((log, i) => {
            const isSearching = log.step.toLowerCase().includes('searching');
            const isGrep = log.step.toLowerCase().includes('grep');
            const isReadLines = log.step.toLowerCase().includes('read lines');
            const StepIcon = isGrep ? Terminal : isReadLines ? Eye : isSearching ? SearchIcon : null;
            const isLast = i === logs.length - 1;
            const isCompleted = msg.status === 'completed';

            // Auto-expand if it's the last one during processing, otherwise use manual state
            const isExpanded = expandedLogs[i] ?? (isLast && !isCompleted);

            return (
              <div key={i} className="relative pl-6 group">
                {/* Timeline Node */}
                <div className={`absolute -left-[10px] p-0.5 rounded-full bg-brand-base transition-colors`}>
                  {StepIcon && <StepIcon size={15} className="text-gray-500" fill={(isSearching || isGrep || isReadLines) ? 'none' : 'currentColor'} />}
                </div>

                {/* Content */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => toggleLog(i)}
                    className="flex items-center gap-2 text-left group/title"
                  >
                    <span className="text-[13px] font-bold text-gray-400 group-hover/title:text-gray-200 tracking-wide leading-none transition-colors">
                      {log.step}
                    </span>
                    {log.thought && (
                      <ChevronDown size={12} className={`text-gray-600 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} />
                    )}
                  </button>

                  {log.thought && isExpanded && (
                    <div className="text-[13px] text-gray-500 font-medium leading-relaxed whitespace-pre-wrap animate-in fade-in slide-in-from-top-1 duration-200">
                      {log.thought}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Active Status Indicator at the bottom of the timeline */}
          {msg.status !== 'completed' && msg.status !== 'error' && (
            <div className="relative pl-6 pt-2">
              <div className="flex items-center gap-3">
                {msg.status === 'searching' && (msg.activeSubQuery?.toLowerCase().includes('mind map') || msg.activeSubQuery?.toLowerCase().includes('navigating')) ? (
                  <TreeLoader />
                ) : msg.status === 'searching' ? (
                  <FileSearchLoader />
                ) : (
                  <ThinkingLoader />
                )}
                <span className="text-[13px] font-bold text-brand-accent animate-pulse">
                  {msg.status === 'searching' && (msg.activeSubQuery?.toLowerCase().includes('mind map') || msg.activeSubQuery?.toLowerCase().includes('navigating')) ? 
                      (msg.activeSubQuery?.toLowerCase().includes('navigating') ? 'Navigating Mind Map...' : 'Exploring Mind Maps...') :
                    msg.status === 'searching' ? 'Searching...' :
                    msg.status === 'synthesizing' ? 'Synthesizing...' :
                    msg.status === 'planning' ? 'Planning...' :
                      'Thinking...'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}



      
    </div>
  );
};

export const ChatInterface: React.FC<Props> = ({
  messages, selectedModelId, onRetry, onRegenerate, onUpdateSources, onClearChat,
  inputValue, setInputValue, onSend, onStop, isProcessing, onClarifyAnswer, onMaxIterationsDecision, maxAgentIterations, availableDocuments, onHistoryNav
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
  };

  const [suggestionFilter, setSuggestionFilter] = useState('');

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

  const selectedModel = SUPPORTED_MODELS.find(m => m.id === selectedModelId);

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

    if (e.key === 'ArrowUp' && inputValue.trim() === '') {
      e.preventDefault();
      onHistoryNav('up');
      return;
    }
    if (e.key === 'ArrowDown' && inputValue.trim() === '') {
      e.preventDefault();
      onHistoryNav('down');
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
<div className="flex flex-col h-full dark:bg-brand-base light:bg-light-base flex-1 transition-colors relative">

      <div ref={scrollRef} className={`flex-1 overflow-y-auto px-6 py-6 space-y-8 relative z-10 pb-44`}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-12 pb-20">

          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="max-w-5xl mx-auto w-full fade-in">
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start gap-4'}`}>



                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} w-full space-y-2`}>

                  {/* Pipeline Details (Thinking/Reflection) - BEFORE Content */}
                  {msg.role === 'assistant' && (
                    <PipelineDetails
                      msg={msg}
                      onViewContexts={handleViewContexts}
                    />
                  )}

                  <div className={`relative leading-relaxed text-[15px] group ${msg.role === 'user'
                    ? 'bg-brand-darker text-gray-200 text-gray-300 max-w-xl p-3 rounded-xl'
                    : (msg.status === 'completed' ? '' : 'w-full')
                    }`}>
                    {(msg.status === 'completed' || msg.role === 'user' || (msg.role === 'assistant' && msg.content)) ? (
                      <div className="space-y-4">
                      <div className={`${msg.role === 'assistant' ? 'animate-blur-text' : ''}`}>
                        <MarkdownResponse
                          content={msg.content}
                          onSourceClick={(fileName) => msg.sources && handleViewContexts(fileName, msg.sources, msg.id)}
                        />
                      </div>

                      {msg.pendingClarification && (
                          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">

                            <div className="">
                              <div className="flex gap-4 group/item">
                                <div className="flex items-start gap-2 min-w-[100px] pt-0.5">
                                  <ChevronRight size={10} className="text-brand-accent mt-1" />
                                  <span className="text-[10px] text-brand-accent font-bold tracking-tight">Question</span>
                                </div>
                                <div className="text-[14px] text-gray-100 font-medium leading-relaxed">
                                  {msg.pendingClarification}
                                </div>
                              </div>

                              <div className="flex gap-4 group/item pt-2">
                                <div className="flex items-center gap-2 min-w-[100px]">
                                  <ChevronRight size={10} className="text-gray-500" />
                                  <span className="text-[10px] text-gray-500 font-bold tracking-tight">Input</span>
                                </div>
                                {msg.clarificationAnswer ? (
                                  <div className="flex items-center gap-2 px-6 py-2 bg-brand-accent/20 text-brand-accent border border-brand-accent/30 rounded-lg text-[12px] font-bold">
                                    <span>Confirmed: {msg.clarificationAnswer}</span>
                                    <CheckCircle2 size={14} />
                                  </div>
                                ) : (
                                  <div className="flex-1 space-y-3">
                                    <div className="flex gap-3">
                                      <button
                                        onClick={() => onClarifyAnswer(msg.id, 'yes')}
                                        className="px-6 py-2 bg-brand-accent/10 hover:bg-brand-accent text-brand-accent hover:text-white border border-brand-accent/20 rounded-lg text-[12px] font-bold transition-all shadow-lg flex items-center gap-2"
                                      >
                                        <span>Yes</span>
                                        <ArrowRight size={14} />
                                      </button>
                                      <button
                                        onClick={() => onClarifyAnswer(msg.id, 'no')}
                                        className="px-6 py-2 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-lg text-[12px] font-bold transition-all"
                                      >
                                        No
                                      </button>
                                    </div>

                                    <div className="relative mt-2">
                                      <input
                                        type="text"
                                        placeholder="Type a custom response..."
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                            onClarifyAnswer(msg.id, e.currentTarget.value);
                                            e.currentTarget.value = '';
                                          }
                                        }}
                                        className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-2 text-[13px] text-gray-200 outline-none focus:border-brand-accent/50 transition-all placeholder:text-gray-600"
                                      />
                                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 font-mono">press enter</div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                      {msg.pendingMaxIterations && (
                          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="bg-brand-darker rounded-xl p-4">
                              <div className="flex items-start gap-3 mb-4">
                                <div>
                                  <p className="text-sm text-gray-100 font-medium mb-1">
                                    Research hit {maxAgentIterations} iterations without concluding
                                  </p>
                                  <p className="text-xs text-brand-muted">
                                    Continue research for {maxAgentIterations} more iterations, or generate answer with current data?
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex gap-3">
                                <button
                                  onClick={() => onMaxIterationsDecision(msg.id, true)}
                                  className="flex-1 px-6 py-3 bg-brand-base hover:bg-brand-border hover:text-white border border-brand-border rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                                >
                                  <ArrowUp size={12} />
                                  <span>Continue Research</span>
                                </button>
                                <button
                                  onClick={() => onMaxIterationsDecision(msg.id, false)}
                                  className="flex-1 px-6 py-3 bg-brand-darker hover:bg-brand-border text-gray-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                                >
                                  <span>Generate Answer</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
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
                    ) : msg.wasStopped ? (
                      <div className="flex flex-col items-start gap-4">
                        <p className="text-yellow-400 italic text-[13px]">Response stopped by user.</p>
                        <button
                          onClick={() => onRegenerate(msg.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent border border-brand-accent/30 rounded-lg text-[12px] font-bold transition-all"
                        >
                          <RefreshCw size={14} />
                          Regenerate Response
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 py-2 px-1">
                        <div className="text-[10px] font-mono text-brand-muted tracking-[0.2em] flex items-center gap-2">
                          <LiveTimer status={msg.status} activeAt="thinking" finalDuration={msg.thinkingDuration} />
                        </div>
                      </div>
                    )}
                  
                    {/* Model Badge - shown at bottom left for completed assistant messages */}
                    {msg.role === 'assistant' && msg.status === 'completed' && !msg.pendingMaxIterations && msg.modelId && (() => {
                      const model = SUPPORTED_MODELS.find(m => m.id === msg.modelId);
                      if (!model) return null;
                      return (
                        <div className="mt-3 flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                          <div className="w-4 h-4 rounded bg-white/10 p-0.5 flex items-center justify-center">
                            <img src={model.logo} alt={model.name} className="w-full h-full object-contain" />
                          </div>
                          <span className="text-[10px] text-gray-500 font-medium">{model.name}</span>
                        </div>
                      );
                    })()}
                  
                    {/* Copy Button - positioned absolutely, hidden until hover */}
                    {((msg.status === 'completed' && msg.content) || msg.role === 'user') && (
                      <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CopyButton text={msg.content} />
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <>
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-brand-base via-brand-base/95 to-transparent pointer-events-none z-40" />
        <div className="absolute bottom-6 left-0 w-full flex justify-center px-8 z-50">
          <div className="w-full max-w-4xl">

            <div className="bg-brand-base rounded-3xl">

              {/* FILE SUGGESTIONS PORTAL */}
              {showSuggestions && filteredDocs.length > 0 && (
                <div className="absolute bottom-full left-0 mb-4 w-full bg-[#202020]/90 border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden animate-in slide-in-from-bottom-2 duration-150 backdrop-blur-2xl">
                  <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.03]">
                    <span className="text-[10px] font-mono text-brand-muted tracking-widest">Vault Suggestions</span>
                    <span className="text-[9px] px-2 py-1 bg-brand-accent/20 text-brand-accent rounded font-bold">Priority Link</span>
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

              <div className={`relative group/input bg-white/[0.06] backdrop-blur-[40px] rounded-[32px] border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all focus-within:border-brand-accent/40 p-2.5 flex items-end gap-2.5`}>
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
                  className={`shrink-0 h-9 w-16 flex items-center justify-center rounded-full transition-all mb-1 mr-1.5 ${isProcessing
                    ? 'bg-red-500 hover:bg-red-600 ai-glow-box'
                    : 'bg-brand-accent hover:brightness-110 disabled:grayscale disabled:opacity-20'
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
          </div>
        </div>
      </>

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
