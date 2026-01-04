import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DocumentList } from './components/DocumentList';
import { ChatInterface } from './components/ChatInterface';
import { RightSidebar } from './components/RightSidebar';
import { AppState, Message, Document, Chunk, Toast } from './types';
import { vectorService } from './services/vectorService';
import { geminiRAG } from './services/geminiService';
import { X, Key, Shield, ExternalLink } from 'lucide-react';

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
      <div className="bg-brand-darker w-full max-w-md rounded-2xl border border-brand-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-brand-base/50">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-100">API Key Management</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-brand-base rounded-lg transition-colors text-gray-400">
            <X size={18} />
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-mono text-brand-muted uppercase tracking-widest">
                OpenRouter Key
              </label>
              <input 
                type="password" 
                value={openRouterKey} 
                onChange={(e) => setOpenRouterKey(e.target.value)} 
                placeholder="sk-or-v1-..."
                className="w-full bg-[#252525] border border-brand-border rounded-xl p-4 text-[13px] font-mono text-gray-200 outline-none focus:border-brand-accent/50 transition-all"
              />
            </div>
            
           
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

const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-brand-darker w-full max-w-sm rounded-2xl border border-brand-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-brand-base/50">
          <h3 className="text-sm font-bold text-gray-100">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-brand-base rounded-lg transition-colors text-gray-400">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-[13px] text-gray-300 leading-relaxed">
            {message}
          </p>
          <div className="flex gap-3 pt-2">
            <button 
              onClick={onClose}
              className="flex-1 py-2.5 bg-brand-base hover:bg-brand-border text-gray-300 rounded-xl text-[12px] font-bold transition-all border border-brand-border"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-[12px] font-bold transition-all"
            >
              Confirm
            </button>
          </div>
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
      useContextHistory: false,
      expanderModel: 'cohere/command-r7b-12-2024',
      reasonerModel: 'openai/gpt-oss-safeguard-20b',
      inputPosition: 'floating' as const
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
    useVault: initialSettings.useVault,
    useContextHistory: initialSettings.useContextHistory,
    contextScript: localStorage.getItem(STORAGE_KEYS.CONTEXT_SCRIPT) || "",
    expanderModel: initialSettings.expanderModel,
    reasonerModel: initialSettings.reasonerModel,
    openRouterKey: localStorage.getItem(STORAGE_KEYS.OPENROUTER_KEY) || "",
    inputPosition: initialSettings.inputPosition,
    isApiKeyModalOpen: false
  });

  const [inputValue, setInputValue] = useState('');
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [promptHistory, setPromptHistory] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.PROMPT_HISTORY);
    return stored ? JSON.parse(stored) : [];
  });
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [rightWidth, setRightWidth] = useState(450);
  const [leftWidth, setLeftWidth] = useState(350);
  const isResizingRight = useRef(false);
  const isResizingLeft = useRef(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(state.documents));
  }, [state.documents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
      useVault: state.useVault,
      useContextHistory: state.useContextHistory,
      expanderModel: state.expanderModel,
      reasonerModel: state.reasonerModel,
      inputPosition: state.inputPosition
    }));
  }, [state.useVault, state.useContextHistory, state.expanderModel, state.reasonerModel, state.inputPosition]);

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

  const handleMouseMoveRight = useCallback((e: MouseEvent) => {
    if (!isResizingRight.current) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth > 240 && newWidth < 800) setRightWidth(newWidth);
  }, []);

  const handleMouseMoveLeft = useCallback((e: MouseEvent) => {
    if (!isResizingLeft.current) return;
    const newWidth = e.clientX;
    if (newWidth > 200 && newWidth < 500) setLeftWidth(newWidth);
  }, []);

  const stopResizing = useCallback(() => {
    isResizingRight.current = false;
    isResizingLeft.current = false;
    document.removeEventListener('mousemove', handleMouseMoveRight);
    document.removeEventListener('mousemove', handleMouseMoveLeft);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
  }, [handleMouseMoveRight, handleMouseMoveLeft]);

  const startResizingRight = useCallback(() => {
    isResizingRight.current = true;
    document.addEventListener('mousemove', handleMouseMoveRight);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
  }, [handleMouseMoveRight, stopResizing]);

  const startResizingLeft = useCallback(() => {
    isResizingLeft.current = true;
    document.addEventListener('mousemove', handleMouseMoveLeft);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
  }, [handleMouseMoveLeft, stopResizing]);

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

  const processQuery = async (query: string, assistantId: string) => {
    setState(prev => ({ ...prev, isProcessing: true }));
    abortControllerRef.current = new AbortController();
    
    try {
      // EXTRACT TAGS: Find @FileName mentions in the prompt
      const taggedFileNames = state.documents
        .filter(d => query.includes(`@${d.name}`))
        .map(d => d.name);

      let expandedQuery = '';
      let sources: Chunk[] = [];
      let expansionDuration = 0;
      let searchDuration = 0;
      let reasoningDuration = 0;
      const activeDocs = state.documents.filter(d => d.enabled);
      const hist = state.useContextHistory ? state.contextScript : "";

      if (abortControllerRef.current.signal.aborted) throw new Error("Aborted");

      if (state.useVault && activeDocs.length > 0) {
        setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === assistantId ? { ...m, status: 'expanding' } : m) }));
        const t1 = performance.now();
        expandedQuery = await geminiRAG.expandQuery(
          query, 
          activeDocs.map(d => d.name), 
          activeDocs.map(d => d.content.substring(0, 300)), 
          0.1, 
          hist, 
          state.expanderModel,
          state.openRouterKey,
          taggedFileNames
        );
        expansionDuration = (performance.now() - t1) / 1000;
        
        if (abortControllerRef.current.signal.aborted) throw new Error("Aborted");

        setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === assistantId ? { ...m, expandedQuery, expansionDuration, status: 'searching' } : m) }));
        const t2 = performance.now();
        sources = await vectorService.search(expandedQuery, 5, taggedFileNames);
        searchDuration = (performance.now() - t2) / 1000;
        
        setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === assistantId ? { ...m, sources, searchDuration, status: 'reasoning' } : m) }));
      } else {
        setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === assistantId ? { ...m, status: 'reasoning' } : m) }));
      }

      if (abortControllerRef.current.signal.aborted) throw new Error("Aborted");

      const t3 = performance.now();
      const { answer } = await geminiRAG.generateAnswer(
        query, expandedQuery, sources,
        0.7, 
        state.useVault, state.reasonerModel, hist, state.openRouterKey,
        taggedFileNames
      );
      reasoningDuration = (performance.now() - t3) / 1000;
      
      if (abortControllerRef.current.signal.aborted) throw new Error("Aborted");

      setState(prev => ({ 
        ...prev, 
        messages: prev.messages.map(m => m.id === assistantId ? { 
          ...m, 
          content: answer, 
          status: 'completed', 
          reasoningDuration,
          expansionDuration,
          searchDuration 
        } : m) 
      }));

      if (state.useContextHistory) {
        // Now the expander brain handles the summarization
        const scriptLine = await geminiRAG.generateSummary(
          query, 
          answer, 
          Array.from(new Set(sources.map(s => s.docName))), 
          state.expanderModel, 
          state.openRouterKey
        );
        setState(prev => ({ ...prev, contextScript: prev.contextScript ? `${prev.contextScript}\n${scriptLine}` : scriptLine }));
      }
    } catch (err: any) {
      if (err.message === "Aborted") {
        setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === assistantId ? { ...m, status: 'error', content: 'Generation stopped by user.' } : m) }));
      } else {
        addToast(err.message || "Pipeline error.");
        setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === assistantId ? { ...m, status: 'error' } : m) }));
      }
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
      abortControllerRef.current = null;
    }
  };

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const handleSend = useCallback(async (customValue?: string) => {
    const valToUse = customValue ?? inputValue;
    if (!valToUse.trim() || state.isProcessing) return;
    if (!state.openRouterKey) {
      setState(prev => ({ ...prev, isApiKeyModalOpen: true }));
      addToast("Please set your OpenRouter API Key first.");
      return;
    }

    const currentQuery = valToUse.trim();
    setPromptHistory(prev => [currentQuery, ...prev.filter(p => p !== currentQuery)].slice(0, 50));
    setHistoryIndex(-1);
    
    const assistantId = Date.now().toString() + '-ai';
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: currentQuery, timestamp: new Date() };
    const placeholder: Message = { id: assistantId, role: 'assistant', content: '', status: state.useVault ? 'expanding' : 'reasoning', timestamp: new Date() };

    setState(prev => ({ ...prev, messages: [...prev.messages, userMsg, placeholder] }));
    setInputValue('');

    await processQuery(currentQuery, assistantId);
  }, [inputValue, state.isProcessing, state.documents, state.useVault, state.expanderModel, state.reasonerModel, state.contextScript, state.useContextHistory, state.openRouterKey]);

  const handleRetry = useCallback(async (failedMessageId: string) => {
    if (state.isProcessing) return;
    
    const msgIndex = state.messages.findIndex(m => m.id === failedMessageId);
    if (msgIndex <= 0) return;
    
    const userMsg = state.messages[msgIndex - 1];
    if (userMsg.role !== 'user') return;

    setState(prev => ({
      ...prev,
      messages: prev.messages.map(m => m.id === failedMessageId ? { ...m, status: state.useVault ? 'expanding' : 'reasoning', content: '', expandedQuery: undefined, sources: undefined, expansionDuration: undefined, searchDuration: undefined, reasoningDuration: undefined } : m)
    }));

    await processQuery(userMsg.content, failedMessageId);
  }, [state.messages, state.isProcessing, state.useVault, state.documents, state.expanderModel, state.reasonerModel, state.contextScript, state.useContextHistory, state.openRouterKey]);

  const handleUpdateSources = useCallback((messageId: string, newSources: Chunk[]) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(m => m.id === messageId ? { ...m, sources: newSources } : m)
    }));
  }, []);

  const handleRegenerate = useCallback(async (messageId: string) => {
    if (state.isProcessing) return;
    
    const msgIndex = state.messages.findIndex(m => m.id === messageId);
    if (msgIndex <= 0) return;
    
    const userMsg = state.messages[msgIndex - 1];
    const targetMsg = state.messages[msgIndex];
    if (userMsg.role !== 'user' || targetMsg.role !== 'assistant') return;

    setState(prev => ({ ...prev, isProcessing: true }));
    abortControllerRef.current = new AbortController();

    try {
        setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === messageId ? { ...m, status: 'reasoning', content: '' } : m) }));
        
        const hist = state.useContextHistory ? state.contextScript : "";
        const expandedQuery = targetMsg.expandedQuery || userMsg.content;
        const sources = targetMsg.sources || [];
        const taggedFileNames = state.documents
            .filter(d => userMsg.content.includes(`@${d.name}`))
            .map(d => d.name);

        const t3 = performance.now();
        const { answer } = await geminiRAG.generateAnswer(
            userMsg.content, expandedQuery, sources,
            0.7, 
            state.useVault, state.reasonerModel, hist, state.openRouterKey,
            taggedFileNames
        );
        const reasoningDuration = (performance.now() - t3) / 1000;

        if (abortControllerRef.current.signal.aborted) throw new Error("Aborted");

        setState(prev => ({ 
            ...prev, 
            messages: prev.messages.map(m => m.id === messageId ? { 
            ...m, 
            content: answer, 
            status: 'completed', 
            reasoningDuration
            } : m) 
        }));

    } catch (err: any) {
         if (err.message === "Aborted") {
            setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === messageId ? { ...m, status: 'error', content: 'Generation stopped by user.' } : m) }));
        } else {
            addToast(err.message || "Regeneration error.");
            setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === messageId ? { ...m, status: 'error' } : m) }));
        }
    } finally {
        setState(prev => ({ ...prev, isProcessing: false }));
        abortControllerRef.current = null;
    }
  }, [state.messages, state.isProcessing, state.useVault, state.reasonerModel, state.contextScript, state.useContextHistory, state.openRouterKey, state.documents]);

  const onClearChat = useCallback(() => {
    setConfirmationState({
      isOpen: true,
      title: "Clear Conversation",
      message: "Are you sure you want to clear the entire conversation history? This action cannot be undone.",
      onConfirm: () => setState(prev => ({ ...prev, messages: [], contextScript: "" }))
    });
  }, []);

  return (
    <div className="flex h-screen bg-brand-base text-gray-100 transition-colors overflow-hidden dark">
      <div className="shrink-0 flex" style={{ width: `${leftWidth}px` }}>
        <div className="flex-1 min-w-0 h-full overflow-hidden">
          <DocumentList 
            documents={state.documents} onUpload={handleFileUpload} 
            onRemove={(id) => setState(prev => ({ ...prev, documents: prev.documents.filter(d => d.id !== id) }))} 
            onToggle={(id) => setState(prev => ({ ...prev, documents: prev.documents.map(d => d.id === id ? { ...d, enabled: !d.enabled } : d) }))}
            isIndexing={state.isIndexing}
          />
        </div>
        <div onMouseDown={startResizingLeft} className="w-1.5 cursor-col-resize bg-brand-border hover:bg-brand-accent transition-all flex flex-col items-center justify-center gap-1 group shrink-0">
          <div className="w-[1px] h-8 bg-brand-muted/40 rounded-full group-hover:bg-white/50"></div>
          <div className="w-[1px] h-8 bg-brand-muted/40 rounded-full group-hover:bg-white/50"></div>
        </div>
      </div>
      
      <main className="flex-1 flex flex-col min-w-0 bg-brand-base relative">
        <ChatInterface 
          messages={state.messages} 
          expanderModelId={state.expanderModel}
          reasonerModelId={state.reasonerModel}
          onRetry={handleRetry}
          onRegenerate={handleRegenerate}
          onUpdateSources={handleUpdateSources}
          onClearChat={onClearChat}
          inputPosition={state.inputPosition}
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSend={handleSend}
          onStop={handleStop}
          isProcessing={state.isProcessing}
          availableDocuments={state.documents.filter(d => d.enabled)}
        />
      </main>

      <div style={{ width: `${rightWidth}px` }} className="shrink-0 flex">
        <div onMouseDown={startResizingRight} className="w-1.5 cursor-col-resize bg-brand-border hover:bg-brand-accent transition-all flex flex-col items-center justify-center gap-1 group shrink-0">
          <div className="w-[1px] h-8 bg-brand-muted/40 rounded-full group-hover:bg-white/50"></div>
          <div className="w-[1px] h-8 bg-brand-muted/40 rounded-full group-hover:bg-white/50"></div>
        </div>

        <RightSidebar
          inputValue={inputValue} setInputValue={setInputValue}
          onSend={handleSend} onStop={handleStop} onHistoryNav={(d) => {}}
          isProcessing={state.isProcessing}
          useVault={state.useVault} setUseVault={(v) => setState(prev => ({ ...prev, useVault: v }))}
          useContextHistory={state.useContextHistory} setUseContextHistory={(v) => setState(prev => ({ ...prev, useContextHistory: v }))}
          onClearContext={() => setConfirmationState({
            isOpen: true,
            title: "Clear Context History",
            message: "Are you sure you want to clear the context history? This will reset the conversation memory.",
            onConfirm: () => setState(prev => ({ ...prev, contextScript: "" }))
          })}
          expanderModel={state.expanderModel} setExpanderModel={(m) => setState(prev => ({ ...prev, expanderModel: m }))}
          reasonerModel={state.reasonerModel} setReasonerModel={(m) => setState(prev => ({ ...prev, reasonerModel: m }))}
          openRouterKey={state.openRouterKey} setOpenRouterKey={(k) => setState(prev => ({ ...prev, openRouterKey: k }))}
          onOpenApiManagement={() => setState(prev => ({ ...prev, isApiKeyModalOpen: true }))}
          inputPosition={state.inputPosition}
          setInputPosition={(pos) => setState(prev => ({ ...prev, inputPosition: pos }))}
          availableDocuments={state.documents.filter(d => d.enabled)}
        />
      </div>

      <ApiKeyModal 
        isOpen={state.isApiKeyModalOpen} 
        onClose={() => setState(prev => ({ ...prev, isApiKeyModalOpen: false }))}
        openRouterKey={state.openRouterKey}
        setOpenRouterKey={(k) => setState(prev => ({ ...prev, openRouterKey: k }))}
      />

      {confirmationState && (
        <ConfirmationModal
          isOpen={confirmationState.isOpen}
          onClose={() => setConfirmationState(null)}
          onConfirm={confirmationState.onConfirm}
          title={confirmationState.title}
          message={confirmationState.message}
        />
      )}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-3 z-50 pointer-events-none w-full max-sm px-4">
        {state.toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto flex items-center gap-3 px-5 py-3.5 bg-brand-darker message-shadow rounded-2xl border border-brand-border animate-blur-text w-full">
            <span className={`text-[11px] font-bold uppercase tracking-widest ${toast.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>
              {toast.type}
            </span>
            <p className="flex-1 text-[13px] text-gray-300 font-medium">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
