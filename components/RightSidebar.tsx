
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sun, Moon, Terminal, Cpu, Eraser, Layers, Key, Settings2, Layout, Maximize2, AlertCircle, FileText, Trash2, BarChart2, Shield } from 'lucide-react';
import { SUPPORTED_MODELS } from '../services/modelService';

import { ModelDefinition, Document } from '../types';
import { ModelSelectorModal } from './ModelSelectorModal';

interface Props {
  inputValue: string;
  setInputValue: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  onHistoryNav: (direction: 'up' | 'down') => void;
  isProcessing: boolean;
  useVault: boolean;
  setUseVault: (v: boolean) => void;
  useContextHistory: boolean;
  setUseContextHistory: (v: boolean) => void;
  onClearContext: () => void;
  expanderModel: string;
  setExpanderModel: (m: string) => void;
  reasonerModel: string;
  setReasonerModel: (m: string) => void;
  openRouterKey: string;
  setOpenRouterKey: (k: string) => void;
  onOpenApiManagement: () => void;
  inputPosition: 'floating' | 'sidebar';
  setInputPosition: (pos: 'floating' | 'sidebar') => void;
  availableDocuments: Document[];
  onClearChat: () => void;
  maxTokens: number;
  setMaxTokens: (n: number) => void;
  maxAgentIterations: number;
  setMaxAgentIterations: (n: number) => void;
  sessionStats: { inputTokens: number; outputTokens: number };
  customContext: string;
  setCustomContext: (v: string) => void;
}

const ModelDetails: React.FC<{ model?: ModelDefinition }> = ({ model }) => {
  if (!model) return null;
  const { metadata } = model;

  return (
    <div className="mt-3 p-3 bg-brand-base/40 border border-brand-border/50 rounded-xl space-y-2.5 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-mono text-brand-muted uppercase tracking-tighter">by {metadata.author}</span>
        <span className="text-[10px] font-mono font-bold text-brand-accent">{metadata.context} context</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1 border-t border-brand-border/30">
        <div className="flex flex-col">
          <span className="text-[11px] font-mono text-gray-300 font-bold">{metadata.inputPrice} input tokens</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[11px] font-mono text-gray-300 font-bold">{metadata.outputPrice} output tokens</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-mono text-gray-300 font-bold">Latency {metadata.latency}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[11px] font-mono text-gray-300 font-bold">Throughput {metadata.throughput}</span>
        </div>
      </div>
    </div>
  );
};

