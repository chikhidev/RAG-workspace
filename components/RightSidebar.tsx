import React from 'react';
import { Send, Loader2, Sliders, Sun, Moon, Terminal } from 'lucide-react';

interface Props {
  inputValue: string;
  setInputValue: (v: string) => void;
  onSend: () => void;
  isProcessing: boolean;
  temperature: number;
  setTemperature: (t: number) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const RightSidebar: React.FC<Props> = ({
  inputValue,
  setInputValue,
  onSend,
  isProcessing,
  temperature,
  setTemperature,
  theme,
  setTheme
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-brand-darker border-l border-gray-100 dark:border-brand-border p-6 w-full transition-colors overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-brand-accent" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">Controller</span>
        </div>
        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-brand-border rounded-lg transition-colors text-gray-400"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 mb-4">
          Synthesis Query
        </h2>
        <div className="relative group">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your reasoning task..."
            className="w-full bg-gray-50 dark:bg-brand-base border border-gray-100 dark:border-brand-border rounded-xl p-5 focus:border-brand-accent transition-all text-sm font-medium h-52 resize-none text-gray-800 dark:text-gray-100 outline-none leading-relaxed"
          />
          <button
            onClick={onSend}
            disabled={isProcessing || !inputValue.trim()}
            className="absolute bottom-4 right-4 bg-gray-900 dark:bg-brand-accent hover:bg-black dark:hover:bg-brand-accent/90 disabled:bg-gray-100 dark:disabled:bg-brand-border disabled:text-gray-300 dark:disabled:text-gray-600 h-10 w-10 flex items-center justify-center rounded-lg transition-all shadow-xl shadow-brand-accent/5"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin text-white" size={16} />
            ) : (
              <Send className="text-white" size={16} />
            )}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 flex items-center gap-2">
            <Sliders size={12} />
            Hyperparameters
          </h2>
          <span className="text-[11px] font-mono text-brand-accent">
            {temperature.toFixed(2)}
          </span>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-3">Model Temperature</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-[1px] bg-gray-200 dark:bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-accent"
            />
            <div className="flex justify-between mt-3 text-[9px] text-gray-400 dark:text-gray-600 font-mono uppercase tracking-widest">
              <span>Deterministic</span>
              <span>Creative</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-8 border-t border-gray-50 dark:border-brand-border">
        <div className="flex flex-col items-center gap-2">
          <p className="text-[9px] font-mono text-gray-400 dark:text-gray-700 uppercase tracking-[0.3em]">
            System v2.5.0-Flash
          </p>
          <div className="w-1 h-1 bg-brand-accent rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};