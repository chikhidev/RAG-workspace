import React, { useState, useCallback, useEffect, useRef, Suspense, lazy } from 'react';
import { AppState, Message, Document, Toast, MindMap, User } from './types';
import { fileService } from './services/fileService';
import { modelService } from './services/modelService';
import { mindNodeService } from './services/mindNodeService';
import * as storageService from './services/storageService';
import { processQueryWithBackend } from './utils/backendQueryProcessor';
import { X, Key, Shield, ExternalLink, PanelLeft, PanelLeftClose } from 'lucide-react';

import LoadingScreen from './components/LoadingScreen';
import { Header } from './components/Header';
import { ShortcutsModal } from './components/ShortcutsModal';
import { AuthPage } from './components/AuthPage';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { ApiKeyManagementModal } from './components/ApiKeyManagementModal';
import { ConversationsPage } from './components/ConversationsPage';
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
  MIND_MAPS: 'gemini_rag_mind_maps',
  DELETED_DOCUMENTS: 'gemini_rag_deleted_docs'
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
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 py-2.5 hover:bg-red-500/20 text-red-400 rounded-xl text-[12px] font-bold transition-all"
            >
              Confirm
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-brand-base hover:bg-brand-border text-gray-300 rounded-xl text-[12px] font-bold transition-all border border-brand-border"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!authToken) {
      setIsAuthChecking(false);
      return;
    }
    
    try {
      const res = await fetch('/api/users/me', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (res.status === 401) {
        setAuthToken(null);
        localStorage.removeItem('auth_token');
        setLoadingError('Session expired. Please log in again.');
        setIsAuthChecking(false);
        return;
      }
      
      if (!res.ok) {
        throw new Error('Failed to fetch user');
      }
      
      const data = await res.json();
      setUser(data);
      setIsAuthChecking(false);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setLoadingError('Failed to verify authentication. Please try again.');
      setIsAuthChecking(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleAvatarUpload = async (file: File) => {
    if (!authToken) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/users/me/avatar', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: formData
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        // We'll update state via addToast later if needed, but for now we need access to addToast which is inside the main render scope but here we are at top level... 
        // Wait, addToast is usually part of component state management. In this App structure, addToast is defined LATER.
        // It's better to move this handler inside the main body or just use console/alert for now, OR better yet, define it later.
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load data from backend instead of localStorage
  const loadInitialDocs = async (): Promise<Document[]> => {
    if (!authToken) return [];
    try {
      const docs = await storageService.fetchDocuments(authToken);
      return docs.map(doc => ({
        id: doc.doc_id,
        name: doc.filename,
        enabled: doc.enabled
        // No content - backend manages document content for RAG
      }));
    } catch (error) {
      console.error('Failed to load documents:', error);
      return [];
    }
  };

  const loadInitialConfig = async () => {
    if (!authToken) return null;
    try {
      return await storageService.fetchUserConfig(authToken);
    } catch (error) {
      console.error('Failed to load config:', error);
      return null;
    }
  };

  const loadInitialSettings = () => {
    const defaults = {
      useVault: true,
      useContextHistory: false,
      expanderModel: 'cohere/command-r7b-12-2024',
      reasonerModel: 'openai/gpt-oss-safeguard-20b',
      maxTokens: 2000,
      maxAgentIterations: 7
    };
    return defaults;
  };

  const initialSettings = loadInitialSettings();

  const [state, setState] = useState<AppState & { isApiKeyModalOpen: boolean }>({
    documents: [],
    messages: [],
    isIndexing: false,
    isProcessing: false,
    toasts: [],
    useVault: initialSettings.useVault,
    useContextHistory: initialSettings.useContextHistory,
    contextScript: "",
    selectedModel: 'nvidia/nemotron-3-nano-30b-a3b:free',
    openRouterKey: "",
    googleKey: "",
    xaiKey: "",
    openaiKey: "",
    mistralKey: "",
    isApiKeyModalOpen: false,
    isInputModalOpen: false,
    maxTokens: initialSettings.maxTokens,
    maxAgentIterations: initialSettings.maxAgentIterations,
    customContext: '',
    mindMaps: [],
  });

  // Load data from backend on mount
  useEffect(() => {
    if (!authToken || isDataLoaded || isAuthChecking) return;
    
    const loadData = async () => {
      try {
        const [docs, config] = await Promise.all([
          loadInitialDocs(),
          loadInitialConfig()
        ]);
        
        if (config) {
          console.log('[loadData] Config received from server:', {
            model_preference: config.model_preference,
            api_keys: config.api_keys ? Object.keys(config.api_keys) : []
          });
          console.log('[loadData] Setting state with mistralKey:', config.api_keys?.mistral ? '✓ SET' : '✗ MISSING');
          
          setState(prev => ({
            ...prev,
            documents: docs,
            selectedModel: config.model_preference || 'nvidia/nemotron-3-nano-30b-a3b:free',
            openRouterKey: config.api_keys?.openrouter || '',
            googleKey: config.api_keys?.google || '',
            xaiKey: config.api_keys?.xai || '',
            openaiKey: config.api_keys?.openai || '',
            mistralKey: config.api_keys?.mistral || '',
            contextScript: config.context_script || '',
            customContext: config.custom_context || '',
            mindMaps: config.mind_maps || [],
            useVault: config.settings?.useVault ?? true,
            useContextHistory: config.settings?.useContextHistory ?? false,
            maxTokens: config.settings?.maxTokens ?? 2000,
          }));
        } else {
          setState(prev => ({ ...prev, documents: docs }));
        }
        
        setIsDataLoaded(true);
      } catch (error: any) {
        console.error('Failed to load data:', error);
        
        // Show user-friendly error message
        const errorMsg = error.message || 'Failed to load data from server';
        if (errorMsg.includes('Database migration required')) {
          setLoadingError('⚠️ Database migration required. Please run: cd backend && python migrate_db.py');
        } else if (errorMsg.includes('Failed to fetch')) {
          setLoadingError('⚠️ Cannot connect to backend server. Please ensure the server is running.');
        } else {
          setLoadingError(`⚠️ ${errorMsg}`);
        }
        
        setIsDataLoaded(true);
      }
    };
    
    loadData();
  }, [authToken, isDataLoaded, isAuthChecking]);

  // Reset data loaded flag when authToken changes (logout/login)
  useEffect(() => {
    if (!authToken) {
      setIsDataLoaded(false);
      setLoadingError(null);
    }
  }, [authToken]);

  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [isMindMapEditorOpen, setIsMindMapEditorOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isConversationsPageOpen, setIsConversationsPageOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [currentConversationTitle, setCurrentConversationTitle] = useState<string | null>(null);
  const [savedMessageIds, setSavedMessageIds] = useState<Set<string>>(new Set());
  const [deletedDocuments, setDeletedDocuments] = useState<Document[]>([]);

  // Save completed assistant messages to conversation
  useEffect(() => {
    if (!currentConversationId || !authToken) return;

    const lastMessage = state.messages[state.messages.length - 1];
    if (
      lastMessage &&
      lastMessage.role === 'assistant' &&
      lastMessage.status === 'completed' &&
      lastMessage.content &&
      !savedMessageIds.has(lastMessage.id)
    ) {
      // Mark as saved immediately to prevent duplicates
      setSavedMessageIds(prev => new Set(prev).add(lastMessage.id));

      // Save to backend
      fetch(`/api/conversations/${currentConversationId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: 'assistant',
          content: lastMessage.content,
          model: lastMessage.modelId || state.selectedModel,
          extra_data: {
            sources: lastMessage.agentContext?.sources || lastMessage.sources || []
          }
        })
      }).catch(error => {
        console.error('Error saving assistant message:', error);
        // Remove from saved set if save failed
        setSavedMessageIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(lastMessage.id);
          return newSet;
        });
      });
    }
  }, [state.messages, currentConversationId, authToken, savedMessageIds, state.selectedModel]);

  // Clear saved messages when conversation changes
  useEffect(() => {
    setSavedMessageIds(new Set());
  }, [currentConversationId]);

  // Handle URL routing for conversations
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const conversationId = params.get('conversation');
    
    if (conversationId && authToken && !currentConversationId) {
      const id = parseInt(conversationId, 10);
      if (!isNaN(id)) {
        handleSelectConversation(id);
      }
    }
  }, [authToken]);

  // Update URL when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      const url = new URL(window.location.href);
      url.searchParams.set('conversation', currentConversationId.toString());
      window.history.pushState({}, '', url.toString());
    } else {
      // Clear conversation param when starting new chat
      const url = new URL(window.location.href);
      url.searchParams.delete('conversation');
      window.history.pushState({}, '', url.toString());
    }
  }, [currentConversationId]);

  const [inputValue, setInputValue] = useState('');
  const [isVaultOpen, setIsVaultOpen] = useState(true);
  const [activeFileNames, setActiveFileNames] = useState<string[]>([]);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [controlsWidth, setControlsWidth] = useState(350);
  const [vaultWidth, setVaultWidth] = useState(350);
  const isResizingControls = useRef(false);
  const isResizingVault = useRef(false);

  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleOnboardingComplete = async (settings: { provider: string; model: string; apiKey: string }) => {
    if (!authToken) return;
    
    // Only send keys that have actual values to preserve existing keys
    const apiKeys: Record<string, string> = {};
    if (state.openRouterKey) apiKeys.openrouter = state.openRouterKey;
    if (state.googleKey) apiKeys.google = state.googleKey;
    if (state.xaiKey) apiKeys.xai = state.xaiKey;
    if (state.openaiKey) apiKeys.openai = state.openaiKey;
    if (state.mistralKey) apiKeys.mistral = state.mistralKey;
    
    // Add the new key from onboarding
    apiKeys[settings.provider] = settings.apiKey;
    
    try {
      await storageService.updateUserConfig(authToken, {
        model_preference: settings.model,
        api_keys: apiKeys
      });

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
    } catch (error) {
      console.error('Failed to save onboarding settings:', error);
    }
  };

  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper function to sync specific config changes to backend
  const syncConfigToBackend = useCallback(async (updates: Partial<{
    settings?: { useVault?: boolean; useContextHistory?: boolean; maxTokens?: number };
    model_preference?: string;
    api_keys?: Record<string, string>;
    context_script?: string;
    custom_context?: string;
    mind_maps?: any[];
  }>) => {
    if (!authToken) return;
    
    try {
      await storageService.updateUserConfig(authToken, updates);
    } catch (error: any) {
      console.error('Failed to sync config:', error);
      if (!error.message?.includes('Database migration required')) {
        addToast('Failed to save settings to server', 'error');
      }
    }
  }, [authToken]);

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

    // Process sequentially to handle parsing and uploading
    for (const file of fileArray) {
      try {
        // Use fileService to parse PDF/DOCX/Text
        const text = await fileService.parseFile(file);
        const docId = Math.random().toString(36).substring(2, 11);
        
        // Only add to state if backend upload succeeds
        if (authToken) {
          try {
            await storageService.saveDocument(authToken, {
              doc_id: docId,
              filename: file.name,
              content: text,
              enabled: true
            });
            
            // Success! Add to local state (without content - backend has it)
            newDocs.push({
              id: docId,
              name: file.name,
              enabled: true
            });
          } catch (uploadErr: any) {
            addToast(`Failed to upload ${file.name}: ${uploadErr.message}`, 'error');
          }
        } else {
          // No auth token, just add locally (shouldn't happen but fallback)
          newDocs.push({
            id: docId,
            name: file.name,
            enabled: true
          });
        }
      } catch (err: any) {
        addToast(`Failed to parse ${file.name}: ${err.message}`, 'error');
      }
    }
    
    if (newDocs.length > 0) {
      setState(prev => ({ ...prev, documents: [...prev.documents, ...newDocs] }));
      addToast(`Successfully added ${newDocs.length} document(s)`);
    }
  }, [state.documents, authToken]);

  const handleManualDocAdd = useCallback(async (name: string, content: string) => {
    if (state.documents.length >= 20) {
      addToast("File limit reached (20 max).");
      return;
    }
    
    const docId = Math.random().toString(36).substring(2, 11);
    
    // Upload to backend first
    if (authToken) {
      try {
        await storageService.saveDocument(authToken, {
          doc_id: docId,
          filename: name,
          content,
          enabled: true
        });
        
        // Success! Add to local state (without content - backend has it)
        const newDoc: Document = {
          id: docId,
          name,
          enabled: true
        };
        setState(prev => ({ ...prev, documents: [...prev.documents, newDoc] }));
        addToast(`Added: ${name}`);
      } catch (err: any) {
        addToast(`Failed to save ${name}: ${err.message}`, 'error');
      }
    } else {
      // No auth token, just add locally (shouldn't happen but fallback)
      const newDoc: Document = {
        id: docId,
        name,
        enabled: true
      };
      setState(prev => ({ ...prev, documents: [...prev.documents, newDoc] }));
    }
  }, [state.documents, authToken, addToast]);

  const handleUndoDelete = useCallback(() => {
    if (deletedDocuments.length === 0) {
      addToast("No deleted documents to recover.");
      return;
    }
    const lastDeleted = deletedDocuments[deletedDocuments.length - 1];
    setState(prev => ({
      ...prev,
      documents: [...prev.documents, lastDeleted]
    }));
    setDeletedDocuments(prev => prev.slice(0, -1));
    addToast(`Recovered: ${lastDeleted.name}`, 'error');
  }, [deletedDocuments]);

  // No frontend indexing needed - backend handles all document operations

  // NEW: Backend-powered query processing
  const processQuery = async (
    query: string,
    assistantId: string,
    skipResearch: boolean = false,
    resetIterations: boolean = false,
    priorContext?: string
  ) => {
    if (!authToken) {
      addToast('Not authenticated', 'error');
      return;
    }
    
    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    await processQueryWithBackend(
      query,
      assistantId,
      authToken,
      state,
      setState,
      setActiveFileNames,
      addToast,
      state.selectedModel,
      abortController.signal,
      undefined, // filteredSources
      skipResearch,
      priorContext
    );
    
    // Clear abort controller after completion
    if (abortControllerRef.current === abortController) {
      abortControllerRef.current = null;
    }
  };

  /* 
   * OLD FRONTEND RAG CODE - Removed for security
   * All LLM processing now happens in backend agent_rag_engine.py
   * This keeps API keys and prompts secure on the server
   * See processQueryWithBackend in utils/backendQueryProcessor.ts
   */

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

  // Conversation management functions
  const handleSelectConversation = useCallback(async (conversationId: number) => {
    if (!authToken) return;
    
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to load conversation');
      
      const data = await response.json();
      setCurrentConversationId(conversationId);
      setCurrentConversationTitle(data.title);
      
      // Convert backend messages to frontend Message format
      const messages: any[] = data.messages.map((msg: any) => ({
        id: msg.id.toString(),
        role: msg.role,
        content: msg.content,
        modelId: msg.model,
        timestamp: new Date(msg.timestamp),
        status: 'completed',
        sources: msg.extra_data?.sources
      }));
      
      setState(prev => ({ ...prev, messages }));
      addToast(`Loaded: ${data.title}`, 'success');
    } catch (error) {
      console.error('Error loading conversation:', error);
      addToast('Failed to load conversation', 'error');
    }
  }, [authToken]);

  const handleNewConversation = useCallback(() => {
    // Clear current conversation and messages
    setCurrentConversationId(null);
    setCurrentConversationTitle(null);
    setState(prev => ({ ...prev, messages: [] }));
    setInputValue('');
    addToast('Started new conversation', 'success');
  }, []);

  const handleSend = useCallback(async (customValue?: string) => {
    const valToUse = customValue ?? inputValue;
    if (!valToUse.trim() || state.isProcessing) return;
    
    console.log('[handleSend] Selected model:', state.selectedModel);
    
    // Note: API key validation is handled by the backend.
    // The backend reads keys directly from the database, so the frontend
    // state may be stale. We no longer block requests based on frontend key state.
    // If a key is missing, the backend will return a clear error in the stream.

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

    // Create or update conversation
    if (authToken) {
      try {
        if (!currentConversationId) {
          // Create new conversation with first message as title
          const title = currentQuery.length > 50 ? currentQuery.substring(0, 50) + '...' : currentQuery;
          const response = await fetch('/api/conversations', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title })
          });
          
          if (response.ok) {
            const newConv = await response.json();
            setCurrentConversationId(newConv.id);
            setCurrentConversationTitle(newConv.title);
            
            // Save user message
            await fetch(`/api/conversations/${newConv.id}/messages`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                role: 'user',
                content: currentQuery,
                model: null
              })
            });
          }
        } else {
          // Add message to existing conversation
          await fetch(`/api/conversations/${currentConversationId}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              role: 'user',
              content: currentQuery,
              model: null
            })
          });
        }
      } catch (error) {
        console.error('Error saving conversation:', error);
      }
    }

    await processQuery(currentQuery, assistantId);
  }, [inputValue, state.isProcessing, state.documents, state.useVault, state.selectedModel, state.contextScript, state.useContextHistory, state.openRouterKey, state.googleKey, state.xaiKey, state.openaiKey, state.mistralKey, state.maxAgentIterations, authToken, currentConversationId]);

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
  }, [state.messages, state.isProcessing, state.useVault, state.documents, state.selectedModel, state.contextScript, state.useContextHistory, state.openRouterKey, state.googleKey, state.xaiKey, state.openaiKey, state.mistralKey]);

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

  const handleMaxIterationsDecision = useCallback(async (messageId: string, shouldContinue: boolean) => {
    const msg = state.messages.find(m => m.id === messageId);
    if (!msg) return;

    if (!shouldContinue) {
      // User chose to stop - proceed to thinker/answer generation
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(m => m.id === messageId ? {
          ...m,
          pendingMaxIterations: false,
          thoughtLogs: [
            ...(m.thoughtLogs || []),
            { timestamp: Date.now(), step: 'User Decision', thought: 'User chose to stop research and generate answer.', turn: m.agentContext?.iterations }
          ]
        } : m)
      }));

      // Skip research and go straight to thinker/answer generation with collected knowledge
      await processQuery(
        msg.agentContext?.originalQuery || "",
        messageId,
        true,
        false,
        msg.agentContext?.knowledgeBuffer || ''
      );
    } else {
      // User chose to continue - RESET iteration counter to allow more iterations
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(m => m.id === messageId ? {
          ...m,
          pendingMaxIterations: false,
          thoughtLogs: [
            ...(m.thoughtLogs || []),
            { timestamp: Date.now(), step: 'User Decision', thought: `User chose to continue research for ${state.maxAgentIterations} more iterations.`, turn: m.agentContext?.iterations }
          ],
          agentContext: {
            ...m.agentContext!,
            knowledgeBuffer: m.agentContext!.knowledgeBuffer + `\n--- User Decision ---\nContinuing research for ${state.maxAgentIterations} more iterations.\n`
          }
        } : m)
      }));

      // Continue research loop - send with prior context so backend can build on it
      await processQuery(
        msg.agentContext?.originalQuery || "",
        messageId,
        false,
        true,
        msg.agentContext?.knowledgeBuffer || ''
      );
    }
  }, [state.messages, state.maxAgentIterations, processQuery]);

  const onClearChat = useCallback(() => {
    setConfirmationState({
      isOpen: true,
      title: "Clear Conversation",
      message: "Are you sure you want to clear the entire conversation history? This action cannot be undone.",
      onConfirm: () => {
        setState(prev => ({ ...prev, messages: [], contextScript: "" }));
        setCurrentConversationId(null);
        setCurrentConversationTitle(null);
      }
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

  // Keyboard shortcuts - declared after all required callbacks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in an input field
      const target = e.target as HTMLElement;
      const isInInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      
      // Ctrl/Cmd + K: Show shortcuts (works anywhere)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsShortcutsOpen(true);
        return;
      }
      
      // Don't process shortcuts when in input fields (except for specific ones)
      if (isInInput) return;

      // Ctrl/Cmd + Shift + L: Clear chat
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        onClearChat();
      }

      // Ctrl/Cmd + Shift + V: Toggle vault
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        setIsVaultOpen(prev => !prev);
      }

      // Ctrl/Cmd + Shift + H: Toggle context history
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setState(prev => ({ ...prev, useContextHistory: !prev.useContextHistory }));
      }

      // Ctrl/Cmd + ,: Open API settings
      else if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setState(prev => ({ ...prev, isApiKeyModalOpen: true }));
      }

      // Ctrl/Cmd + Z: Undo document deletion
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndoDelete();
      }

      // Alt + ArrowUp: Previous message in history
      else if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault();
        handleHistoryNav('up');
      }

      // Alt + ArrowDown: Next message in history
      else if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault();
        handleHistoryNav('down');
      }

      // Escape: Stop processing
      else if (e.key === 'Escape' && state.isProcessing) {
        e.preventDefault();
        handleStop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isProcessing, handleUndoDelete, handleStop, onClearChat, handleHistoryNav]);

  // Global drag and drop file upload
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer?.types?.includes('Files')) {
        setIsDraggingOver(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.target === document) {
        setIsDraggingOver(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        // Create a synthetic event to pass to handleFileUpload
        const fileArray = Array.from(files);
        const event = {
          target: {
            files: files
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleFileUpload(event);
      }
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, [handleFileUpload]);

  // Show loading screen during authentication check
  if (isAuthChecking) {
    return <LoadingScreen />;
  }

  // Show auth page if not logged in
  if (!authToken) {
    return <AuthPage onLogin={async (token) => {
      localStorage.setItem('auth_token', token);
      setAuthToken(token);
      
      // Migrate data from localStorage to backend
      try {
        await storageService.migrateAllDataToBackend(token);
      } catch (error) {
        console.error('Migration failed:', error);
      }
      
      // Redirect to /app instead of reloading
      window.location.href = '/app';
    }} />;
  }

  // Show auth error in LoadingScreen if authentication failed
  if (loadingError && !authToken) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-brand-base">
        <div className="w-full max-w-md p-8 space-y-6">
          <img src="/logo.png" alt="Copper" className="h-20 w-auto mx-auto" />
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center space-y-3">
            <button
              onClick={() => {
                setLoadingError(null);
                setIsAuthChecking(true);
                fetchUser();
              }}
              className="mt-4 px-6 py-3 bg-brand-accent hover:bg-brand-accent/80 text-white rounded-xl font-bold text-sm transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading screen while fetching initial data
  if (!isDataLoaded) {
    return <LoadingScreen />;
  }

  // Show data loading error in LoadingScreen
  if (loadingError) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-brand-base">
        <div className="w-full max-w-2xl p-8 space-y-6">
          <img src="/logo.png" alt="Copper" className="h-20 w-auto mx-auto" />
          <div className="space-y-4">
            <div className="text-center text-gray-300 whitespace-pre-wrap">
              {loadingError}
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-brand-accent hover:bg-brand-accent/80 text-white rounded-xl font-bold text-sm transition-all"
              >
                Retry Connection
              </button>
              <button
                onClick={() => {
                  setAuthToken(null);
                  localStorage.removeItem('auth_token');
                  window.location.reload();
                }}
                className="px-6 py-3 bg-brand-base hover:bg-brand-border text-gray-300 rounded-xl font-bold text-sm transition-all border border-brand-border"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isOnboarding) {
    return <LoadingScreen isOnboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <div className="flex flex-col h-screen bg-light-base dark:bg-brand-base text-gray-900 dark:text-gray-100 transition-colors overflow-hidden relative">
        {/* Drag overlay */}
        {isDraggingOver && (
          <div className="fixed inset-0 bg-brand-accent/20 border-4 border-dashed border-brand-accent rounded-lg pointer-events-none z-[200] flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-accent mb-2">📁</div>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">Drop files to upload</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Supported: PDF, DOCX, TXT</p>
            </div>
          </div>
        )}
        
        {/* TOP HEADER */}
        <Header 
          title="Copper" 
          conversationTitle={currentConversationTitle}
          onHelpClick={() => setIsShortcutsOpen(true)}
          onSettingsClick={() => setState(prev => ({ ...prev, isApiKeyModalOpen: true }))}
          onToggleVault={() => setIsVaultOpen(prev => !prev)}
          isVaultOpen={isVaultOpen}
          user={user}
          authToken={authToken}
          onLogout={() => {
            setAuthToken(null);
            localStorage.removeItem('auth_token');
            window.location.reload();
          }}
          onAvatarUpload={handleAvatarUpload}
          onProfileClick={() => setIsProfileModalOpen(true)}
          onConversationsClick={() => setIsConversationsPageOpen(true)}
        />

        {/* MAIN CONTENT AREA */}
        <div className="flex flex-1 min-h-0">
          {/* LEFT SIDEBAR: Controls */}
        <div
          className="shrink-0 flex relative z-30"
          style={{ width: `${controlsWidth}px` }}
        >
          <div className="flex-1 min-w-0 h-full overflow-hidden border-r border-light-border/50 dark:border-brand-border/50 relative">
            <RightSidebar
              inputValue={inputValue} setInputValue={setInputValue}
              onSend={handleSend} onStop={handleStop} onHistoryNav={handleHistoryNav}
              isProcessing={state.isProcessing}
              useVault={state.useVault} setUseVault={(v) => {
                setState(prev => ({ ...prev, useVault: v }));
                syncConfigToBackend({ settings: { useVault: v, useContextHistory: state.useContextHistory, maxTokens: state.maxTokens } });
              }}
              useContextHistory={state.useContextHistory}
              setUseContextHistory={(v) => {
                setState(prev => ({ ...prev, useContextHistory: v }));
                syncConfigToBackend({ settings: { useVault: state.useVault, useContextHistory: v, maxTokens: state.maxTokens } });
              }}
              onClearContext={handleClearContextHistory}
              selectedModel={state.selectedModel}
              setSelectedModel={(m) => {
                setState(prev => ({ ...prev, selectedModel: m }));
                syncConfigToBackend({ model_preference: m });
              }}
              openRouterKey={state.openRouterKey} setOpenRouterKey={(k) => setState(prev => ({ ...prev, openRouterKey: k }))}
              onOpenApiManagement={() => setState(prev => ({ ...prev, isApiKeyModalOpen: true }))}
              onOpenModelSelector={() => setIsModelSelectorOpen(true)}
              availableDocuments={state.documents.filter(d => d.enabled)}
              onClearChat={onClearChat}
              maxTokens={state.maxTokens}
              setMaxTokens={(n) => {
                setState(prev => ({ ...prev, maxTokens: n }));
                syncConfigToBackend({ settings: { useVault: state.useVault, useContextHistory: state.useContextHistory, maxTokens: n } });
              }}
              maxAgentIterations={state.maxAgentIterations}
              setMaxAgentIterations={(n) => setState(prev => ({ ...prev, maxAgentIterations: n }))}
              customContext={state.customContext}
              setCustomContext={(v) => {
                setState(prev => ({ ...prev, customContext: v }));
                syncConfigToBackend({ custom_context: v });
              }}
            />

            {/* INTERNAL COLLAPSE BUTTON REMOVED AS PER USER REQUEST */}
          </div>
          <div onMouseDown={startResizingControls} className="w-1.5 cursor-col-resize bg-light-border dark:bg-brand-border hover:bg-brand-accent transition-all flex flex-col items-center justify-center gap-1 group shrink-0">
          </div>
        </div>

        {/* FLOAT OPEN BUTTONS */}
        {/* Vault Open Button Now in Navbar */}

        <main className="flex-1 flex flex-col min-w-0 bg-light-base dark:bg-brand-base relative transition-all">
          <ChatInterface
            messages={state.messages}
            selectedModelId={state.selectedModel}
            onRetry={handleRetry}
            onRegenerate={handleRegenerate}
            onClearChat={onClearChat}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSend={handleSend}
            onStop={handleStop}
            onClarifyAnswer={handleClarificationAnswer}
            onMaxIterationsDecision={handleMaxIterationsDecision}
            maxAgentIterations={state.maxAgentIterations}
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
          <div onMouseDown={startResizingVault} className="w-1.5 cursor-col-resize bg-light-border dark:bg-brand-border hover:bg-brand-accent transition-all flex flex-col items-center justify-center gap-1 group shrink-0">
          </div>

          <div className="flex-1 min-w-0 h-full overflow-hidden border-l border-light-border/50 dark:border-brand-border/50 relative">
            <DocumentList
              documents={state.documents} onUpload={handleFileUpload}
              onRemove={async (id) => {
                const doc = state.documents.find(d => d.id === id);
                if (doc && authToken) {
                  try {
                    await storageService.deleteDocument(authToken, doc.id);
                    setDeletedDocuments(prev => [...prev, doc]);
                    setState(prev => ({ ...prev, documents: prev.documents.filter(d => d.id !== id) }));
                    addToast(`Deleted: ${doc.name}. Press Ctrl+Z to undo.`, 'error');
                  } catch (error) {
                    console.error('Failed to delete document:', error);
                    addToast('Failed to delete document', 'error');
                  }
                }
              }}
              onToggle={async (id) => {
                const doc = state.documents.find(d => d.id === id);
                if (doc && authToken) {
                  // Set loading state
                  setState(prev => ({ 
                    ...prev, 
                    documents: prev.documents.map(d => d.id === id ? { ...d, isLoading: true } : d) 
                  }));
                  
                  try {
                    await storageService.updateDocument(authToken, doc.id, { enabled: !doc.enabled });
                    setState(prev => ({ 
                      ...prev, 
                      documents: prev.documents.map(d => d.id === id ? { ...d, enabled: !d.enabled, isLoading: false } : d) 
                    }));
                  } catch (error) {
                    console.error('Failed to toggle document:', error);
                    // Remove loading state on error
                    setState(prev => ({ 
                      ...prev, 
                      documents: prev.documents.map(d => d.id === id ? { ...d, isLoading: false } : d) 
                    }));
                    addToast('Failed to toggle document', 'error');
                  }
                }
              }}
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

        <ApiKeyManagementModal
          isOpen={state.isApiKeyModalOpen}
          onClose={() => setState(prev => ({ ...prev, isApiKeyModalOpen: false }))}
          onSave={(keys) => {
            // Only send keys that have actual values (non-empty)
            const apiKeys: Record<string, string> = {};
            if (keys.openrouter) apiKeys.openrouter = keys.openrouter;
            if (keys.google) apiKeys.google = keys.google;
            if (keys.xai) apiKeys.xai = keys.xai;
            if (keys.openai) apiKeys.openai = keys.openai;
            if (keys.mistral) apiKeys.mistral = keys.mistral;
            
            // Only sync if there are keys to send
            if (Object.keys(apiKeys).length > 0) {
              syncConfigToBackend({ api_keys: apiKeys });
            }
          }}
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
          onSaveMindMaps={(maps) => {
            setState(prev => ({ ...prev, mindMaps: maps }));
            syncConfigToBackend({ mind_maps: maps });
          }}
        />

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-3 z-50 pointer-events-none w-full max-sm px-4 shadow-2xl">
          {state.toasts.map(toast => (
            <div key={toast.id} className="pointer-events-auto flex items-center gap-3 px-5 py-3.5 bg-light-darker dark:bg-brand-darker message-shadow rounded-2xl border border-light-border dark:border-brand-border animate-blur-text w-full max-w-md">
              <div className="flex-1 flex flex-col">
                <p className="text-[13px] text-gray-700 dark:text-gray-300 font-medium leading-normal">{toast.message}</p>
                {toast.message.includes("OpenRouter Privacy Settings") && (
                  <a
                    href="https://openrouter.ai/settings/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center text-[11px] font-bold text-brand-accent hover:text-brand-accent/80 dark:hover:text-white transition-colors uppercase tracking-wide gap-1 self-start border-b border-brand-accent/30 hover:border-brand-accent pb-0.5"
                  >
                    Configure Settings &rarr;
                  </a>
                )}
              </div>
              <button onClick={() => removeToast(toast.id)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <ModelSelectorModal
          isOpen={isModelSelectorOpen}
          onClose={() => setIsModelSelectorOpen(false)}
          currentModelId={state.selectedModel}
          onSelect={(m) => {
            setState(prev => ({ ...prev, selectedModel: m }));
            syncConfigToBackend({ model_preference: m });
          }}
          title="Select Primary Intelligence"
        />

        <ShortcutsModal
          isOpen={isShortcutsOpen}
          onClose={() => setIsShortcutsOpen(false)}
        />

        <ProfileSettingsModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={user}
          authToken={authToken}
          onUpdate={fetchUser}
        />

        {isConversationsPageOpen && authToken && (
          <ConversationsPage
            token={authToken}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onClose={() => setIsConversationsPageOpen(false)}
          />
        )}
        </div>
      </div>
    </Suspense>
  );
};

export default App;