export const RightSidebar: React.FC<Props> = ({
  inputValue, setInputValue, onSend, onStop, onHistoryNav, isProcessing,
  useVault, setUseVault, useContextHistory, setUseContextHistory,
  onClearContext, expanderModel, setExpanderModel, reasonerModel, setReasonerModel,
  onOpenApiManagement, inputPosition, setInputPosition, availableDocuments, onClearChat,
  maxTokens, setMaxTokens, maxAgentIterations, setMaxAgentIterations, sessionStats,
  customContext, setCustomContext
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionFilter, setSuggestionFilter] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [activeModal, setActiveModal] = useState<'expander' | 'reasoner' | null>(null);
  const sidebarTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle Tagging in Sidebar
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

    setTimeout(() => {
      if (sidebarTextareaRef.current) {
        sidebarTextareaRef.current.focus();
        const newPos = lastAtPos + fileName.length + 2;
        sidebarTextareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const filteredDocs = availableDocuments.filter(doc =>
    doc.name.toLowerCase().includes(suggestionFilter.toLowerCase())
  );

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

  const toggleBtnClass = "w-full flex items-center justify-between p-4 rounded-xl border border-brand-border bg-[#252525] transition-all hover:bg-brand-border/50";
  const selectClass = "w-full bg-[#252525] border border-brand-border rounded-xl p-3 text-[13px] font-bold text-gray-200 outline-none focus:border-brand-accent/50 appearance-none cursor-pointer hover:border-brand-accent/30 transition-all pl-10";

  const selectedExpander = SUPPORTED_MODELS.find(m => m.id === expanderModel);
  const selectedReasoner = SUPPORTED_MODELS.find(m => m.id === reasonerModel);

  return (
    <div className="flex flex-col h-full bg-brand-darker border-l border-transparent p-6 w-full transition-colors overflow-y-auto relative">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-muted">Studio Controller</span>
        </div>
        <button
          onClick={onClearChat}
          title="Clear Chat"
          className="p-1.5 hover:bg-red-500/10 rounded transition-all text-gray-500 hover:text-red-500 flex items-center gap-1.5 group"
        >
          <div className="text-[9px] font-bold uppercase tracking-wider hidden sm:inline opacity-0 group-hover:opacity-100 transition-opacity">Clear</div>
          <Trash2 size={14} />
        </button>
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-white tracking-tight">Synthesis Query</h2>
          <button
            onClick={() => setInputPosition(inputPosition === 'floating' ? 'sidebar' : 'floating')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${inputPosition === 'floating'
              ? 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20'
              : 'bg-brand-border text-gray-500'
              }`}
            title="Toggle Floating Input"
          >
            {inputPosition === 'floating' ? <Maximize2 size={12} /> : <Layout size={12} />}
            {inputPosition === 'floating' ? 'Floating' : 'Sidebar'}
          </button>
        </div>

        {inputPosition === 'sidebar' ? (
          <div className="relative group">
            <textarea
              ref={sidebarTextareaRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setCursorPosition(e.target.selectionStart || 0);
              }}
              onKeyUp={(e) => setCursorPosition((e.target as any).selectionStart || 0)}
              onClick={(e) => setCursorPosition((e.target as any).selectionStart || 0)}
              onKeyDown={handleKeyDown}
              placeholder="Describe task... Use @ for files"
              className="w-full bg-brand-base border border-brand-border rounded-xl p-5 focus:border-brand-accent transition-all text-[14px] font-medium h-48 resize-none text-gray-200 outline-none leading-relaxed placeholder:text-brand-muted/50 shadow-inner"
            />

            {/* Sidebar Suggestions Portal (Now listing downwards) */}
            {showSuggestions && filteredDocs.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-full bg-brand-base border border-brand-border rounded-xl shadow-2xl overflow-hidden z-[60] backdrop-blur-md">
                <div className="px-3 py-1.5 border-b border-brand-border flex items-center justify-between bg-brand-darker/50">
                  <span className="text-[8px] font-mono text-brand-muted uppercase tracking-widest">Vault Matches</span>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => insertTag(doc.name)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-brand-accent/10 border-b border-brand-border/30 last:border-0 transition-colors text-left group"
                    >
                      <FileText size={10} className="text-emerald-500" />
                      <span className="text-[11px] font-medium text-gray-300 truncate">
                        @{doc.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => isProcessing ? onStop() : onSend()}
              disabled={!isProcessing && !inputValue.trim()}
              className={`absolute bottom-4 right-4 h-10 w-10 flex items-center justify-center rounded-lg transition-all shadow-xl ${isProcessing
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-brand-accent hover:bg-brand-accent/90 disabled:bg-brand-border disabled:text-brand-muted'
                }`}
            >
              {isProcessing ? <div className="w-3 h-3 bg-white rounded-sm" /> : <Send className="text-white" size={16} />}
            </button>
          </div>
        ) : (
          <div className="p-5 border border-dashed border-brand-border rounded-xl text-center">
            <p className="text-[11px] text-brand-muted italic leading-relaxed">
              Input is currently detached and floating in the chat area for better focus.
            </p>
          </div>
        )}
      </div>

      <div className="mb-10 space-y-8">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-md text-white tracking-tight">Context expander Config</h2>
            <button onClick={onClearContext} className="p-1.5 hover:bg-brand-border rounded transition-colors text-gray-400 hover:text-brand-accent"><Eraser size={14} /></button>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <button onClick={() => setUseContextHistory(!useContextHistory)} className={toggleBtnClass}>
                <div className="flex flex-col items-start">
                  <span className="text-[13px] font-bold text-gray-200">Context Continuity</span>
                  <span className="text-[10px] font-mono text-brand-muted uppercase tracking-tighter">{useContextHistory ? 'Learning Logs' : 'Isolated Turns'}</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${useContextHistory ? 'bg-brand-accent' : 'bg-brand-border'}`}><div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${useContextHistory ? 'left-6' : 'left-1'}`} /></div>
              </button>
              {useContextHistory && (
                <div className="px-3 flex items-start gap-2 animate-[fadeIn_0.3s_ease-out]">
                  <p className="text-[10px] text-brand-muted leading-relaxed">
                    Enabling continuity will cause a reasonable slowness in response time.
                  </p>
                </div>
              )}
            </div>

            <button onClick={() => setUseVault(!useVault)} className={toggleBtnClass}>
              <div className="flex flex-col items-start">
                <span className="text-[13px] font-bold text-gray-200">Knowledge Vault</span>
                <span className="text-[10px] font-mono text-brand-muted uppercase tracking-tighter">{useVault ? 'Active Indexing' : 'Isolated Mode'}</span>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${useVault ? 'bg-brand-accent' : 'bg-brand-border'}`}><div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${useVault ? 'left-6' : 'left-1'}`} /></div>
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-brand-border/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-brand-accent" />
              <h2 className="text-md text-white tracking-tight">Custom Context Vault</h2>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] text-brand-muted leading-relaxed uppercase tracking-wider font-bold">
              Permanent Directive & Learning Log
            </p>
            <textarea
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              placeholder="Record developer preferences, system rules, or permanent context here..."
              className="w-full bg-[#1a1a1a] border border-brand-border rounded-xl p-4 focus:border-brand-accent/50 transition-all text-[12px] font-mono h-40 resize-none text-gray-300 outline-none leading-relaxed placeholder:text-gray-600 shadow-inner"
            />
            <div className="flex items-start gap-2 px-1">
              <AlertCircle size={10} className="text-brand-accent mt-0.5 shrink-0" />
              <p className="text-[9px] text-brand-muted italic leading-relaxed">
                Content here is ALWAYS analyzed by the agent during planning to prevent recurring reasoning failures.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-10 border-t border-brand-border space-y-10">
        <div>
          <h2 className="text-md text-white mb-6 tracking-tight">Infrastructure</h2>
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-mono text-brand-muted uppercase tracking-widest">
                Context expander
                {selectedExpander?.isFree && (
                  <span className="ml-1 px-1 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[8px] font-bold">FREE</span>
                )}
              </label>

              <div
                onClick={() => setActiveModal('expander')}
                className="w-full bg-[#252525] border border-brand-border rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-brand-accent/50 group transition-all"
              >
                <div className="flex items-center gap-3">
                  {selectedExpander && (
                    <div className="w-8 h-8 bg-white rounded p-1 flex items-center justify-center">
                      <img src={selectedExpander.logo} alt="" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="text-left">
                    <div className="text-[13px] font-bold text-gray-200 group-hover:text-white transition-colors line-clamp-1">
                      {selectedExpander?.name || 'Select Model'}
                    </div>
                    <div className="text-[10px] text-brand-muted uppercase tracking-wider">
                      {selectedExpander?.provider} • {selectedExpander?.size}
                    </div>
                  </div>
                </div>
                <Settings2 size={14} className="text-gray-500 group-hover:text-brand-accent transition-colors" />
              </div>
              <ModelDetails model={selectedExpander} />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-mono text-brand-muted uppercase tracking-widest">
                Synthesizer (Reasoner)
                {selectedReasoner?.isFree && (
                  <span className="ml-1 px-1 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[8px] font-bold">FREE</span>
                )}
              </label>

              <div
                onClick={() => setActiveModal('reasoner')}
                className="w-full bg-[#252525] border border-brand-border rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-brand-accent/50 group transition-all"
              >
                <div className="flex items-center gap-3">
                  {selectedReasoner && (
                    <div className="w-8 h-8 bg-white rounded p-1 flex items-center justify-center">
                      <img src={selectedReasoner.logo} alt="" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="text-left">
                    <div className="text-[13px] font-bold text-gray-200 group-hover:text-white transition-colors line-clamp-1">
                      {selectedReasoner?.name || 'Select Model'}
                    </div>
                    <div className="text-[10px] text-brand-muted uppercase tracking-wider">
                      {selectedReasoner?.provider} • {selectedReasoner?.size}
                    </div>
                  </div>
                </div>
                <Settings2 size={14} className="text-gray-500 group-hover:text-brand-accent transition-colors" />
              </div>
              <ModelDetails model={selectedReasoner} />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-md text-white mb-6 tracking-tight">Generation Controls</h2>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-gray-200">Max Output Tokens</span>
                <span className="text-[10px] font-mono text-brand-accent bg-brand-accent/10 px-1.5 py-0.5 rounded">{maxTokens}</span>
              </div>
              <input
                type="range"
                min="100"
                max="8000"
                step="100"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full accent-brand-accent bg-brand-border h-1.5 rounded-full appearance-none cursor-pointer hover:bg-brand-border/80 transition-all"
              />
              <p className="text-[10px] text-brand-muted">Limits the length of the AI's response.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-gray-200">Max Research Iterations</span>
                <span className="text-[10px] font-mono text-brand-accent bg-brand-accent/10 px-1.5 py-0.5 rounded">{maxAgentIterations}</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={maxAgentIterations}
                onChange={(e) => setMaxAgentIterations(parseInt(e.target.value))}
                className="w-full accent-brand-accent bg-brand-border h-1.5 rounded-full appearance-none cursor-pointer hover:bg-brand-border/80 transition-all"
              />
              <p className="text-[10px] text-brand-muted">Limits how many steps the agent can take per session.</p>
            </div>

            <div className="p-4 bg-brand-base border border-brand-border rounded-xl space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <BarChart2 size={14} className="text-brand-accent" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-300">Session Usage</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] text-brand-muted uppercase tracking-wider mb-0.5">Input</div>
                  <div className="text-[16px] font-mono text-white font-bold">{sessionStats.inputTokens.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-brand-muted uppercase tracking-wider mb-0.5">Output</div>
                  <div className="text-[16px] font-mono text-white font-bold">{sessionStats.outputTokens.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-md text-white mb-6 tracking-tight">API Management</h2>
          <div className="space-y-3">
            <button
              onClick={onOpenApiManagement}
              className="w-full flex items-center justify-between p-4 bg-brand-base border border-brand-border hover:border-brand-accent/50 rounded-xl transition-all group"
            >
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-[12px] font-bold text-gray-200 group-hover:text-brand-accent transition-colors">Configure Access</span>
                <span className="text-[9px] font-mono text-brand-muted uppercase tracking-tighter">OpenRouter & Credentials</span>
              </div>
              <Key size={14} className="text-brand-muted group-hover:text-brand-accent transition-colors" />
            </button>
          </div>
        </div>
      </div>

      <ModelSelectorModal
        isOpen={activeModal === 'expander'}
        onClose={() => setActiveModal(null)}
        currentModelId={expanderModel}
        onSelect={setExpanderModel}
        category="small"
        title="Select Expansion Model"
      />

      <ModelSelectorModal
        isOpen={activeModal === 'reasoner'}
        onClose={() => setActiveModal(null)}
        currentModelId={reasonerModel}
        onSelect={setReasonerModel}
        category="large"
        title="Select Reasoning Model"
      />

    </div>
  );
};
