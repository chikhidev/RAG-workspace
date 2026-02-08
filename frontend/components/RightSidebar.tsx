import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sun, Moon, Terminal, Cpu, Eraser, Layers, Key, Settings2, Layout, Maximize2, AlertCircle, FileText, Trash2, BarChart2, Shield, ChevronDown, ChevronRight, X } from 'lucide-react';
import { SUPPORTED_MODELS } from '../services/modelService';
import { useResponsive } from '../hooks/useResponsive';

import { ModelDefinition, Document } from '../types';
import { ModelSelectorModal } from './ModelSelectorModal';
import { CustomToggle } from './CustomToggle';

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
  customContext: string;
  setCustomContext: (v: string) => void;
}

const ModelDetails: React.FC<{ model?: ModelDefinition }> = ({ model }) => {
  if (!model) return null;
  const { metadata } = model;

  return (
    <div className="mt-3 p-3 bg-light-darker/40 dark:bg-brand-base/40 border border-light-border/50 dark:border-brand-border/50 rounded-xl space-y-2.5 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-mono text-light-muted dark:text-brand-muted uppercase tracking-tighter">by {metadata.author}</span>
        <span className="text-[10px] font-mono font-bold text-brand-accent">{metadata.context} context</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1 border-t border-light-border/30 dark:border-brand-border/30">
        <div className="flex flex-col">
          <span className="text-[11px] font-mono text-gray-700 dark:text-gray-300 font-bold">{metadata.inputPrice} input tokens</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[11px] font-mono text-gray-700 dark:text-gray-300 font-bold">{metadata.outputPrice} output tokens</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-mono text-gray-700 dark:text-gray-300 font-bold">Latency {metadata.latency}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[11px] font-mono text-gray-700 dark:text-gray-300 font-bold">Throughput {metadata.throughput}</span>
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
  maxTokens, setMaxTokens, maxAgentIterations, setMaxAgentIterations,
  customContext, setCustomContext
}) => {
  const toggleBtnClass = "w-full flex items-center justify-between p-4 rounded-xl border border-light-border dark:border-brand-border bg-light-darker dark:bg-[#252525] transition-all hover:bg-light-border/30 dark:hover:bg-brand-border/50";
  const selectedModelDef = SUPPORTED_MODELS.find(m => m.id === selectedModel);

  const [showCustomContext, setShowCustomContext] = useState(false);
  const responsive = useResponsive();

  return (
    <div className={`flex flex-col h-full bg-light-base dark:bg-brand-darker border-l border-light-border dark:border-transparent ${responsive.isMobile ? 'p-4' : 'p-6'} w-full transition-colors overflow-y-auto relative`}>

      <div className={`${responsive.isMobile ? 'space-y-6' : 'space-y-10'}`}>
        <div>
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-mono text-light-muted dark:text-brand-muted uppercase tracking-widest">
                {selectedModelDef?.isFree && (
                  <span className="ml-1 px-1 py-0.5 bg-light-darker dark:bg-brand-base border border-light-border dark:border-brand-border rounded text-[8px] font-bold">FREE</span>
                )}
              </label>

              <div
                onClick={onOpenModelSelector}
                className="w-full bg-light-darker dark:bg-[#252525] border border-light-border dark:border-brand-border rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-brand-accent/30 dark:hover:border-brand-accent/50 group transition-all"
              >
                <div className="flex items-center gap-3">
                  {selectedModelDef && (
                    <div className="w-8 h-8 bg-white rounded p-1 flex items-center justify-center">
                      <img src={selectedModelDef.logo} alt="" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="text-left">
                    <div className="text-[13px] font-bold text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors line-clamp-1">
                      {selectedModelDef?.name || 'Select Model'}
                    </div>
                    <div className="text-[10px] text-light-muted dark:text-brand-muted uppercase tracking-wider">
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

        <div className="mb-4 space-y-8">
          <div className="pt-8 border-t border-light-border/30 dark:border-brand-border/30">
            <button
              onClick={() => setShowCustomContext(!showCustomContext)}
              className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-2">
                <h2 className="text-md text-gray-900 dark:text-white tracking-tight">Custom Instructions</h2>
              </div>
              {showCustomContext ? <ChevronDown size={14} className="text-gray-500 dark:text-gray-400" /> : <ChevronRight size={14} className="text-gray-500 dark:text-gray-400" />}
            </button>

            {showCustomContext && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <textarea
                  value={customContext}
                  onChange={(e) => setCustomContext(e.target.value)}
                  placeholder="Record developer preferences, specific answer styles, or permanent context here..."
                  className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-light-border dark:border-brand-border rounded-xl p-4 focus:border-brand-accent/30 dark:focus:border-brand-accent/50 transition-all text-[12px] font-mono h-40 resize-none text-gray-700 dark:text-gray-300 outline-none leading-relaxed placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-inner"
                />
                <div className="flex items-start gap-2 px-1">
                  <p className="text-[9px] text-light-muted dark:text-brand-muted italic leading-relaxed">
                    Content here is ALWAYS analyzed by the agent during planning to prevent recurring reasoning failures.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='border-t border-light-border/30 dark:border-brand-border/30 pt-10 space-y-10'>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-md text-gray-900 dark:text-white tracking-tight">Generation Controls</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={onClearChat}
                title="Clear Chat"
                className="p-1.5 hover:bg-red-500/10 rounded transition-all text-gray-500 hover:text-red-500 flex items-center gap-1.5 group"
              >
                <div className="text-[9px] font-bold uppercase tracking-wider hidden sm:inline opacity-0 group-hover:opacity-100 transition-opacity">Clear</div>
                <Trash2 size={14} />
              </button>
              <button 
                onClick={onClearContext} 
                className="p-1.5 hover:bg-light-border dark:hover:bg-brand-border rounded transition-colors text-gray-500 dark:text-gray-400 hover:text-brand-accent" 
                title="Clear Context History"
              >
                <Eraser size={14} />
              </button>
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <button onClick={() => setUseContextHistory(!useContextHistory)} className={toggleBtnClass}>
                  <div className="flex flex-col items-start">
                    <span className="text-[13px] font-bold text-gray-800 dark:text-gray-200">Context Continuity</span>
                    <span className="text-[10px] font-mono text-light-muted dark:text-brand-muted uppercase tracking-tighter">{useContextHistory ? 'Learning Logs' : 'Isolated Turns'}</span>
                  </div>
                  <CustomToggle
                    checked={useContextHistory}
                    onChange={setUseContextHistory}
                  />
                </button>
                {useContextHistory && (
                  <div className="px-3 flex items-start gap-2 animate-[fadeIn_0.3s_ease-out]">
                    <p className="text-[10px] text-light-muted dark:text-brand-muted leading-relaxed">
                      Enabling continuity will cause a reasonable slowness in response time.
                    </p>
                  </div>
                )}
              </div>

              <button onClick={() => setUseVault(!useVault)} className={toggleBtnClass}>
                <div className="flex flex-col items-start">
                  <span className="text-[13px] font-bold text-gray-800 dark:text-gray-200">Knowledge Vault</span>
                  <span className="text-[10px] font-mono text-light-muted dark:text-brand-muted uppercase tracking-tighter">{useVault ? 'Active Indexing' : 'Isolated Mode'}</span>
                </div>
                <CustomToggle
                  checked={useVault}
                  onChange={setUseVault}
                />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-gray-800 dark:text-gray-200">Max Output Tokens</span>
                <span className="text-[10px] font-mono text-brand-accent bg-brand-accent/10 px-1.5 py-0.5 rounded">{maxTokens}</span>
              </div>
              <input
                type="range"
                min="100"
                max="8000"
                step="100"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full accent-brand-accent bg-light-border dark:bg-brand-border h-1.5 rounded-full appearance-none cursor-pointer hover:bg-light-border/80 dark:hover:bg-brand-border/80 transition-all"
              />
              <p className="text-[10px] text-light-muted dark:text-brand-muted">Limits the length of the AI's response.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-gray-800 dark:text-gray-200">Max Research Iterations</span>
                <span className="text-[10px] font-mono text-brand-accent bg-brand-accent/10 px-1.5 py-0.5 rounded">{maxAgentIterations}</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={maxAgentIterations}
                onChange={(e) => setMaxAgentIterations(parseInt(e.target.value))}
                className="w-full accent-brand-accent bg-light-border dark:bg-brand-border h-1.5 rounded-full appearance-none cursor-pointer hover:bg-light-border/80 dark:hover:bg-brand-border/80 transition-all"
              />
              <p className="text-[10px] text-light-muted dark:text-brand-muted">Limits how many steps the agent can take per session.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};