import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DocumentList } from './components/DocumentList';
import { ChatInterface } from './components/ChatInterface';
import { RightSidebar } from './components/RightSidebar';
import { AppState, Message, Document, Chunk } from './types';
import { vectorService } from './services/vectorService';
import { geminiRAG } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    documents: [],
    messages: [],
    isIndexing: false,
    isProcessing: false,
    error: null,
    temperature: 0.7,
    theme: 'dark', // Default set to dark mode
    useVault: true,
    useSmallModelForResponse: false
  });

  const [inputValue, setInputValue] = useState('');
  const [rightWidth, setRightWidth] = useState(320);
  const isResizing = useRef(false);

  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth > 240 && newWidth < 800) {
      setRightWidth(newWidth);
    }
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, [handleMouseMove]);

  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [handleMouseMove, stopResizing]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (state.documents.length + files.length > 10) {
      setState(prev => ({ ...prev, error: "Maximum of 10 files allowed in the vault." }));
      return;
    }

    const newDocs: Document[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const text = await file.text();
        newDocs.push({
          id: Math.random().toString(36).substring(2, 11),
          name: file.name,
          content: text,
          enabled: true
        });
      } catch (err) {
        console.error(`Error reading ${file.name}:`, err);
      }
    }

    setState(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocs],
    }));
  }, [state.documents]);

  const handleRemoveDocument = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== id),
    }));
  }, []);

  const handleToggleDocument = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      documents: prev.documents.map(d => d.id === id ? { ...d, enabled: !d.enabled } : d),
    }));
  }, []);

  useEffect(() => {
    const runIndexing = async () => {
      setState(prev => ({ ...prev, isIndexing: true, error: null }));
      try {
        // Only index enabled documents
        const enabledDocs = state.documents.filter(d => d.enabled);
        await vectorService.indexDocuments(enabledDocs);
      } catch (err: any) {
        setState(prev => ({ ...prev, error: err.message || "Failed to index documents." }));
      } finally {
        setState(prev => ({ ...prev, isIndexing: false }));
      }
    };
    runIndexing();
  }, [state.documents]);

  const updateMessage = (id: string, updates: Partial<Message>) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  };

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || state.isProcessing) return;

    const currentQuery = inputValue.trim();
    const assistantId = (Date.now() + 1).toString();
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentQuery,
      timestamp: new Date(),
    };

    const assistantPlaceholder: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      status: state.useVault ? 'expanding' : 'reasoning',
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage, assistantPlaceholder],
      isProcessing: true,
      error: null,
    }));
    setInputValue('');

    try {
      let expandedQuery = '';
      let sources: Chunk[] = [];

      // Only use vault if global toggle is ON and there are enabled documents
      const activeDocs = state.documents.filter(d => d.enabled);
      
      if (state.useVault && activeDocs.length > 0) {
        const fileNames = activeDocs.map(d => d.name);
        const filePreviews = activeDocs.map(d => `[File: ${d.name}]\n${d.content.substring(0, 300)}...`);

        expandedQuery = await geminiRAG.expandQuery(currentQuery, fileNames, filePreviews, state.temperature);
        updateMessage(assistantId, { expandedQuery, status: 'searching' });

        sources = await vectorService.search(expandedQuery);
        updateMessage(assistantId, { sources, status: 'reasoning' });
      } else if (state.useVault && activeDocs.length === 0) {
        // User has vault ON but all individual files are OFF
        updateMessage(assistantId, { status: 'reasoning' });
      }

      const modelName = state.useSmallModelForResponse ? 'gemini-3-flash-preview' : 'gemini-3-pro-preview';
      const startTime = performance.now();
      const { answer } = await geminiRAG.generateAnswer(
        currentQuery, 
        expandedQuery, 
        sources, 
        activeDocs.map(d => d.name), 
        activeDocs.map(d => `[File: ${d.name}]\n${d.content.substring(0, 300)}...`),
        state.temperature,
        state.useVault && activeDocs.length > 0,
        modelName
      );
      
      const endTime = performance.now();
      const durationSeconds = (endTime - startTime) / 1000;

      updateMessage(assistantId, { 
        content: answer, 
        status: 'completed',
        reasoningDuration: durationSeconds
      });

    } catch (err: any) {
      console.error("Pipeline Error:", err);
      let errorMessage = "Infrastructure Sync Failure.";
      
      if (err.message?.includes("429") || err.message?.includes("RESOURCE_EXHAUSTED")) {
        errorMessage = "Cloud Quota Depleted. Please check your billing dashboard or switch to a paid API project.";
      } else if (err.message?.includes("Requested entity was not found")) {
        errorMessage = "Invalid API Key context. Please re-authenticate via Infrastructure settings.";
      }

      updateMessage(assistantId, { status: 'error' });
      setState(prev => ({ 
        ...prev, 
        error: errorMessage 
      }));
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [inputValue, state.isProcessing, state.temperature, state.documents, state.useVault, state.useSmallModelForResponse]);

  return (
    <div className="flex h-screen bg-brand-base text-gray-100 transition-colors overflow-hidden">
      <DocumentList 
        documents={state.documents} 
        onUpload={handleFileUpload} 
        onRemove={handleRemoveDocument}
        onToggle={handleToggleDocument}
        isIndexing={state.isIndexing}
      />
      
      <main className="flex-1 flex flex-col min-w-0 bg-brand-base">
        {state.error && (
          <div className="bg-brand-accent/10 border-b border-brand-accent/20 p-3 text-center animate-[fadeIn_0.3s_ease-out]">
            <span className="text-[10px] text-brand-accent font-bold uppercase tracking-[0.2em] font-mono">
              Alert: {state.error}
            </span>
          </div>
        )}
        <ChatInterface 
          messages={state.messages}
        />
      </main>

      <div 
        onMouseDown={startResizing}
        className="w-[1px] cursor-col-resize hover:bg-brand-accent transition-colors bg-brand-border z-20"
      />

      <div style={{ width: `${rightWidth}px` }} className="shrink-0">
        <RightSidebar
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSend={handleSend}
          isProcessing={state.isProcessing}
          temperature={state.temperature}
          setTemperature={(t) => setState(prev => ({ ...prev, temperature: t }))}
          theme={state.theme}
          setTheme={(theme) => setState(prev => ({ ...prev, theme }))}
          useVault={state.useVault}
          setUseVault={(v) => setState(prev => ({ ...prev, useVault: v }))}
          useSmallModel={state.useSmallModelForResponse}
          setUseSmallModel={(v) => setState(prev => ({ ...prev, useSmallModelForResponse: v }))}
        />
      </div>
    </div>
  );
};

export default App;