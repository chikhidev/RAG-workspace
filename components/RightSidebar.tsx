
import React from 'react';
import { Send, Loader2, Sun, Moon, Terminal, Cpu, Eraser, Layers, Key, Settings2, Layout, Maximize2, AlertCircle } from 'lucide-react';
import { SUPPORTED_MODELS } from '../services/modelService';
import { ModelDefinition } from '../types';

interface Props {
  inputValue: string;
  setInputValue: (v: string) => void;
  onSend: () => void;
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
  inputValue, setInputValue, onSend, onHistoryNav, isProcessing,
  useVault, setUseVault, useContextHistory, setUseContextHistory,
  onClearContext, expanderModel, setExpanderModel, reasonerModel, setReasonerModel,
  onOpenApiManagement, inputPosition, setInputPosition
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const toggleBtnClass = "w-full flex items-center justify-between p-4 rounded-xl border border-brand-border bg-[#252525] transition-all hover:bg-brand-border/50";
  const selectClass = "w-full bg-[#252525] border border-brand-border rounded-xl p-3 text-[13px] font-bold text-gray-200 outline-none focus:border-brand-accent/50 appearance-none cursor-pointer hover:border-brand-accent/30 transition-all pl-10";

  const smallModels = SUPPORTED_MODELS.filter(m => m.size === 'small');
  const largeModels = SUPPORTED_MODELS.filter(m => m.size === 'large');

  const selectedExpander = SUPPORTED_MODELS.find(m => m.id === expanderModel);
  const selectedReasoner = SUPPORTED_MODELS.find(m => m.id === reasonerModel);

  return (
    <div className="flex flex-col h-full bg-brand-darker border-l border-transparent p-6 w-full transition-colors overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-brand-accent" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-muted">Studio Controller</span>
        </div>
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-white tracking-tight">Synthesis Query</h2>
          <button 
            onClick={() => setInputPosition(inputPosition === 'floating' ? 'sidebar' : 'floating')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              inputPosition === 'floating' 
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
              value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Describe your reasoning task..."
              className="w-full bg-brand-base border border-brand-border rounded-xl p-5 focus:border-brand-accent transition-all text-[14px] font-medium h-40 resize-none text-gray-200 outline-none leading-relaxed placeholder:text-brand-muted/50"
            />
            <button
              onClick={onSend} disabled={isProcessing || !inputValue.trim()}
              className="absolute bottom-4 right-4 bg-brand-accent hover:bg-brand-accent/90 disabled:bg-brand-border disabled:text-brand-muted h-10 w-10 flex items-center justify-center rounded-lg transition-all shadow-xl"
            >
              {isProcessing ? <Loader2 className="animate-spin text-white" size={16} /> : <Send className="text-white" size={16} />}
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
              <div className="relative group/select">
                {selectedExpander && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center z-10 pointer-events-none bg-white rounded p-0.5">
                    <img src={selectedExpander.logo} alt="" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                <select value={expanderModel} onChange={(e) => setExpanderModel(e.target.value)} className={selectClass}>
                  {smallModels.map(m => (
                    <option key={m.id} value={m.id} title={m.description}>
                      {m.name} {m.isFree ? '(FREE)' : ''}
                    </option>
                  ))}
                </select>
                <Settings2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover/select:text-brand-accent transition-colors" />
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
              <div className="relative group/select">
                {selectedReasoner && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center z-10 pointer-events-none bg-white rounded p-0.5">
                    <img src={selectedReasoner.logo} alt="" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                <select value={reasonerModel} onChange={(e) => setReasonerModel(e.target.value)} className={selectClass}>
                  {largeModels.map(m => (
                    <option key={m.id} value={m.id} title={m.description}>
                      {m.name} {m.isFree ? '(FREE)' : ''}
                    </option>
                  ))}
                </select>
                <Settings2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover/select:text-brand-accent transition-colors" />
              </div>
              <ModelDetails model={selectedReasoner} />
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

      <div className="mt-auto pt-8 flex flex-col items-center gap-3">
        <p className="text-[9px] font-mono text-brand-muted uppercase tracking-[0.4em]">Integrated Synthesis Engine</p>
        <div className="flex gap-1.5">
          <div className="w-1 h-1 bg-brand-accent rounded-full animate-pulse"></div>
          <div className="w-1 h-1 bg-brand-accent/40 rounded-full animate-pulse [animation-delay:0.2s]"></div>
          <div className="w-1 h-1 bg-brand-accent/20 rounded-full animate-pulse [animation-delay:0.4s]"></div>
        </div>
      </div>
    </div>
  );
};
