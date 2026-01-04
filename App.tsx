import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DocumentList } from './components/DocumentList';
import { ChatInterface } from './components/ChatInterface';
import { RightSidebar } from './components/RightSidebar';
import { AppState, Message, Document, Chunk, Toast } from './types';
import { vectorService } from './services/vectorService';
import { geminiRAG } from './services/geminiService';
import { X, Key, Shield } from 'lucide-react';

const STORAGE_KEYS = {
  DOCUMENTS: 'gemini_rag_docs',
  SETTINGS: 'gemini_rag_settings',
  PROMPT_HISTORY: 'gemini_rag_history',
  CONTEXT_SCRIPT: 'gemini_rag_context_script',
  OPENROUTER_KEY: 'gemini_rag_openrouter_key'
};

const ApiKeyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  openRouterKey: string;
  setOpenRouterKey: (k: string) => void;
}> = ({ isOpen, onClose, openRouterKey, setOpenRouterKey }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-brand-darker w-full max-w-md rounded-2xl border border-gray-100 dark:border-brand-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-brand-border flex items-center justify-between bg-gray-50/50 dark:bg-brand-base/50">
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-serif italic font-bold text-gray-900 dark:text-gray-100">API Key Management</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-brand-base rounded-lg transition-colors text-gray-400">
            <X size={18} />
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-mono text-gray-400 dark:text-brand-muted uppercase tracking-widest">
              <Key size={12} className="text-brand-accent" />
              OpenRouter Key
            </label>
            <input 
              type="password" 
              value={openRouterKey} 
              onChange={(e) => setOpenRouterKey(e.target.value)} 
              placeholder="sk-or-v1-..."
              className="w-full bg-gray-50 dark:bg-[#252525] border border-gray-100 dark:border-brand-border rounded-xl p-4 text-[13px] font-mono text-gray-700 dark:text-gray-200 outline-none focus:border-brand-accent/50 transition-all"
            />
            <p className="text-[10px] text-gray-400 dark:text-brand-muted leading-relaxed italic">
              Your keys are stored locally in your browser and never sent to our servers.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-full py-3.5 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl text-[13px] font-bold tracking-wider transition-all"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const loadInitialDocs = (): Document[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return stored ? JSON.parse(stored) : [];
  };

  const loadInitialSettings = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const defaults = {
      useVault: true,
      useContextHistory: false, // Defaulting to false as requested
      temperature: 0.7,
      theme: 'dark' as const,
      expanderModel: 'nvidia/nemotron-nano-9b-v2:free', // Default small model for brain
      reasonerModel: 'nex-agi/deepseek-v3.1-nex-n1:free' // Default large model for reasoning
    };
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  };

  const initialSettings = loadInitialSettings();

  const [state, setState] = useState<AppState & { isApiKeyModalOpen: boolean }>({
    documents: loadInitialDocs(),
    messages: [],
    isIndexing: false,
    isProcessing: false,
    toasts: [],
    temperature: initialSettings.temperature,
    theme: initialSettings.theme,
    useVault: initialSettings.useVault,
    useContextHistory: initialSettings.useContextHistory,
    contextScript: localStorage.getItem(STORAGE_KEYS.CONTEXT_SCRIPT) || "",
    expanderModel: initialSettings.expanderModel,
    reasonerModel: initialSettings.reasonerModel,
    openRouterKey: localStorage.getItem(STORAGE_KEYS.OPENROUTER_KEY) || "",
    isApiKeyModalOpen: false
  });

  const [inputValue, setInputValue] = useState('');
  const [promptHistory, setPromptHistory] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.PROMPT_HISTORY);
    return stored ? JSON.parse(stored) : [];
  });
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [rightWidth, setRightWidth] = useState(320);
  const isResizing = useRef(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(state.documents));
  }, [state.documents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
      useVault: state.useVault,
      useContextHistory: state.useContextHistory,
      temperature: state.temperature,
      theme: state.theme,
      expanderModel: state.expanderModel,
      reasonerModel: state.reasonerModel
    }));
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.useVault, state.useContextHistory, state.temperature, state.theme, state.expanderModel, state.reasonerModel]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OPENROUTER_KEY, state.openRouterKey);
  }, [state.openRouterKey]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONTEXT_SCRIPT, state.contextScript);
  }, [state.contextScript]);

  const addToast = (message: string, type: Toast['type'] = 'error') => {
    const id = Math.random().toString(36).substring(2, 9);
    setState(prev => ({ ...prev, toasts: [...prev.toasts, { id, message, type }] }));
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setState(prev => ({ ...prev, toasts: prev.toasts.filter(t => t.id !== id) }));
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth > 240 && newWidth < 800) setRightWidth(newWidth);
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
  }, [handleMouseMove]);

  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
  }, [handleMouseMove, stopResizing]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if (state.documents.length + files.length > 10) {
      addToast("File limit reached (10 max).");
      return;
    }
    const newDocs: Document[] = [];
    const fileArray = Array.from(files) as File[];
    for (const file of fileArray) {
      try {
        const text = await file.text();
        newDocs.push({ id: Math.random().toString(36).substring(2, 11), name: file.name, content: text, enabled: true });
      } catch (err) { addToast(`Failed to read ${file.name}`); }
    }
    setState(prev => ({ ...prev, documents: [...prev.documents, ...newDocs] }));
  }, [state.documents]);

  useEffect(() => {
    const runIndexing = async () => {
      setState(prev => ({ ...prev, isIndexing: true }));
      try {
        await vectorService.indexDocuments(state.documents.filter(d => d.enabled));
      } catch (err) { addToast("Indexing failure."); }
      finally { setState(prev => ({ ...prev, isIndexing: false })); }
    };
    runIndexing();
  }, [state.documents]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || state.isProcessing) return;
    if (!state.openRouterKey) {
      setState(prev => ({ ...prev, isApiKeyModalOpen: true }));
      addToast("Please set your OpenRouter API Key first.");
      return;
    }

    const currentQuery = inputValue.trim();
    setPromptHistory(prev => [currentQuery, ...prev.filter(p => p !== currentQuery)].slice(0, 50));
    setHistoryIndex(-1);
    
    const assistantId = Date.now().toString() + '-ai';
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: currentQuery, timestamp: new Date() };
    const placeholder: Message = { id: assistantId, role: 'assistant', content: '', status: state.useVault ? 'expanding' : 'reasoning', timestamp: new Date() };

    setState(prev => ({ ...prev, messages: [...prev.messages, userMsg, placeholder], isProcessing: true }));
    setInputValue('');

    try {
      let expandedQuery = '';
      let sources: Chunk[] = [];
      const activeDocs = state.documents.filter(d => d.enabled);
      const hist = state.useContextHistory ? state.contextScript : "";

      if (state.useVault && activeDocs.length > 0) {
        expandedQuery = await geminiRAG.expandQuery(
          currentQuery, 
          activeDocs.map(d => d.name), 
          activeDocs.map(d => d.content.substring(0, 300)), 
          state.temperature, 
          hist, 
          state.expanderModel,
          state.openRouterKey
        );
        setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === assistantId ? { ...m, expandedQuery, status: 'searching' } : m) }));
        sources = await vectorService.search(expandedQuery);
        setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === assistantId ? { ...m, sources, status: 'reasoning' } : m) }));
      }

      const startTime = performance.now();
      const { answer } = await geminiRAG.generateAnswer(
        currentQuery, expandedQuery, sources,
        state.temperature, state.useVault, state.reasonerModel, hist, state.openRouterKey
      );
      
      const duration = (performance.now() - startTime) / 1000;
      setState(prev => ({ 
        ...prev, 
        messages: prev.messages.map(m => m.id === assistantId ? { ...m, content: answer, status: 'completed', reasoningDuration: duration } : m) 
      }));

      if (state.useContextHistory) {
        const scriptLine = await geminiRAG.generateSummary(currentQuery, answer, Array.from(new Set(sources.map(s => s.docName))), state.openRouterKey);
        setState(prev => ({ ...prev, contextScript: prev.contextScript ? `${prev.contextScript}\n${scriptLine}` : scriptLine }));
      }
    } catch (err: any) {
      addToast(err.message || "Pipeline error.");
      setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === assistantId ? { ...m, status: 'error' } : m) }));
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [inputValue, state.isProcessing, state.temperature, state.documents, state.useVault, state.expanderModel, state.reasonerModel, state.contextScript, state.useContextHistory, state.openRouterKey]);

  return (
    <div className={`flex h-screen bg-brand-base text-gray-100 transition-colors overflow-hidden ${state.theme}`}>
      <DocumentList 
        documents={state.documents} onUpload={handleFileUpload} 
        onRemove={(id) => setState(prev => ({ ...prev, documents: prev.documents.filter(d => d.id !== id) }))} 
        onToggle={(id) => setState(prev => ({ ...prev, documents: prev.documents.map(d => d.id === id ? { ...d, enabled: !d.enabled } : d) }))}
        isIndexing={state.isIndexing}
      />
      
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8F9FB] dark:bg-brand-base">
        <ChatInterface messages={state.messages} />
      </main>

      <div onMouseDown={startResizing} className="w-[1px] cursor-col-resize hover:bg-brand-accent transition-colors bg-brand-border z-20 relative group">
        <div className="absolute inset-y-0 -left-1 w-2 bg-transparent group-hover:bg-brand-accent/20 transition-all"></div>
      </div>

      <div style={{ width: `${rightWidth}px` }} className="shrink-0 flex">
        <div onMouseDown={startResizing} className="w-1.5 cursor-col-resize bg-gray-100 dark:bg-brand-border hover:bg-brand-accent transition-all flex flex-col items-center justify-center gap-1 group">
          <div className="w-[1px] h-8 bg-gray-300 dark:bg-brand-muted/40 rounded-full group-hover:bg-white/50"></div>
          <div className="w-[1px] h-8 bg-gray-300 dark:bg-brand-muted/40 rounded-full group-hover:bg-white/50"></div>
        </div>

        <RightSidebar
          inputValue={inputValue} setInputValue={setInputValue}
          onSend={handleSend} onHistoryNav={(d) => {}}
          isProcessing={state.isProcessing}
          temperature={state.temperature}
          setTemperature={(t) => setState(prev => ({ ...prev, temperature: t }))}
          theme={state.theme} setTheme={(theme) => setState(prev => ({ ...prev, theme }))}
          useVault={state.useVault} setUseVault={(v) => setState(prev => ({ ...prev, useVault: v }))}
          useContextHistory={state.useContextHistory} setUseContextHistory={(v) => setState(prev => ({ ...prev, useContextHistory: v }))}
          onClearContext={() => setState(prev => ({ ...prev, contextScript: "" }))}
          expanderModel={state.expanderModel} setExpanderModel={(m) => setState(prev => ({ ...prev, expanderModel: m }))}
          reasonerModel={state.reasonerModel} setReasonerModel={(m) => setState(prev => ({ ...prev, reasonerModel: m }))}
          openRouterKey={state.openRouterKey} setOpenRouterKey={(k) => setState(prev => ({ ...prev, openRouterKey: k }))}
          onOpenApiManagement={() => setState(prev => ({ ...prev, isApiKeyModalOpen: true }))}
        />
      </div>

      <ApiKeyModal 
        isOpen={state.isApiKeyModalOpen} 
        onClose={() => setState(prev => ({ ...prev, isApiKeyModalOpen: false }))}
        openRouterKey={state.openRouterKey}
        setOpenRouterKey={(k) => setState(prev => ({ ...prev, openRouterKey: k }))}
      />

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-3 z-50 pointer-events-none w-full max-w-sm">
        {state.toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-brand-darker message-shadow rounded-2xl border border-gray-100 dark:border-brand-border animate-blur-text w-full">
            <span className={`text-[11px] font-bold uppercase tracking-widest ${toast.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>
              {toast.type}
            </span>
            <p className="flex-1 text-[13px] text-gray-700 dark:text-gray-300 font-medium">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;