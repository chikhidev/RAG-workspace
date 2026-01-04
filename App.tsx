import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DocumentList } from './components/DocumentList';
import { ChatInterface } from './components/ChatInterface';
import { RightSidebar } from './components/RightSidebar';
import { AppState, Message, Document, Chunk, Toast } from './types';
import { vectorService } from './services/vectorService';
import { geminiRAG } from './services/geminiService';
import { X } from 'lucide-react';

const STORAGE_KEYS = {
  DOCUMENTS: 'gemini_rag_docs',
  SETTINGS: 'gemini_rag_settings',
  PROMPT_HISTORY: 'gemini_rag_history',
  CONTEXT_SCRIPT: 'gemini_rag_context_script'
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
      useContextHistory: true,
      temperature: 0.7,
      theme: 'dark' as const,
      expanderModel: 'gemini-3-flash-preview',
      reasonerModel: 'gemini-3-pro-preview'
    };
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  };

  const initialSettings = loadInitialSettings();

  const [state, setState] = useState<AppState>({
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
    reasonerModel: initialSettings.reasonerModel
  });

  const [inputValue, setInputValue] = useState('');
  const [promptHistory, setPromptHistory] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.PROMPT_HISTORY);
    return stored ? JSON.parse(stored) : [];
  });
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [draftValue, setDraftValue] = useState('');
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
    // Fix: Cast the file list to a File array to resolve 'unknown' type issues in the iteration.
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
          state.expanderModel
        );
        setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === assistantId ? { ...m, expandedQuery, status: 'searching' } : m) }));
        sources = await vectorService.search(expandedQuery);
        setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === assistantId ? { ...m, sources, status: 'reasoning' } : m) }));
      }

      const startTime = performance.now();
      const { answer } = await geminiRAG.generateAnswer(
        currentQuery, expandedQuery, sources, activeDocs.map(d => d.name), [], 
        state.temperature, state.useVault, state.reasonerModel, hist
      );
      
      const duration = (performance.now() - startTime) / 1000;
      setState(prev => ({ 
        ...prev, 
        messages: prev.messages.map(m => m.id === assistantId ? { ...m, content: answer, status: 'completed', reasoningDuration: duration } : m) 
      }));

      if (state.useContextHistory) {
        const scriptLine = await geminiRAG.generateSummary(currentQuery, answer, Array.from(new Set(sources.map(s => s.docName))));
        setState(prev => ({ ...prev, contextScript: prev.contextScript ? `${prev.contextScript}\n${scriptLine}` : scriptLine }));
      }
    } catch (err: any) {
      addToast(err.message || "Pipeline error.");
      setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === assistantId ? { ...m, status: 'error' } : m) }));
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [inputValue, state.isProcessing, state.temperature, state.documents, state.useVault, state.expanderModel, state.reasonerModel, state.contextScript, state.useContextHistory]);

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
        {/* The Draggable Border Handle */}
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
        />
      </div>

      {/* Floating Toasts */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-3 z-50 pointer-events-none">
        {state.toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-brand-darker message-shadow rounded-2xl border border-gray-100 dark:border-brand-border animate-blur-text min-w-[320px]">
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