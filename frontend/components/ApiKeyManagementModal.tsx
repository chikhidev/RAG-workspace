import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Key, AlertCircle, Save } from 'lucide-react';

interface ApiKeyManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (keys: { openrouter: string; google: string; xai: string; openai: string; mistral: string }) => void;
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
}

const providers = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Aggregator for various top-tier models (Claude, GPT-4, Llama 3)',
    logo: '/logos/openrouter.png',
    placeholder: 'sk-or-v1-...',
    isPrimary: true
  },
  {
    id: 'google',
    name: 'Google AI Studio',
    description: 'Access Gemini 1.5 Pro, Flash and other Google models directly',
    logo: '/logos/google.png',
    placeholder: 'AIzaSy...'
  },
  {
    id: 'xai',
    name: 'xAI (Grok)',
    description: 'Access Grok 3 and Grok 3 Mini models',
    logo: '/logos/xai.png',
    placeholder: 'xai-...'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Access GPT-5 suite, and older GPT-4/3.5 models directly',
    logo: '/logos/chatgpt.png',
    placeholder: 'sk-...'
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Access Mistral Large, Small, and specialized coding models',
    logo: '/logos/mistral.png',
    placeholder: 'api key...'
  }
];

export const ApiKeyManagementModal: React.FC<ApiKeyManagementModalProps> = ({
  isOpen, onClose, onSave, openRouterKey, setOpenRouterKey, googleKey, setGoogleKey, 
  xaiKey, setXaiKey, openaiKey, setOpenaiKey, mistralKey, setMistralKey
}) => {
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  
  // Local state for editing (not saved until Done is clicked)
  const [localKeys, setLocalKeys] = useState({
    openrouter: openRouterKey,
    google: googleKey,
    xai: xaiKey,
    openai: openaiKey,
    mistral: mistralKey
  });

  // Initial values to track changes
  const [initialKeys, setInitialKeys] = useState(localKeys);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedToast, setShowUnsavedToast] = useState(false);

  // Initialize local state when modal opens
  useEffect(() => {
    if (isOpen) {
      const keys = {
        openrouter: openRouterKey,
        google: googleKey,
        xai: xaiKey,
        openai: openaiKey,
        mistral: mistralKey
      };
      setLocalKeys(keys);
      setInitialKeys(keys);
      setHasUnsavedChanges(false);
      setShowUnsavedToast(false);
    }
  }, [isOpen, openRouterKey, googleKey, xaiKey, openaiKey, mistralKey]);

  // Check for changes
  useEffect(() => {
    const changed = Object.keys(localKeys).some(
      key => localKeys[key as keyof typeof localKeys] !== initialKeys[key as keyof typeof initialKeys]
    );
    setHasUnsavedChanges(changed);

    // Show toast when user makes first change
    if (changed && !showUnsavedToast && isOpen) {
      setShowUnsavedToast(true);
      setTimeout(() => setShowUnsavedToast(false), 3000);
    }
  }, [localKeys, initialKeys, isOpen]);

  // Prevent page refresh with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && isOpen) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isOpen]);

  if (!isOpen) return null;

  const toggleKeyVisibility = (providerId: string) => {
    setVisibleKeys(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const getLocalKeyValue = (providerId: string) => {
    return localKeys[providerId as keyof typeof localKeys] || '';
  };

  const setLocalKeyValue = (providerId: string, value: string) => {
    setLocalKeys(prev => ({
      ...prev,
      [providerId]: value
    }));
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    // Save all keys to parent state
    setOpenRouterKey(localKeys.openrouter);
    setGoogleKey(localKeys.google);
    setXaiKey(localKeys.xai);
    setOpenaiKey(localKeys.openai);
    setMistralKey(localKeys.mistral);
    
    // Pass the keys directly to onSave to avoid race conditions with async state updates
    onSave?.(localKeys);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-light-base dark:bg-brand-darker animate-in fade-in duration-200">
      {/* Unsaved Changes Toast */}
      {showUnsavedToast && (
        <div className="fixed top-4 right-4 z-[1100] bg-brand-accent text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-slide-in">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">You have unsaved changes</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-light-border dark:border-brand-border bg-light-darker/50 dark:bg-brand-base/50 shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">API Key Management</h2>
            <p className="text-xs text-light-muted dark:text-brand-muted mt-0.5">Secure your API credentials for various AI providers</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-light-border dark:hover:bg-brand-border/50 rounded-full transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <X size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-12 space-y-8">

          {/* Providers Grid */}
          <div className="space-y-3">{providers.map((provider) => (
              <div
                key={provider.id}
                className="bg-gray-50 dark:bg-[#1a1a1a] border border-light-border dark:border-brand-border rounded-xl p-6 hover:border-brand-accent/30 transition-all hover:shadow-lg hover:shadow-brand-accent/5"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-white rounded-lg p-2 shrink-0 flex items-center justify-center">
                    <img src={provider.logo} alt={provider.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">{provider.name}</h4>
                      {provider.isPrimary && (
                        <span className="px-2 py-0.5 rounded bg-brand-accent/10 text-brand-accent text-[9px] font-bold uppercase tracking-wider">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-light-muted dark:text-brand-muted leading-relaxed">{provider.description}</p>
                  </div>
                </div>

                {/* Input Section */}
                <div className="relative">
                  <input
                    type={visibleKeys[provider.id] ? 'text' : 'password'}
                    value={getLocalKeyValue(provider.id)}
                    onChange={(e) => setLocalKeyValue(provider.id, e.target.value)}
                    placeholder={provider.placeholder}
                    className="w-full bg-light-base dark:bg-brand-darker border border-light-border dark:border-brand-border rounded-lg px-4 py-3 pr-12 text-[13px] font-mono text-gray-900 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-600 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility(provider.id)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    title={visibleKeys[provider.id] ? 'Hide key' : 'Show key'}
                  >
                    {visibleKeys[provider.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-light-border dark:border-brand-border bg-light-base/80 dark:bg-brand-base/80 backdrop-blur-md px-8 py-6 shrink-0 z-50 sticky bottom-0">
        <div className="max-w-5xl mx-auto flex justify-end gap-3">
          <button
            onClick={handleSave}
            className={`px-6 py-3 rounded-lg text-sm font-bold tracking-wide transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 bg-brand-accent ${
              hasUnsavedChanges
                ? 'border border-white/20 hover:bg-brand-accent/90 text-white'
                : 'hover:bg-brand-accent/90 text-white'
            }`}
          >
            {hasUnsavedChanges ? "Save Changes" : "All Changes Saved"}
            
          </button>
        </div>
      </div>
    </div>
  );
};
