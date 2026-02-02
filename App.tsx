import React, { useState, useCallback, useEffect, useRef, Suspense, lazy } from 'react';
import { AppState, Message, Document, Chunk, Toast, MindMap } from './types';
import { vectorService } from './services/vectorService';
import { geminiRAG } from './services/geminiService';
import { fileService } from './services/fileService';
import { modelService } from './services/modelService';
import { commandService } from './services/commandService';
import { mindNodeService } from './services/mindNodeService';
import { X, Key, Shield, ExternalLink, PanelLeft, PanelLeftClose } from 'lucide-react';

import LoadingScreen from './components/LoadingScreen';
const DocumentList = lazy(() => import('./components/DocumentList').then(m => ({ default: m.DocumentList })));
const ChatInterface = lazy(() => import('./components/ChatInterface').then(m => ({ default: m.ChatInterface })));
const RightSidebar = lazy(() => import('./components/RightSidebar').then(m => ({ default: m.RightSidebar })));
const InputModal = lazy(() => import('./components/InputModal').then(m => ({ default: m.InputModal })));
const ModelSelectorModal = lazy(() => import('./components/ModelSelectorModal').then(m => ({ default: m.ModelSelectorModal })));
const MindMapEditor = lazy(() => import('./components/MindMapEditor').then(m => ({ default: m.MindMapEditor })));

const STORAGE_KEYS = {
  DOCUMENTS: 'gemini_rag_docs',
  SETTINGS: 'gemini_rag_settings_v2', // Version settings to reset model state if needed, or just change keys
  PROMPT_HISTORY: 'gemini_rag_history',
  CONTEXT_SCRIPT: 'gemini_rag_context_script',
  SELECTED_MODEL: 'gemini_rag_selected_model',
  OPENROUTER_KEY: 'gemini_rag_openrouter_key',
  GOOGLE_KEY: 'gemini_rag_google_key',
  XAI_KEY: 'gemini_rag_xai_key',
  OPENAI_KEY: 'gemini_rag_openai_key',
  MISTRAL_KEY: 'gemini_rag_mistral_key',
  CUSTOM_CONTEXT: 'gemini_rag_custom_context',
  MIND_MAPS: 'gemini_rag_mind_maps'
};

const ApiKeyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  openRouterKey: string;
  setOpenRouterKey: (k: string) => void;
  googleKey: string;
  setGoogleKey: (k: string) => void;
  xaiKey: string;
  setXaiKey: (k: string) => void;
  openaiKey: string;
  setOpenaiKey: (k: string) => void;
  mistralKey: string;
  setMistralKey: (k: string) => void;
}> = ({ isOpen, onClose, openRouterKey, setOpenRouterKey, googleKey, setGoogleKey, xaiKey, setXaiKey, openaiKey, setOpenaiKey, mistralKey, setMistralKey }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-brand-darker animate-in fade-in duration-200">
      <div className="flex items-center justify-between px-8 py-6 border-b border-brand-border bg-brand-base/50">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-100 tracking-tight">API Key Management</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-brand-border/50 rounded-full transition-colors text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-12 space-y-8">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Provider Configuration</h3>
            <p className="text-sm text-brand-muted">Manage your API credentials for various AI providers.</p>
          </div>

          <div className="bg-[#1a1a1a] border border-brand-border rounded-2xl overflow-hidden divide-y divide-brand-border/50">
            {/* OpenRouter Row */}
            <div className="flex items-center gap-6 p-6 hover:bg-brand-base/30 transition-colors group">
              <div className="w-10 h-10 bg-white rounded-lg p-1.5 shrink-0 flex items-center justify-center">
                <img src="/logos/openrouter.png" alt="OpenRouter" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-200">OpenRouter</span>
                  <span className="px-1.5 py-0.5 rounded bg-brand-accent/10 text-brand-accent text-[10px] font-bold">PRIMARY</span>
                </div>
                <p className="text-[11px] text-brand-muted">Aggregator for various top-tier models (Claude, GPT-4, Llama 3)</p>
              </div>
              <div className="w-[400px]">
                <input
                  type="password"
                  value={openRouterKey}
                  onChange={(e) => setOpenRouterKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full bg-brand-darker border border-brand-border rounded-lg px-4 py-2.5 text-[13px] font-mono text-gray-200 outline-none focus:border-brand-accent/50 transition-all placeholder:text-gray-700"
                />
              </div>
            </div>

            {/* Google AI Row */}
            <div className="flex items-center gap-6 p-6 hover:bg-brand-base/30 transition-colors group">
              <div className="w-10 h-10 bg-white rounded-lg p-1.5 shrink-0 flex items-center justify-center">
                <img src="/logos/google.png" alt="Google AI" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-200">Google AI Studio</span>
                </div>
                <p className="text-[11px] text-brand-muted">Access Gemini 1.5 Pro, Flash and other Google models directly</p>
              </div>
              <div className="w-[400px]">
                <input
                  type="password"
                  value={googleKey}
                  onChange={(e) => setGoogleKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-brand-darker border border-brand-border rounded-lg px-4 py-2.5 text-[13px] font-mono text-gray-200 outline-none focus:border-brand-accent/50 transition-all placeholder:text-gray-700"
                />
              </div>
            </div>

            {/* xAI Row */}
            <div className="flex items-center gap-6 p-6 hover:bg-brand-base/30 transition-colors group">
              <div className="w-10 h-10 bg-white rounded-lg p-1.5 shrink-0 flex items-center justify-center">
                <img src="/logos/xai.png" alt="xAI" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-200">xAI (Grok)</span>
                </div>
                <p className="text-[11px] text-brand-muted">Access Grok 3 and Grok 3 Mini models</p>
              </div>
              <div className="w-[400px]">
                <input
                  type="password"
                  value={xaiKey}
                  onChange={(e) => setXaiKey(e.target.value)}
                  placeholder="xai-..."
                  className="w-full bg-brand-darker border border-brand-border rounded-lg px-4 py-2.5 text-[13px] font-mono text-gray-200 outline-none focus:border-brand-accent/50 transition-all placeholder:text-gray-700"
                />
              </div>
            </div>

            {/* OpenAI Row */}
            <div className="flex items-center gap-6 p-6 hover:bg-brand-base/30 transition-colors group">
              <div className="w-10 h-10 bg-white rounded-lg p-1.5 shrink-0 flex items-center justify-center">
                <img src="/logos/chatgpt.png" alt="OpenAI" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-200">OpenAI</span>
                </div>
                <p className="text-[11px] text-brand-muted">Access GPT-5 suite, and older GPT-4/3.5 models directly</p>
              </div>
              <div className="w-[400px]">
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-brand-darker border border-brand-border rounded-lg px-4 py-2.5 text-[13px] font-mono text-gray-200 outline-none focus:border-brand-accent/50 transition-all placeholder:text-gray-700"
                />
              </div>
            </div>

            {/* Mistral Row */}
            <div className="flex items-center gap-6 p-6 hover:bg-brand-base/30 transition-colors group">
              <div className="w-10 h-10 bg-white rounded-lg p-1.5 shrink-0 flex items-center justify-center">
                <img src="/logos/mistral.png" alt="Mistral" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-200">Mistral AI</span>
                </div>
                <p className="text-[11px] text-brand-muted">Access Mistral Large, Small, and specialized coding models</p>
              </div>
              <div className="w-[400px]">
                <input
                  type="password"
                  value={mistralKey}
                  onChange={(e) => setMistralKey(e.target.value)}
                  placeholder="..."
                  className="w-full bg-brand-darker border border-brand-border rounded-lg px-4 py-2.5 text-[13px] font-mono text-gray-200 outline-none focus:border-brand-accent/50 transition-all placeholder:text-gray-700"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl text-sm font-bold tracking-wide transition-all"
            >
              Done
            </button>
          </div>
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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
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

  const loadInitialMindMaps = (): MindMap[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.MIND_MAPS);
    return stored ? JSON.parse(stored) : [];
  };

  const loadInitialSettings = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const defaults = {
      useVault: true,
      useContextHistory: false,
      expanderModel: 'cohere/command-r7b-12-2024',
      reasonerModel: 'openai/gpt-oss-safeguard-20b',
      maxTokens: 2000,
      maxAgentIterations: 5
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
    selectedModel: localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL) || 'gemini-2.0-flash-thinking-exp',
    openRouterKey: localStorage.getItem(STORAGE_KEYS.OPENROUTER_KEY) || "",
    googleKey: localStorage.getItem(STORAGE_KEYS.GOOGLE_KEY) || "",
    xaiKey: localStorage.getItem(STORAGE_KEYS.XAI_KEY) || "",
    openaiKey: localStorage.getItem(STORAGE_KEYS.OPENAI_KEY) || "",
    mistralKey: localStorage.getItem(STORAGE_KEYS.MISTRAL_KEY) || "",
    isApiKeyModalOpen: false,
    isInputModalOpen: false,
    maxTokens: initialSettings.maxTokens,
    maxAgentIterations: initialSettings.maxAgentIterations,
    customContext: localStorage.getItem(STORAGE_KEYS.CUSTOM_CONTEXT) || '',
    mindMaps: loadInitialMindMaps(),
  });

  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [isMindMapEditorOpen, setIsMindMapEditorOpen] = useState(false);

  const [inputValue, setInputValue] = useState('');
  const [isVaultOpen, setIsVaultOpen] = useState(true);
  const [activeFileNames, setActiveFileNames] = useState<string[]>([]);
  const [promptHistory, setPromptHistory] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.PROMPT_HISTORY);
    return stored ? JSON.parse(stored) : [];
  });
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [controlsWidth, setControlsWidth] = useState(450);
  const [vaultWidth, setVaultWidth] = useState(350);
  const isResizingControls = useRef(false);
  const isResizingVault = useRef(false);

  const [isOnboarding, setIsOnboarding] = useState(() => !localStorage.getItem('gemini_rag_onboarded'));

  const handleOnboardingComplete = (settings: { provider: string; model: string; apiKey: string }) => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, settings.model);
    if (settings.provider === 'google') localStorage.setItem(STORAGE_KEYS.GOOGLE_KEY, settings.apiKey);
    else if (settings.provider === 'openrouter') localStorage.setItem(STORAGE_KEYS.OPENROUTER_KEY, settings.apiKey);
    else if (settings.provider === 'xai') localStorage.setItem(STORAGE_KEYS.XAI_KEY, settings.apiKey);
    else if (settings.provider === 'openai') localStorage.setItem(STORAGE_KEYS.OPENAI_KEY, settings.apiKey);
    else if (settings.provider === 'mistral') localStorage.setItem(STORAGE_KEYS.MISTRAL_KEY, settings.apiKey);

    localStorage.setItem('gemini_rag_onboarded', 'true');

    setState(prev => ({
      ...prev,
      selectedModel: settings.model,
      googleKey: settings.provider === 'google' ? settings.apiKey : prev.googleKey,
      openRouterKey: settings.provider === 'openrouter' ? settings.apiKey : prev.openRouterKey,
      xaiKey: settings.provider === 'xai' ? settings.apiKey : prev.xaiKey,
      openaiKey: settings.provider === 'openai' ? settings.apiKey : prev.openaiKey,
      mistralKey: settings.provider === 'mistral' ? settings.apiKey : prev.mistralKey,
    }));

    setIsOnboarding(false);
  };

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(state.documents));
  }, [state.documents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
      useVault: state.useVault,
      useContextHistory: state.useContextHistory,
      selectedModel: state.selectedModel,
      maxTokens: state.maxTokens
    }));
  }, [state.useVault, state.useContextHistory, state.selectedModel, state.maxTokens]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OPENROUTER_KEY, state.openRouterKey);
  }, [state.openRouterKey]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOOGLE_KEY, state.googleKey);
  }, [state.googleKey]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.XAI_KEY, state.xaiKey);
  }, [state.xaiKey]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OPENAI_KEY, state.openaiKey);
  }, [state.openaiKey]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MISTRAL_KEY, state.mistralKey);
  }, [state.mistralKey]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONTEXT_SCRIPT, state.contextScript);
  }, [state.contextScript]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MIND_MAPS, JSON.stringify(state.mindMaps));
  }, [state.mindMaps]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CONTEXT, state.customContext);
  }, [state.customContext]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, state.selectedModel);
  }, [state.selectedModel]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROMPT_HISTORY, JSON.stringify(promptHistory));
  }, [promptHistory]);

  const addToast = (message: string, type: Toast['type'] = 'error') => {
    const id = Math.random().toString(36).substring(2, 9);
    setState(prev => ({ ...prev, toasts: [...prev.toasts, { id, message, type }] }));
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setState(prev => ({ ...prev, toasts: prev.toasts.filter(t => t.id !== id) }));
  };

  const startResizingControls = useCallback((e: React.MouseEvent) => {
    isResizingControls.current = true;
    document.addEventListener('mousemove', handleControlsResize);
    document.addEventListener('mouseup', stopControlsResize);
    document.body.style.cursor = 'col-resize';
  }, []);

  const handleControlsResize = useCallback((e: MouseEvent) => {
    if (!isResizingControls.current) return;
    const newWidth = Math.max(250, Math.min(600, e.clientX));
    setControlsWidth(newWidth);
  }, []);

  const stopControlsResize = useCallback(() => {
    isResizingControls.current = false;
    document.removeEventListener('mousemove', handleControlsResize);
    document.removeEventListener('mouseup', stopControlsResize);
    document.body.style.cursor = 'default';
  }, []);

  const startResizingVault = useCallback((e: React.MouseEvent) => {
    isResizingVault.current = true;
    document.addEventListener('mousemove', handleVaultResize);
    document.addEventListener('mouseup', stopVaultResize);
    document.body.style.cursor = 'col-resize';
  }, []);

  const handleVaultResize = useCallback((e: MouseEvent) => {
    if (!isResizingVault.current) return;
    const newWidth = Math.max(250, Math.min(600, window.innerWidth - e.clientX));
    setVaultWidth(newWidth);
  }, []);

  const stopVaultResize = useCallback(() => {
    isResizingVault.current = false;
    document.removeEventListener('mousemove', handleVaultResize);
    document.removeEventListener('mouseup', stopVaultResize);
    document.body.style.cursor = 'default';
  }, []);

  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if (state.documents.length + files.length > 20) {
      addToast("File limit reached (20 max).");
      return;
    }
    const newDocs: Document[] = [];
    const fileArray = Array.from(files) as File[];

    // Process sequentially to handle parsing
    for (const file of fileArray) {
      try {
        // Use fileService to parse PDF/DOCX/Text
        const text = await fileService.parseFile(file);
        newDocs.push({
          id: Math.random().toString(36).substring(2, 11),
          name: file.name,
          content: text,
          enabled: true
        });
      } catch (err: any) {
        addToast(`Failed to parse ${file.name}: ${err.message}`);
      }
    }
    setState(prev => ({ ...prev, documents: [...prev.documents, ...newDocs] }));
  }, [state.documents]);

  const handleManualDocAdd = useCallback((name: string, content: string) => {
    if (state.documents.length >= 20) {
      addToast("File limit reached (20 max).");
      return;
    }
    const newDoc: Document = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      content,
      enabled: true
    };
    setState(prev => ({ ...prev, documents: [...prev.documents, newDoc] }));
  }, [state.documents]);

  useEffect(() => {
    const runIndexing = async () => {
      setState(prev => ({ ...prev, isIndexing: true }));
      try {
        // Convert enabled mind maps to documents
        const mindMapDocs: Document[] = state.mindMaps
          .filter(map => map.enabled)
          .map(map => ({
            id: map.id,
            name: map.name,
            content: mindNodeService.mindMapToDocument(map),
            enabled: true,
          }));

        // Combine regular documents and mind map documents
        const allDocs = [
          ...state.documents.filter(d => d.enabled),
          ...mindMapDocs
        ];

        await vectorService.indexDocuments(allDocs);
      } catch (err) { addToast("Indexing failure."); }
      finally { setState(prev => ({ ...prev, isIndexing: false })); }
    };
    runIndexing();
  }, [state.documents, state.mindMaps]);

  const processQuery = async (query: string, assistantId: string) => {
    setState(prev => ({ ...prev, isProcessing: true }));
    abortControllerRef.current = new AbortController();

    try {
      // EXTRACT TAGS: Find @FileName mentions in the prompt (case-insensitive)
      const queryLower = query.toLowerCase();
      const taggedFileNames = state.documents
        .filter(d => queryLower.includes(`@${d.name.toLowerCase()}`))
        .map(d => d.name);

      let expandedQuery = '';
      let sources: Chunk[] = [];
      let expansionDuration = 0;
      let planningDuration = 0;
      let searchDuration = 0;
      let thinkingDuration = 0;
      let reasoningDuration = 0;
      let thinkerResult = undefined;

      const activeDocs = state.documents.filter(d => d.enabled);
      const hist = state.useContextHistory ? state.contextScript : "";

      if (abortControllerRef.current.signal.aborted) throw new Error("Aborted");

      if (state.useVault && activeDocs.length > 0) {
        // --- AGENTIC RESEARCH LOOP ---
        const tResearchStart = performance.now();
        const currentMsg = state.messages.find(m => m.id === assistantId);
        let currentKnowledgeBuffer = currentMsg?.agentContext?.knowledgeBuffer || "";
        let iterations = currentMsg?.agentContext?.iterations || 0;
        const maxAgentIterations = state.maxAgentIterations;
        let isResearchFinalized = false;
        if (currentMsg?.agentContext?.sources) {
          sources = [...currentMsg.agentContext.sources];
        }

        setState(prev => ({
          ...prev,
          messages: prev.messages.map(m => m.id === assistantId ? {
            ...m,
            status: 'planning',
            pendingClarification: undefined,
            agentContext: m.agentContext ? m.agentContext : {
              originalQuery: query,
              knowledgeBuffer: '',
              iterations: 0,
              sources: [],
              turnTitles: {}
            },
            thoughtLogs: (m.thoughtLogs && m.thoughtLogs.length > 0) ? m.thoughtLogs : [{ timestamp: Date.now(), step: 'Thinking', thought: 'Analyzing goal and drafting research strategy...', turn: 0 }],
            subtasks: [
              { label: 'Planning', status: 'loading' },
              { label: 'Searching', status: 'pending' },
              { label: 'Drafting', status: 'pending' }
            ]
          } : m)
        }));

        while (iterations < maxAgentIterations && !isResearchFinalized) {
          iterations++;
          if (abortControllerRef.current.signal.aborted) throw new Error("Aborted");

          const tIteration = performance.now();
          const availableFileNames = activeDocs.map(d => d.name);
          const filePreviews = activeDocs.map(d => `${d.name}: ${d.content.slice(0, 500)}...`);

          // Prepare mind map metadata for LLM context
          const mindMapMetadata = state.mindMaps.map(m => ({
            name: m.name,
            enabled: m.enabled,
            rootNodeText: m.rootNodeId && m.nodes[m.rootNodeId] 
              ? m.nodes[m.rootNodeId].text 
              : 'Untitled'
          }));

          const plan = await geminiRAG.decideNextAction(
            query,
            availableFileNames,
            filePreviews,
            hist,
            currentKnowledgeBuffer,
            taggedFileNames,
            mindMapMetadata,
            state.selectedModel,
            state.openRouterKey,
            state.googleKey,
            state.xaiKey,
            state.openaiKey,
            state.mistralKey,
            state.customContext
          );

          const action = plan.nextAction;

          if (action.type === 'search' && action.searchParams) {
            const sub = action.searchParams;
            setState(prev => ({
              ...prev,
              messages: prev.messages.map(m => m.id === assistantId ? {
                ...m,
                status: 'searching',
                activeSubQuery: sub.query,
                agentContext: {
                  ...(m.agentContext || {}),
                  originalQuery: query,
                  knowledgeBuffer: currentKnowledgeBuffer,
                  iterations: iterations,
                  sources: [...sources],
                  turnTitles: {
                    ...(m.agentContext?.turnTitles || {}),
                    [iterations]: plan.turnTitle
                  }
                },
                thoughtLogs: [
                  ...(m.thoughtLogs || []),
                  { timestamp: Date.now(), step: `Searching`, thought: action.thought, turn: iterations }
                ],
                subtasks: m.subtasks?.map(s =>
                  s.label === 'Searching' ? { ...s, status: 'loading', detail: `Searching: ${sub.query}` } :
                    s.label === 'Planning' ? { ...s, status: 'completed' } : s
                )
              } : m)
            }));

            const searchTargets = sub.targetFiles || plan.targetFiles || taggedFileNames;
            setActiveFileNames(searchTargets.length > 0 ? searchTargets : activeDocs.map(d => d.name));
            
            const subResults = await vectorService.search(
              sub.query,
              sub.expectedChunks || 3,
              searchTargets
            );

            await new Promise(resolve => setTimeout(resolve, 1000));
            setActiveFileNames([]);
            // Accumulate results
            const resultText = subResults.map(c => `[From ${c.docName}]: ${c.text}`).join('\n');
            currentKnowledgeBuffer += `\n--- Search Result (Iter ${iterations}) ---\n${resultText}\n`;

            // Deduplicate chunks for sources
            subResults.forEach(c => {
              if (!sources.some(s => s.text === c.text)) {
                sources.push(c);
              }
            });

          } else if (action.type === 'grep' && action.grepParams) {
            const grepParams = action.grepParams;
            setState(prev => ({
              ...prev,
              messages: prev.messages.map(m => m.id === assistantId ? {
                ...m,
                status: 'searching',
                activeSubQuery: `grep: ${grepParams.pattern}`,
                agentContext: {
                  ...(m.agentContext || {}),
                  originalQuery: query,
                  knowledgeBuffer: currentKnowledgeBuffer,
                  iterations: iterations,
                  sources: [...sources],
                  turnTitles: {
                    ...(m.agentContext?.turnTitles || {}),
                    [iterations]: plan.turnTitle
                  }
                },
                thoughtLogs: [
                  ...(m.thoughtLogs || []),
                  { timestamp: Date.now(), step: `Grep Search`, thought: action.thought, turn: iterations }
                ],
                subtasks: m.subtasks?.map(s =>
                  s.label === 'Searching' ? { ...s, status: 'loading', detail: `Grep: ${grepParams.pattern}` } :
                    s.label === 'Planning' ? { ...s, status: 'completed' } : s
                )
              } : m)
            }));

            setActiveFileNames(grepParams.targetFiles || activeDocs.map(d => d.name));
            
            const grepResult = await commandService.executeGrep(
              grepParams.pattern,
              grepParams.targetFiles,
              activeDocs,
              grepParams.caseSensitive || false,
              grepParams.maxResults || 20
            );

            await new Promise(resolve => setTimeout(resolve, 1000));
            setActiveFileNames([]);

            // Add grep results to knowledge buffer
            if (grepResult.success && grepResult.results) {
              const formattedResults = commandService.formatGrepResults(grepResult.results as any, 15);
              currentKnowledgeBuffer += `\n--- Grep Result (Iter ${iterations}) ---\nPattern: "${grepParams.pattern}"\n${formattedResults}\n`;
            } else {
              currentKnowledgeBuffer += `\n--- Grep Result (Iter ${iterations}) ---\nPattern: "${grepParams.pattern}"\nError: ${grepResult.error || 'No matches found'}\n`;
            }

          } else if (action.type === 'read_lines' && action.readLinesParams) {
            const readParams = action.readLinesParams;
            setState(prev => ({
              ...prev,
              messages: prev.messages.map(m => m.id === assistantId ? {
                ...m,
                status: 'searching',
                activeSubQuery: `Reading ${readParams.fileName} lines ${readParams.startLine}-${readParams.endLine}`,
                agentContext: {
                  ...(m.agentContext || {}),
                  originalQuery: query,
                  knowledgeBuffer: currentKnowledgeBuffer,
                  iterations: iterations,
                  sources: [...sources],
                  turnTitles: {
                    ...(m.agentContext?.turnTitles || {}),
                    [iterations]: plan.turnTitle
                  }
                },
                thoughtLogs: [
                  ...(m.thoughtLogs || []),
                  { timestamp: Date.now(), step: `Read Lines`, thought: action.thought, turn: iterations }
                ],
                subtasks: m.subtasks?.map(s =>
                  s.label === 'Searching' ? { ...s, status: 'loading', detail: `Reading ${readParams.fileName}:${readParams.startLine}-${readParams.endLine}` } :
                    s.label === 'Planning' ? { ...s, status: 'completed' } : s
                )
              } : m)
            }));

            setActiveFileNames([readParams.fileName]);
            
            const readResult = await commandService.readLines(
              readParams.fileName,
              readParams.startLine,
              readParams.endLine,
              activeDocs
            );

            await new Promise(resolve => setTimeout(resolve, 1000));
            setActiveFileNames([]);

            // Add read lines results to knowledge buffer
            if (readResult.success && readResult.results) {
              const formattedResult = commandService.formatReadLinesResult(readResult.results as any);
              currentKnowledgeBuffer += `\n--- Read Lines (Iter ${iterations}) ---\n${formattedResult}\n`;
              
              // Also add as a source chunk for context
              const readLinesResult = readResult.results as any;
              sources.push({
                docId: readParams.fileName,
                docName: readParams.fileName,
                text: readLinesResult.content
              });
            } else {
              currentKnowledgeBuffer += `\n--- Read Lines (Iter ${iterations}) ---\nFile: ${readParams.fileName}\nError: ${readResult.error || 'Failed to read'}\n`;
            }

          } else if (action.type === 'mindmap_search' && action.mindMapSearchParams) {
            const mindMapParams = action.mindMapSearchParams;
            setState(prev => ({
              ...prev,
              messages: prev.messages.map(m => m.id === assistantId ? {
                ...m,
                status: 'searching',
                activeSubQuery: `Exploring mind maps for: ${mindMapParams.query}`,
                agentContext: {
                  ...(m.agentContext || {}),
                  originalQuery: query,
                  knowledgeBuffer: currentKnowledgeBuffer,
                  iterations: iterations,
                  sources: [...sources],
                  turnTitles: {
                    ...(m.agentContext?.turnTitles || {}),
                    [iterations]: plan.turnTitle
                  }
                },
                thoughtLogs: [
                  ...(m.thoughtLogs || []),
                  { timestamp: Date.now(), step: `Mind Map Search`, thought: action.thought, turn: iterations }
                ],
                subtasks: m.subtasks?.map(s =>
                  s.label === 'Searching' ? { ...s, status: 'loading', detail: `Mind Map: ${mindMapParams.query}` } :
                    s.label === 'Planning' ? { ...s, status: 'completed' } : s
                )
              } : m)
            }));

            // Highlight the mind maps being searched
            const searchedMindMapNames = state.mindMaps
              .filter(m => m.enabled)
              .map(m => m.name);
            setActiveFileNames(searchedMindMapNames);

            const mindMapResult = await commandService.searchMindMaps(
              mindMapParams.query,
              state.mindMaps,
              mindMapParams.maxResults || 5
            );

            await new Promise(resolve => setTimeout(resolve, 1000));
            setActiveFileNames([]);

            // Add mind map results to knowledge buffer
            if (mindMapResult.success && mindMapResult.results) {
              currentKnowledgeBuffer += `\n--- Mind Map Search (Iter ${iterations}) ---\n${mindMapResult.summary}\n`;
              
              // Add relevant nodes as source chunks
              const mapResults = mindMapResult.results as any[];
              for (const mapResult of mapResults) {
                for (const nodeResult of mapResult.results) {
                  sources.push({
                    docId: mapResult.mindMapId,
                    docName: `${mapResult.mindMapName} (Mind Map)`,
                    text: `${nodeResult.nodeText}\nPath: ${nodeResult.path.join(' → ')}`
                  });
                }
              }
            } else {
              currentKnowledgeBuffer += `\n--- Mind Map Search (Iter ${iterations}) ---\nQuery: "${mindMapParams.query}"\n${mindMapResult.summary}\n`;
            }

          } else if (action.type === 'mindmap_navigate' && action.mindMapNavigateParams) {
            const navParams = action.mindMapNavigateParams;
            setState(prev => ({
              ...prev,
              messages: prev.messages.map(m => m.id === assistantId ? {
                ...m,
                status: 'searching',
                activeSubQuery: `Navigating to node in mind map...`,
                agentContext: {
                  ...(m.agentContext || {}),
                  originalQuery: query,
                  knowledgeBuffer: currentKnowledgeBuffer,
                  iterations: iterations,
                  sources: [...sources],
                  turnTitles: {
                    ...(m.agentContext?.turnTitles || {}),
                    [iterations]: plan.turnTitle
                  }
                },
                thoughtLogs: [
                  ...(m.thoughtLogs || []),
                  { timestamp: Date.now(), step: `Mind Map Navigate`, thought: action.thought, turn: iterations }
                ],
                subtasks: m.subtasks?.map(s =>
                  s.label === 'Searching' ? { ...s, status: 'loading', detail: `Navigating mind map node` } :
                    s.label === 'Planning' ? { ...s, status: 'completed' } : s
                )
              } : m)
            }));

            // Find the mind map and highlight it
            const targetMindMap = state.mindMaps.find(m => m.id === navParams.mindMapId);
            if (targetMindMap) {
              setActiveFileNames([targetMindMap.name]);
            }

            const navResult = await commandService.navigateMindMapNode(
              navParams.nodeId,
              navParams.mindMapId,
              state.mindMaps
            );

            await new Promise(resolve => setTimeout(resolve, 800));
            setActiveFileNames([]);

            // Add navigation results to knowledge buffer
            if (navResult.success && navResult.results) {
              currentKnowledgeBuffer += `\n--- Mind Map Navigate (Iter ${iterations}) ---\n${navResult.summary}\n`;
              
              // Add the navigated node as a source
              const navData = navResult.results as any;
              if (navData.currentNode) {
                sources.push({
                  docId: navParams.mindMapId,
                  docName: `${navData.mindMapName} (Mind Map)`,
                  text: `${navData.currentNode.nodeText}\nPath: ${navData.currentNode.path.join(' → ')}`
                });
              }
            } else {
              currentKnowledgeBuffer += `\n--- Mind Map Navigate (Iter ${iterations}) ---\nNode: ${navParams.nodeId}\nError: ${navResult.error || 'Navigation failed'}\n`;
            }

          } else if (action.type === 'clarify' && action.clarificationQuestion) {
            setState(prev => ({
              ...prev,
              messages: prev.messages.map(m => m.id === assistantId ? {
                ...m,
                status: 'completed', // Stop the loop and wait
                pendingClarification: action.clarificationQuestion,
                agentContext: {
                  originalQuery: query,
                  knowledgeBuffer: currentKnowledgeBuffer,
                  iterations: iterations,
                  sources: [...sources],
                  turnTitles: {
                    ...(m.agentContext?.turnTitles || {}),
                    [iterations]: plan.turnTitle
                  }
                },
                thoughtLogs: [
                  ...(m.thoughtLogs || []),
                  { timestamp: Date.now(), step: 'Clarifying', thought: 'Clarification needed from user to proceed.', turn: iterations }
                ]
              } : m)
            }));
            return; // EXIT processQuery and wait for user

          } else if (action.type === 'conclude') {
            isResearchFinalized = true;
            setState(prev => ({
              ...prev,
              messages: prev.messages.map(m => m.id === assistantId ? {
                ...m,
                agentContext: m.agentContext ? {
                  ...m.agentContext,
                  turnTitles: {
                    ...(m.agentContext.turnTitles || {}),
                    [iterations]: plan.turnTitle
                  }
                } : undefined,
                thoughtLogs: [
                  ...(m.thoughtLogs || []),
                  { timestamp: Date.now(), step: 'Finalizing', thought: action.thought || 'Research phase concluded. Synthesizing final response.', turn: iterations }
                ]
              } : m)
            }));
          }
        }

        searchDuration = (performance.now() - tResearchStart) / 1000;
        // --- END RESEARCH LOOP ---

        // 3. THINKER STEP (Self-Discussion & Prompt Rewriting)
        const tThink = performance.now();
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(m => m.id === assistantId ? {
            ...m,
            status: 'synthesizing',
            subtasks: m.subtasks?.map(s =>
              s.label === 'Drafting' ? { ...s, status: 'loading' } : s
            )
          } : m)
        }));

        thinkerResult = await geminiRAG.thinkerStep(
          query,
          sources,
          state.selectedModel,
          activeDocs.map(d => d.name),
          state.openRouterKey,
          state.googleKey,
          state.xaiKey,
          state.openaiKey,
          state.customContext
        );

        setState(prev => ({
          ...prev,
          messages: prev.messages.map(m => m.id === assistantId ? {
            ...m,
            subtasks: m.subtasks?.map(s =>
              s.label === 'Searching' ? { ...s, status: 'completed' } :
                s.label === 'Drafting' ? { ...s, status: 'loading' } : s
            )
          } : m)
        }));

        await new Promise(r => setTimeout(r, 600));

        setState(prev => ({
          ...prev,
          messages: prev.messages.map(m => m.id === assistantId ? {
            ...m,
            subtasks: m.subtasks?.map(s =>
              s.label === 'Drafting' ? { ...s, status: 'completed' } : s
            )
          } : m)
        }));
        thinkingDuration = (performance.now() - tThink) / 1000;

        if (abortControllerRef.current.signal.aborted) throw new Error("Aborted");

        const synthesisThoughts = Array.isArray(thinkerResult.thoughts)
          ? thinkerResult.thoughts.map(t => ({ timestamp: Date.now(), step: t.step, thought: t.thought }))
          : [{ timestamp: Date.now(), step: 'Synthesis', thought: thinkerResult.thoughts }];

        setState(prev => ({
          ...prev,
          messages: prev.messages.map(m => m.id === assistantId ? {
            ...m,
            status: 'reasoning',
            thoughtProcess: Array.isArray(thinkerResult.thoughts) ? thinkerResult.thoughts.map(t => `[${t.step}] ${t.thought}`).join('\n') : thinkerResult.thoughts,
            thinkingDuration,
            thoughtLogs: [
              ...(m.thoughtLogs || []),
              ...synthesisThoughts,
              { timestamp: Date.now(), step: 'Finalizing', thought: 'Final synthesis complete. Generating comprehensive answer...' }
            ],
            subtasks: m.subtasks?.map(s =>
              s.label === 'Drafting' ? { ...s, status: 'completed' } : s
            )
          } : m)
        }));

      } else {
        setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === assistantId ? { ...m, status: 'reasoning' } : m) }));
      }

      const t3 = performance.now();

      // 4. GENERATION (STREAMING)
      let fullAnswer = "";
      const stream = geminiRAG.generateAnswerStream(
        query, expandedQuery, sources,
        0.7,
        state.useVault, state.selectedModel, hist, state.openRouterKey,
        state.googleKey,
        state.xaiKey,
        state.openaiKey,
        state.mistralKey,
        taggedFileNames,
        thinkerResult,
        state.maxTokens
      );

      for await (const chunk of stream) {
        if (abortControllerRef.current.signal.aborted) break;
        fullAnswer += chunk;

        // Update UI with partial answer
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(m => m.id === assistantId ? {
            ...m,
            content: fullAnswer,
            // Keep status as reasoning while streaming
          } : m)
        }));
      }

      reasoningDuration = (performance.now() - t3) / 1000;

      if (abortControllerRef.current.signal.aborted) throw new Error("Aborted");

      // Add a note about trying other models if needed
      const modelNote = `\n\n<span class="text-xs text-gray-500">If unsatisfied with this response, try a different model: Claude for reasoning, GPT-4 for analysis, Gemini Flash for speed, or Claude for long context. Switch models to re-submit.</span>`;

      setState(prev => ({
        ...prev,
        messages: prev.messages.map(m => m.id === assistantId ? {
          ...m,
          status: 'completed',
          content: fullAnswer + modelNote,
          modelId: state.selectedModel,
          reasoningDuration,
          expansionDuration,
          planningDuration,
          searchDuration,
          thinkingDuration
        } : m)
      }));

      if (state.useContextHistory) {
        // Now the expander brain handles the summarization
        const scriptLine = await geminiRAG.generateSummary(
          query,
          fullAnswer,
          Array.from(new Set(sources.map(s => s.docName))),
          state.selectedModel,
          state.openRouterKey,
          state.googleKey,
          state.xaiKey,
          state.openaiKey
        );
        setState(prev => ({ ...prev, contextScript: prev.contextScript ? `${prev.contextScript}\n${scriptLine}` : scriptLine }));
      }
    } catch (err: any) {
      setActiveFileNames([]);
      if (err.message === "Aborted") {
        setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === assistantId ? { ...m, status: 'error', content: prev.messages.find(msg => msg.id === assistantId)?.content || 'Generation stopped by user.' } : m) }));
      } else {
        addToast(err.message || "Pipeline error.");
        setState(prev => ({ ...prev, messages: prev.messages.map(m => m.id === assistantId ? { ...m, status: 'error' } : m) }));
      }
    } finally {
      setActiveFileNames([]);
      setState(prev => ({ ...prev, isProcessing: false }));
      abortControllerRef.current = null;
    }
  };

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      // Clear all loading animations and active file indicators
      setActiveFileNames([]);
      // Mark the last assistant message as stopped
      setState(prev => ({
        ...prev,
        isProcessing: false,
        messages: prev.messages.map((m, idx) => 
          idx === prev.messages.length - 1 && m.role === 'assistant'
            ? { ...m, status: 'completed', wasStopped: true, activeSubQuery: undefined }
            : m
        )
      }));
    }
  }, []);

  const handleSend = useCallback(async (customValue?: string) => {
    const valToUse = customValue ?? inputValue;
    if (!valToUse.trim() || state.isProcessing) return;
    
    // Check if the API key for the selected model's provider is set
    const missingProvider = modelService.getRequiredApiKey(state.selectedModel, {
      modelId: state.selectedModel,
      systemInstruction: '',
      prompt: '',
      temperature: 0.7,
      openRouterKey: state.openRouterKey,
      googleKey: state.googleKey,
      xaiKey: state.xaiKey,
      openaiKey: state.openaiKey,
      mistralKey: state.mistralKey
    });

    if (missingProvider) {
      setState(prev => ({ ...prev, isApiKeyModalOpen: true }));
      const providerNames: Record<string, string> = {
        'openrouter': 'OpenRouter',
        'google': 'Google AI',
        'xai': 'xAI',
        'openai': 'OpenAI',
        'mistral': 'Mistral AI'
      };
      addToast(`Please set your ${providerNames[missingProvider] || missingProvider} API Key first.`);
      return;
    }

    const currentQuery = valToUse.trim();
    setPromptHistory(prev => [currentQuery, ...prev.filter(p => p !== currentQuery)].slice(0, 50));
    setHistoryIndex(-1);

    const assistantId = Date.now().toString() + '-ai';
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: currentQuery, timestamp: new Date() };
    const placeholder: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      status: state.useVault ? 'searching' : 'reasoning',
      modelId: state.selectedModel,
      timestamp: new Date(),
      subtasks: state.useVault ? [
        { label: 'Planning', status: 'loading' },
        { label: 'Searching', status: 'pending' },
        { label: 'Drafting', status: 'pending' }
      ] : []
    };

    setState(prev => ({ ...prev, messages: [...prev.messages, userMsg, placeholder] }));
    setInputValue('');

    await processQuery(currentQuery, assistantId);
  }, [inputValue, state.isProcessing, state.documents, state.useVault, state.selectedModel, state.contextScript, state.useContextHistory, state.openRouterKey, state.googleKey, state.xaiKey, state.openaiKey]);

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
  }, [state.messages, state.isProcessing, state.useVault, state.documents, state.selectedModel, state.contextScript, state.useContextHistory, state.openRouterKey]);

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

    // Reset the message to start fresh with the currently selected model
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(m => m.id === messageId ? {
        id: m.id,
        role: 'assistant',
        content: '',
        status: state.useVault ? 'searching' : 'reasoning',
        modelId: state.selectedModel,
        timestamp: m.timestamp,
        wasStopped: false,
        sources: undefined,
        thoughtProcess: undefined,
        thoughtLogs: undefined,
        agentContext: undefined,
        pendingClarification: undefined,
        clarificationAnswer: undefined,
        activeSubQuery: undefined,
        expandedQuery: undefined,
        expansionDuration: undefined,
        planningDuration: undefined,
        searchDuration: undefined,
        thinkingDuration: undefined,
        reasoningDuration: undefined,
        subtasks: state.useVault ? [
          { label: 'Planning', status: 'pending' },
          { label: 'Searching', status: 'pending' },
          { label: 'Drafting', status: 'pending' }
        ] : []
      } : m)
    }));

    // Start processing from scratch
    await processQuery(userMsg.content, messageId);

  }, [state.messages, state.isProcessing, state.useVault, state.selectedModel, state.contextScript, state.useContextHistory, state.openRouterKey, state.documents, state.googleKey, state.xaiKey, state.openaiKey, state.mistralKey]);

  const handleClarificationAnswer = useCallback(async (messageId: string, answer: string) => {
    const msg = state.messages.find(m => m.id === messageId);
    if (!msg) return;

    setState(prev => ({
      ...prev,
      messages: prev.messages.map(m => m.id === messageId ? {
        ...m,
        clarificationAnswer: answer,
        pendingClarification: undefined,
        thoughtLogs: [
          ...(m.thoughtLogs || []),
          { timestamp: Date.now(), step: 'User Input', thought: `Clarified: ${answer}`, turn: m.agentContext?.iterations }
        ],
        agentContext: {
          ...m.agentContext!,
          knowledgeBuffer: m.agentContext!.knowledgeBuffer + `\n--- User Clarification ---\nQuestion: ${m.pendingClarification}\nAnswer: ${answer}\n`
        }
      } : m)
    }));

    await processQuery(msg.agentContext?.originalQuery || "", messageId);
  }, [state.messages, processQuery]);

  const onClearChat = useCallback(() => {
    setConfirmationState({
      isOpen: true,
      title: "Clear Conversation",
      message: "Are you sure you want to clear the entire conversation history? This action cannot be undone.",
      onConfirm: () => setState(prev => ({ ...prev, messages: [], contextScript: "" }))
    });
  }, []);

  const handleClearContextHistory = useCallback(() => {
    setConfirmationState({
      isOpen: true,
      title: "Clear Context History",
      message: "Are you sure you want to clear the context history? This will reset the conversation memory.",
      onConfirm: () => setState(prev => ({ ...prev, contextScript: "" }))
    });
  }, []);

  const handleHistoryNav = useCallback((direction: 'up' | 'down') => {
    if (promptHistory.length === 0) return;
    let newIndex = (direction === 'up') ? historyIndex + 1 : historyIndex - 1;
    newIndex = Math.max(-1, Math.min(newIndex, promptHistory.length - 1));
    if (newIndex !== historyIndex) {
      setHistoryIndex(newIndex);
      setInputValue(newIndex === -1 ? '' : promptHistory[newIndex]);
    }
  }, [promptHistory, historyIndex]);

  if (isOnboarding) {
    return <LoadingScreen isOnboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <div className="flex h-screen bg-brand-base text-gray-100 transition-colors overflow-hidden dark">

        {/* LEFT SIDEBAR: Controls */}
        <div
          className="shrink-0 flex relative z-30"
          style={{ width: `${controlsWidth}px` }}
        >
          <div className="flex-1 min-w-0 h-full overflow-hidden border-r border-brand-border/50 relative">
            <RightSidebar
              inputValue={inputValue} setInputValue={setInputValue}
              onSend={handleSend} onStop={handleStop} onHistoryNav={handleHistoryNav}
              isProcessing={state.isProcessing}
              useVault={state.useVault} setUseVault={(v) => setState(prev => ({ ...prev, useVault: v }))}
              useContextHistory={state.useContextHistory}
              setUseContextHistory={(v) => setState(prev => ({ ...prev, useContextHistory: v }))}
              onClearContext={handleClearContextHistory}
              selectedModel={state.selectedModel}
              setSelectedModel={(m) => setState(prev => ({ ...prev, selectedModel: m }))}
              openRouterKey={state.openRouterKey} setOpenRouterKey={(k) => setState(prev => ({ ...prev, openRouterKey: k }))}
              onOpenApiManagement={() => setState(prev => ({ ...prev, isApiKeyModalOpen: true }))}
              onOpenModelSelector={() => setIsModelSelectorOpen(true)}
              availableDocuments={state.documents.filter(d => d.enabled)}
              onClearChat={onClearChat}
              maxTokens={state.maxTokens}
              setMaxTokens={(n) => setState(prev => ({ ...prev, maxTokens: n }))}
              maxAgentIterations={state.maxAgentIterations}
              setMaxAgentIterations={(n) => setState(prev => ({ ...prev, maxAgentIterations: n }))}
              customContext={state.customContext}
              setCustomContext={(v) => setState(prev => ({ ...prev, customContext: v }))}
            />

            {/* INTERNAL COLLAPSE BUTTON REMOVED AS PER USER REQUEST */}
          </div>
          <div onMouseDown={startResizingControls} className="w-1.5 cursor-col-resize bg-brand-border hover:bg-brand-accent transition-all flex flex-col items-center justify-center gap-1 group shrink-0">
            <div className="w-[1px] h-8 bg-brand-muted/40 rounded-full group-hover:bg-white/50"></div>
            <div className="w-[1px] h-8 bg-brand-muted/40 rounded-full group-hover:bg-white/50"></div>
          </div>
        </div>

        {/* FLOAT OPEN BUTTONS */}
        {/* Controls Open Button Removed */}

        {!isVaultOpen && (
          <button
            onClick={() => setIsVaultOpen(true)}
            className="fixed top-4 right-4 z-[100] p-2 rounded-lg bg-brand-darker border border-brand-border text-gray-400 hover:text-orange-400 transition-all shadow-2xl animate-in fade-in slide-in-from-right-2"
            title="Open Vault"
          >
            <PanelLeft size={18} className="rotate-180" />
          </button>
        )}

        <main className="flex-1 flex flex-col min-w-0 bg-brand-base relative transition-all">
          <ChatInterface
            messages={state.messages}
            selectedModelId={state.selectedModel}
            onRetry={handleRetry}
            onRegenerate={handleRegenerate}
            onUpdateSources={handleUpdateSources}
            onClearChat={onClearChat}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSend={handleSend}
            onStop={handleStop}
            onClarifyAnswer={handleClarificationAnswer}
            isProcessing={state.isProcessing}
            availableDocuments={state.documents.filter(d => d.enabled)}
            onHistoryNav={handleHistoryNav}
          />
        </main>

        {/* RIGHT SIDEBAR: Vault */}
        <div
          style={{ width: isVaultOpen ? `${vaultWidth}px` : '0px' }}
          className="shrink-0 flex transition-all duration-300 ease-in-out relative z-30 overflow-hidden"
        >
          <div onMouseDown={startResizingVault} className="w-1.5 cursor-col-resize bg-brand-border hover:bg-brand-accent transition-all flex flex-col items-center justify-center gap-1 group shrink-0">
            <div className="w-[1px] h-8 bg-brand-muted/40 rounded-full group-hover:bg-white/50"></div>
            <div className="w-[1px] h-8 bg-brand-muted/40 rounded-full group-hover:bg-white/50"></div>
          </div>

          <div className="flex-1 min-w-0 h-full overflow-hidden border-l border-brand-border/50 relative">
            <DocumentList
              documents={state.documents} onUpload={handleFileUpload}
              onRemove={(id) => setState(prev => ({ ...prev, documents: prev.documents.filter(d => d.id !== id) }))}
              onToggle={(id) => setState(prev => ({ ...prev, documents: prev.documents.map(d => d.id === id ? { ...d, enabled: !d.enabled } : d) }))}
              isIndexing={state.isIndexing}
              onAddText={() => setState(prev => ({ ...prev, isInputModalOpen: true, inputModalType: 'text' }))}
              onAddLink={() => setState(prev => ({ ...prev, isInputModalOpen: true, inputModalType: 'url' }))}
              onCollapse={() => setIsVaultOpen(false)}
              activeFileNames={activeFileNames}
              onOpenMindMap={() => setIsMindMapEditorOpen(true)}
              mindMaps={state.mindMaps}
              onToggleMindMap={(id) => setState(prev => ({ 
                ...prev, 
                mindMaps: prev.mindMaps.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m) 
              }))}
            />

            {/* INTERNAL COLLAPSE BUTTON REMOVED (NOW INSIDE DocumentList) */}
          </div>
        </div>

        <ApiKeyModal
          isOpen={state.isApiKeyModalOpen}
          onClose={() => setState(prev => ({ ...prev, isApiKeyModalOpen: false }))}
          openRouterKey={state.openRouterKey}
          setOpenRouterKey={(k) => setState(prev => ({ ...prev, openRouterKey: k }))}
          googleKey={state.googleKey}
          setGoogleKey={(k) => setState(prev => ({ ...prev, googleKey: k }))}
          xaiKey={state.xaiKey}
          setXaiKey={(k) => setState(prev => ({ ...prev, xaiKey: k }))}
          openaiKey={state.openaiKey}
          setOpenaiKey={(k) => setState(prev => ({ ...prev, openaiKey: k }))}
          mistralKey={state.mistralKey}
          setMistralKey={(k) => setState(prev => ({ ...prev, mistralKey: k }))}
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

        <InputModal
          isOpen={state.isInputModalOpen}
          onClose={() => setState(prev => ({ ...prev, isInputModalOpen: false }))}
          onConfirm={handleManualDocAdd}
          type={state.inputModalType || 'text'} // Pass the type to the modal
        />

        <MindMapEditor
          isOpen={isMindMapEditorOpen}
          onClose={() => setIsMindMapEditorOpen(false)}
          mindMaps={state.mindMaps}
          onSaveMindMaps={(maps) => setState(prev => ({ ...prev, mindMaps: maps }))}
        />

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-3 z-50 pointer-events-none w-full max-sm px-4 shadow-2xl">
          {state.toasts.map(toast => (
            <div key={toast.id} className="pointer-events-auto flex items-center gap-3 px-5 py-3.5 bg-brand-darker message-shadow rounded-2xl border border-brand-border animate-blur-text w-full max-w-md">
              <span className={`text-[11px] font-bold uppercase tracking-widest ${toast.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>
                {toast.type}
              </span>
              <div className="flex-1 flex flex-col">
                <p className="text-[13px] text-gray-300 font-medium leading-normal">{toast.message}</p>
                {toast.message.includes("OpenRouter Privacy Settings") && (
                  <a
                    href="https://openrouter.ai/settings/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center text-[11px] font-bold text-brand-accent hover:text-white transition-colors uppercase tracking-wide gap-1 self-start border-b border-brand-accent/30 hover:border-brand-accent pb-0.5"
                  >
                    Configure Settings &rarr;
                  </a>
                )}
              </div>
              <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <ModelSelectorModal
          isOpen={isModelSelectorOpen}
          onClose={() => setIsModelSelectorOpen(false)}
          currentModelId={state.selectedModel}
          onSelect={(m) => setState(prev => ({ ...prev, selectedModel: m }))}
          title="Select Primary Intelligence"
        />
      </div>
    </Suspense>
  );
};

export default App;
