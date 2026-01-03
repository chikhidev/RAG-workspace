import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DocumentList } from './components/DocumentList';
import { ChatInterface } from './components/ChatInterface';
import { RightSidebar } from './components/RightSidebar';
import { AppState, Message, Document } from './types';
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
    theme: 'light'
  });

  const [inputValue, setInputValue] = useState('');
  const [rightWidth, setRightWidth] = useState(320);
  const isResizing = useRef(false);

  // Apply dark mode class to html element
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
    if (newWidth > 200 && newWidth < 800) {
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

    const newDocs: Document[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const text = await file.text();
        newDocs.push({
          id: Math.random().toString(36).substring(2, 11),
          name: file.name,
          content: text,
        });
      } catch (err) {
        console.error(`Error reading ${file.name}:`, err);
      }
    }

    setState(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocs],
    }));
  }, []);

  const handleRemoveDocument = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== id),
    }));
  }, []);

  useEffect(() => {
    const runIndexing = async () => {
      setState(prev => ({ ...prev, isIndexing: true, error: null }));
      try {
        await vectorService.indexDocuments(state.documents);
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
      status: 'expanding',
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
      const fileNames = state.documents.map(d => d.name);
      // Generate previews (first ~300 chars) for each document to ground BOTH brains
      const filePreviews = state.documents.map(d => `[File: ${d.name}]\n${d.content.substring(0, 300)}...`);

      // Brain 1 grounded in vault metadata
      const expandedQuery = await geminiRAG.expandQuery(currentQuery, fileNames, filePreviews, state.temperature);
      updateMessage(assistantId, { expandedQuery, status: 'searching' });

      // Search
      const sources = await vectorService.search(expandedQuery);
      updateMessage(assistantId, { sources, status: 'reasoning' });

      // Brain 2 (Reasoning) with duration tracking
      const startTime = performance.now();
      
      const { answer } = await geminiRAG.generateAnswer(
        currentQuery, 
        expandedQuery, 
        sources, 
        fileNames, 
        filePreviews,
        state.temperature
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
      updateMessage(assistantId, { status: 'error' });
      setState(prev => ({ 
        ...prev, 
        error: "RAG Pipeline Failure: Connectivity issue." 
      }));
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [inputValue, state.isProcessing, state.temperature, state.documents]);

  return (
    <div className="flex h-screen bg-[#F8F9FB] dark:bg-brand-base text-gray-800 dark:text-gray-100 transition-colors overflow-hidden">
      <DocumentList 
        documents={state.documents} 
        onUpload={handleFileUpload} 
        onRemove={handleRemoveDocument}
        isIndexing={state.isIndexing}
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        {state.error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-brand-border p-2 text-center text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-widest">
            {state.error}
          </div>
        )}
        <ChatInterface 
          messages={state.messages}
        />
      </main>

      <div 
        onMouseDown={startResizing}
        className="w-1 cursor-col-resize hover:bg-purple-400 dark:hover:bg-brand-accent transition-colors bg-transparent z-20"
      />

      <div style={{ width: `${rightWidth}px` }}>
        <RightSidebar
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSend={handleSend}
          isProcessing={state.isProcessing}
          temperature={state.temperature}
          setTemperature={(t) => setState(prev => ({ ...prev, temperature: t }))}
          theme={state.theme}
          setTheme={(theme) => setState(prev => ({ ...prev, theme }))}
        />
      </div>
    </div>
  );
};

export default App;