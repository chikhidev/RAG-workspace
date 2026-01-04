import React from 'react';
import { Send, Loader2, Sun, Moon, Terminal, ExternalLink, Activity } from 'lucide-react';

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
  useSmallModel: boolean;
  setUseSmallModel: (v: boolean) => void;
}

export const RightSidebar: React.FC<Props> = ({
  inputValue,
  setInputValue,
  onSend,
  onHistoryNav,
  isProcessing,
  temperature,
  setTemperature,
  theme,
  setTheme,
  useVault,
  setUseVault,
  useSmallModel,
  setUseSmallModel
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    } else if (e.key === 'ArrowUp') {
      // Only navigate history if cursor is at the beginning
      if (e.currentTarget.selectionStart === 0) {
        e.preventDefault();
        onHistoryNav('up');
      }
    } else if (e.key === 'ArrowDown') {
      // Only navigate history if cursor is at the end
      if (e.currentTarget.selectionStart === e.currentTarget.value.length) {
        e.preventDefault();
        onHistoryNav('down');
      }
    }
  };

  const handleKeyManagement = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
    } else {
      console.warn("API Key selector is unavailable in this environment.");
    }
  };

  const toggleBtnClass = "w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-brand-border bg-gray-50 dark:bg-[#252525] transition-all";

  return (
    <div className="flex flex-col h-full bg-white dark:bg-brand-darker border-l border-gray-100 dark:border-brand-border p-6 w-full transition-colors overflow-y-auto">
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
        <h2 className="text-[26px] font-serif italic text-gray-900 dark:text-white mb-4 tracking-tight">
          Synthesis Query
        </h2>
        <div className="relative group">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your reasoning task..."
            className="w-full bg-gray-50 dark:bg-brand-base border border-gray-200 dark:border-brand-border rounded-xl p-5 focus:border-brand-accent transition-all text-[14px] font-medium h-48 resize-none text-gray-900 dark:text-gray-200 outline-none leading-relaxed placeholder:text-gray-400 dark:placeholder:text-brand-muted/50"
          />
          <button
            onClick={onSend}
            disabled={isProcessing || !inputValue.trim()}
            className="absolute bottom-4 right-4 bg-brand-accent hover:bg-brand-accent/90 disabled:bg-gray-100 dark:disabled:bg-brand-border disabled:text-gray-300 dark:disabled:text-brand-muted h-10 w-10 flex items-center justify-center rounded-lg transition-all shadow-2xl shadow-brand-accent/20"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin text-white" size={16} />
            ) : (
              <Send className="text-white" size={16} />
            )}
          </button>
        </div>
        <div className="mt-2 text-[9px] font-mono text-gray-400 dark:text-brand-muted uppercase tracking-wider text-right">
          Use ↑ for history
        </div>
      </div>

      <div className="mb-10 space-y-8">
        <div>
          <h2 className="text-[26px] font-serif italic text-gray-900 dark:text-white mb-6 tracking-tight">
            Brain Config
          </h2>
          <div className="space-y-3">
            <button 
              onClick={() => setUseVault(!useVault)}
              className={toggleBtnClass}
            >
              <div className="flex flex-col items-start">
                <span className="text-[13px] font-bold text-gray-700 dark:text-gray-200">Knowledge Vault</span>
                <span className="text-[10px] font-mono uppercase tracking-tighter text-gray-400 dark:text-brand-muted">
                  {useVault ? 'Active Indexing' : 'Isolated Mode'}
                </span>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${useVault ? 'bg-brand-accent' : 'bg-gray-200 dark:bg-brand-border'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${useVault ? 'left-6' : 'left-1'}`} />
              </div>
            </button>

            <button 
              onClick={() => setUseSmallModel(!useSmallModel)}
              className={toggleBtnClass}
            >
              <div className="flex flex-col items-start">
                <span className="text-[13px] font-bold text-gray-700 dark:text-gray-200">Response Model</span>
                <span className="text-[10px] font-mono uppercase tracking-tighter text-gray-400 dark:text-brand-muted">
                  {useSmallModel ? 'Gemini 3 Flash' : 'Gemini 3 Pro'}
                </span>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${!useSmallModel ? 'bg-brand-accent' : 'bg-gray-200 dark:bg-brand-border'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${!useSmallModel ? 'left-6' : 'left-1'}`} />
              </div>
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[26px] font-serif italic text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
              Parameters
            </h2>
            <span className="text-[11px] font-mono text-brand-accent font-bold">
              {temperature.toFixed(2)}
            </span>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-medium text-gray-400 dark:text-brand-muted mb-3 uppercase tracking-widest">Model Temperature</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-[1px] bg-gray-200 dark:bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-accent"
              />
              <div className="flex justify-between mt-3 text-[9px] text-gray-400 dark:text-brand-muted font-mono uppercase tracking-widest">
                <span>Stable</span>
                <span>Fluid</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-10 border-t border-gray-100 dark:border-brand-border">
        <h2 className="text-[26px] font-serif italic text-gray-900 dark:text-white mb-5 flex items-center gap-2 tracking-tight">
          Infrastructure
        </h2>
        
        <div className="space-y-3">
          <button 
            onClick={handleKeyManagement}
            className="w-full flex items-center justify-between p-3.5 bg-gray-50 dark:bg-brand-base border border-gray-200 dark:border-brand-border hover:border-brand-accent/50 rounded-xl transition-all group"
          >
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200">Google API Access</span>
              <span className="text-[9px] font-mono text-gray-400 dark:text-brand-muted uppercase tracking-tighter">Manage Credentials</span>
            </div>
            <Activity size={14} className="text-gray-400 dark:text-brand-muted group-hover:text-brand-accent" />
          </button>

          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between p-3.5 bg-gray-50/50 dark:bg-brand-base/50 border border-gray-100 dark:border-brand-border hover:bg-gray-100 dark:hover:bg-brand-base rounded-xl transition-all group"
          >
             <div className="flex flex-col items-start gap-0.5">
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Billing Docs</span>
              <span className="text-[9px] font-mono text-gray-400 dark:text-brand-muted uppercase tracking-tighter">Project Quotas</span>
            </div>
            <ExternalLink size={12} className="text-gray-400 dark:text-brand-muted" />
          </a>
        </div>
      </div>

      <div className="mt-auto pt-8 flex flex-col items-center gap-3">
        <p className="text-[9px] font-mono text-gray-400 dark:text-brand-muted uppercase tracking-[0.4em]">
          Core v3.Pro-Image
        </p>
        <div className="flex gap-1.5">
          <div className="w-1 h-1 bg-brand-accent rounded-full animate-pulse"></div>
          <div className="w-1 h-1 bg-brand-accent/40 rounded-full animate-pulse [animation-delay:0.2s]"></div>
          <div className="w-1 h-1 bg-brand-accent/20 rounded-full animate-pulse [animation-delay:0.4s]"></div>
        </div>
      </div>
    </div>
  );
};