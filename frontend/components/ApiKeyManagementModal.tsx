import React, { useState } from 'react';
import { X, Eye, EyeOff, Key } from 'lucide-react';

interface ApiKeyManagementModalProps {
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
  isOpen, onClose, openRouterKey, setOpenRouterKey, googleKey, setGoogleKey, 
  xaiKey, setXaiKey, openaiKey, setOpenaiKey, mistralKey, setMistralKey
}) => {
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleKeyVisibility = (providerId: string) => {
    setVisibleKeys(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const getKeyValue = (providerId: string) => {
    switch (providerId) {
      case 'openrouter': return openRouterKey;
      case 'google': return googleKey;
      case 'xai': return xaiKey;
      case 'openai': return openaiKey;
      case 'mistral': return mistralKey;
      default: return '';
    }
  };

  const setKeyValue = (providerId: string, value: string) => {
    switch (providerId) {
      case 'openrouter': setOpenRouterKey(value); break;
      case 'google': setGoogleKey(value); break;
      case 'xai': setXaiKey(value); break;
      case 'openai': setOpenaiKey(value); break;
      case 'mistral': setMistralKey(value); break;
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-brand-darker animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-brand-border bg-brand-base/50 shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-100 tracking-tight">API Key Management</h2>
            <p className="text-xs text-brand-muted mt-0.5">Secure your API credentials for various AI providers</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-brand-border/50 rounded-full transition-colors text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-12 space-y-8">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Provider Configuration</h3>
            <p className="text-sm text-brand-muted">Manage your API credentials for various AI providers. Keys are stored securely on your device.</p>
          </div>

          {/* Providers Grid */}
          <div className="space-y-3">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="bg-[#1a1a1a] border border-brand-border rounded-xl p-6 hover:border-brand-accent/30 transition-all hover:shadow-lg hover:shadow-brand-accent/5"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-white rounded-lg p-2 shrink-0 flex items-center justify-center">
                    <img src={provider.logo} alt={provider.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-gray-100">{provider.name}</h4>
                      {provider.isPrimary && (
                        <span className="px-2 py-0.5 rounded bg-brand-accent/10 text-brand-accent text-[9px] font-bold uppercase tracking-wider">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-brand-muted leading-relaxed">{provider.description}</p>
                  </div>
                </div>

                {/* Input Section */}
                <div className="relative">
                  <input
                    type={visibleKeys[provider.id] ? 'text' : 'password'}
                    value={getKeyValue(provider.id)}
                    onChange={(e) => setKeyValue(provider.id, e.target.value)}
                    placeholder={provider.placeholder}
                    className="w-full bg-brand-darker border border-brand-border rounded-lg px-4 py-3 pr-12 text-[13px] font-mono text-gray-200 placeholder:text-gray-600 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility(provider.id)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
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
      <div className="border-t border-brand-border bg-brand-base/80 backdrop-blur-md px-8 py-6 shrink-0 z-50 sticky bottom-0">
        <div className="max-w-5xl mx-auto flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-lg text-sm font-bold tracking-wide transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
