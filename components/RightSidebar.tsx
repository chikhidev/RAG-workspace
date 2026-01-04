import React from 'react';
import { Send, Loader2, Sun, Moon, Terminal, Cpu, Eraser, Layers } from 'lucide-react';

interface Props {
  inputValue: string;
  setInputValue: (v: string) => void;
  onSend: () => void;
  onHistoryNav: (direction: 'up' | 'down') => void;
  isProcessing: boolean;
  temperature: number;
  setTemperature: (t: number) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  useVault: boolean;
  setUseVault: (v: boolean) => void;
  useContextHistory: boolean;
  setUseContextHistory: (v: boolean) => void;
  onClearContext: () => void;
  expanderModel: string;
  setExpanderModel: (m: string) => void;
  reasonerModel: string;
  setReasonerModel: (m: string) => void;
}

const SUPPORTED_MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro' },
  { id: 'gemini-flash-lite-latest', name: 'Flash Lite' },
  { id: 'gemini-2.5-flash-native-audio-preview-09-2025', name: 'Native Audio' },
];

export const RightSidebar: React.FC<Props> = ({
  inputValue, setInputValue, onSend, onHistoryNav, isProcessing,
  temperature, setTemperature, theme, setTheme,
  useVault, setUseVault, useContextHistory, setUseContextHistory,
  onClearContext, expanderModel, setExpanderModel, reasonerModel, setReasonerModel
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const toggleBtnClass = "w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-brand-border bg-gray-50 dark:bg-[#252525] transition-all";
  const selectClass = "w-full bg-gray-50 dark:bg-[#252525] border border-gray-100 dark:border-brand-border rounded-xl p-3 text-[13px] font-bold text-gray-700 dark:text-gray-200 outline-none focus:border-brand-accent/50 appearance-none cursor-pointer";

  return (
    <div className="flex flex-col h-full bg-white dark:bg-brand-darker border-l border-transparent p-6 w-full transition-colors overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-brand-accent" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400 dark:text-brand-muted">Studio Controller</span>
        </div>
        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-brand-border rounded-lg transition-colors text-gray-400 dark:text-brand-muted hover:text-gray-900 dark:hover:text-white"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>

      <div className="mb-10">
        <h2 className="text-[26px] font-serif italic text-gray-900 dark:text-white tracking-tight mb-4">Synthesis Query</h2>
        <div className="relative group">
          <textarea
            value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Describe your reasoning task..."
            className="w-full bg-gray-50 dark:bg-brand-base border border-gray-200 dark:border-brand-border rounded-xl p-5 focus:border-brand-accent transition-all text-[14px] font-medium h-40 resize-none text-gray-900 dark:text-gray-200 outline-none leading-relaxed placeholder:text-gray-400 dark:placeholder:text-brand-muted/50"
          />
          <button
            onClick={onSend} disabled={isProcessing || !inputValue.trim()}
            className="absolute bottom-4 right-4 bg-brand-accent hover:bg-brand-accent/90 disabled:bg-gray-100 dark:disabled:bg-brand-border disabled:text-gray-300 dark:disabled:text-brand-muted h-10 w-10 flex items-center justify-center rounded-lg transition-all shadow-xl"
          >
            {isProcessing ? <Loader2 className="animate-spin text-white" size={16} /> : <Send className="text-white" size={16} />}
          </button>
        </div>
      </div>

      <div className="mb-10 space-y-8">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[26px] font-serif italic text-gray-900 dark:text-white tracking-tight">Brain Config</h2>
            <button onClick={onClearContext} className="p-1.5 hover:bg-gray-100 dark:hover:bg-brand-border rounded transition-colors text-gray-400 hover:text-brand-accent"><Eraser size={14} /></button>
          </div>
          <div className="space-y-3">
            <button onClick={() => setUseContextHistory(!useContextHistory)} className={toggleBtnClass}>
              <div className="flex flex-col items-start">
                <span className="text-[13px] font-bold text-gray-700 dark:text-gray-200">Context Continuity</span>
                <span className="text-[10px] font-mono text-gray-400 dark:text-brand-muted uppercase tracking-tighter">{useContextHistory ? 'Learning Logs' : 'Isolated Turns'}</span>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${useContextHistory ? 'bg-brand-accent' : 'bg-gray-200 dark:bg-brand-border'}`}><div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${useContextHistory ? 'left-6' : 'left-1'}`} /></div>
            </button>
            <button onClick={() => setUseVault(!useVault)} className={toggleBtnClass}>
              <div className="flex flex-col items-start">
                <span className="text-[13px] font-bold text-gray-700 dark:text-gray-200">Knowledge Vault</span>
                <span className="text-[10px] font-mono text-gray-400 dark:text-brand-muted uppercase tracking-tighter">{useVault ? 'Active Indexing' : 'Isolated Mode'}</span>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${useVault ? 'bg-brand-accent' : 'bg-gray-200 dark:bg-brand-border'}`}><div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${useVault ? 'left-6' : 'left-1'}`} /></div>
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[26px] font-serif italic text-gray-900 dark:text-white tracking-tight">Parameters</h2>
            <span className="text-[11px] font-mono text-brand-accent font-bold">{temperature.toFixed(2)}</span>
          </div>
          <input type="range" min="0" max="2" step="0.01" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full h-[1px] bg-gray-200 dark:bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-accent" />
        </div>
      </div>

      <div className="mt-4 pt-10 border-t border-gray-100 dark:border-brand-border">
        <h2 className="text-[26px] font-serif italic text-gray-900 dark:text-white mb-6 tracking-tight">Infrastructure</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-mono text-gray-400 dark:text-brand-muted uppercase tracking-widest"><Layers size={12} className="text-brand-accent" /> Brain (Expander)</label>
            <select value={expanderModel} onChange={(e) => setExpanderModel(e.target.value)} className={selectClass}>
              {SUPPORTED_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-mono text-gray-400 dark:text-brand-muted uppercase tracking-widest"><Cpu size={12} className="text-brand-accent" /> Synthesizer (Reasoner)</label>
            <select value={reasonerModel} onChange={(e) => setReasonerModel(e.target.value)} className={selectClass}>
              {SUPPORTED_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};