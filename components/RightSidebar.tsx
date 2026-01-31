
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sun, Moon, Terminal, Cpu, Eraser, Layers, Key, Settings2, Layout, Maximize2, AlertCircle, FileText, Trash2, BarChart2, Shield, ChevronDown, ChevronRight } from 'lucide-react';
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
  selectedModel: string;
  setSelectedModel: (m: string) => void;
  openRouterKey: string;
  setOpenRouterKey: (k: string) => void;
  onOpenApiManagement: () => void;
  onOpenModelSelector: () => void;
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
  onClearContext, selectedModel, setSelectedModel,
  onOpenApiManagement, onOpenModelSelector, availableDocuments, onClearChat,
  maxTokens, setMaxTokens, maxAgentIterations, setMaxAgentIterations, sessionStats,
  customContext, setCustomContext
}) => {
  const toggleBtnClass = "w-full flex items-center justify-between p-4 rounded-xl border border-brand-border bg-[#252525] transition-all hover:bg-brand-border/50";
  const selectedModelDef = SUPPORTED_MODELS.find(m => m.id === selectedModel);

  const [showCustomContext, setShowCustomContext] = useState(false);

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

      <div className="mb-4 space-y-8">
        <div className="pt-8 border-t border-brand-border/30">
          <button
            onClick={() => setShowCustomContext(!showCustomContext)}
            className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-md text-white tracking-tight">Custom Instructions</h2>
            </div>
            {showCustomContext ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
          </button>

          {showCustomContext && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <textarea
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                placeholder="Record developer preferences, specific answer styles, or permanent context here..."
                className="w-full bg-[#1a1a1a] border border-brand-border rounded-xl p-4 focus:border-brand-accent/50 transition-all text-[12px] font-mono h-40 resize-none text-gray-300 outline-none leading-relaxed placeholder:text-gray-600 shadow-inner"
              />
              <div className="flex items-start gap-2 px-1">
                <p className="text-[9px] text-brand-muted italic leading-relaxed">
                  Content here is ALWAYS analyzed by the agent during planning to prevent recurring reasoning failures.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-10 border-t border-brand-border space-y-10">
        <div>
          <h2 className="text-md text-white mb-6 tracking-tight">Intelligence</h2>
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-mono text-brand-muted uppercase tracking-widest">
                Primary Model
                {selectedModelDef?.isFree && (
                  <span className="ml-1 px-1 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[8px] font-bold">FREE</span>
                )}
              </label>

              <div
                onClick={onOpenModelSelector}
                className="w-full bg-[#252525] border border-brand-border rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-brand-accent/50 group transition-all"
              >
                <div className="flex items-center gap-3">
                  {selectedModelDef && (
                    <div className="w-8 h-8 bg-white rounded p-1 flex items-center justify-center">
                      <img src={selectedModelDef.logo} alt="" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="text-left">
                    <div className="text-[13px] font-bold text-gray-200 group-hover:text-white transition-colors line-clamp-1">
                      {selectedModelDef?.name || 'Select Model'}
                    </div>
                    <div className="text-[10px] text-brand-muted uppercase tracking-wider">
                      {selectedModelDef?.provider} • {selectedModelDef?.size}
                    </div>
                  </div>
                </div>
                <Settings2 size={14} className="text-gray-500 group-hover:text-brand-accent transition-colors" />
              </div>
              <ModelDetails model={selectedModelDef} />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-md text-white tracking-tight">Generation Controls</h2>
            <button onClick={onClearContext} className="p-1.5 hover:bg-brand-border rounded transition-colors text-gray-400 hover:text-brand-accent" title="Clear Context History"><Eraser size={14} /></button>
          </div>
          <div className="space-y-6">
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
