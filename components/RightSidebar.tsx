import React from 'react';
import { Send, Loader2, Sliders, Sun, Moon } from 'lucide-react';

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
    <div className="flex flex-col h-full bg-white dark:bg-brand-base border-l border-gray-100 dark:border-brand-border p-6 w-full transition-colors overflow-y-auto">
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-brand-darker rounded-full transition-colors text-gray-400 dark:text-brand-accent"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-2">
          Input & Actions
        </h2>
        <div className="relative group">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your query..."
            className="w-full bg-gray-50 dark:bg-brand-darker border border-gray-100 dark:border-brand-border rounded-2xl p-4 focus:ring-2 focus:ring-purple-100 dark:focus:ring-brand-accent/20 focus:border-purple-300 dark:focus:border-brand-accent transition-all text-sm font-medium h-48 resize-none text-gray-800 dark:text-gray-100"
          />
          <button
            onClick={onSend}
            disabled={isProcessing || !inputValue.trim()}
            className="absolute bottom-4 right-4 bg-purple-600 dark:bg-brand-accent hover:bg-purple-700 dark:hover:bg-brand-accent/80 disabled:bg-gray-100 dark:disabled:bg-brand-darker disabled:text-gray-300 dark:disabled:text-gray-600 h-10 w-10 flex items-center justify-center rounded-xl transition-all shadow-lg shadow-purple-600/10 dark:shadow-none"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin text-white" size={18} />
            ) : (
              <Send className="text-white" size={18} />
            )}
          </button>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-2">
            <Sliders size={14} />
            Brain Config
          </h2>
          <span className="text-[10px] font-bold text-purple-600 dark:text-brand-accent bg-purple-50 dark:bg-brand-accent/10 px-2 py-0.5 rounded-full">
            {temperature.toFixed(1)}
          </span>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-2">Temperature</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-100 dark:bg-brand-border rounded-lg appearance-none cursor-pointer accent-purple-600 dark:accent-brand-accent"
            />
            <div className="flex justify-between mt-2 text-[9px] text-gray-400 font-medium">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-gray-50 dark:border-brand-border">
        <p className="text-[10px] text-gray-300 dark:text-gray-600 leading-relaxed text-center">
          Adjust temperature to control the randomness of the dual-brain synthesis.
        </p>
      </div>
    </div>
  );
};