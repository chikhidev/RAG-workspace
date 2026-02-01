import React from 'react';
import { SUPPORTED_MODELS } from '../services/modelService';
import { ChevronRight, ArrowLeft, Key, Check, Cpu, Globe, Zap, Shield } from 'lucide-react';

interface OnboardingSettings {
    provider: string;
    model: string;
    apiKey: string;
}

interface Props {
    isOnboarding?: boolean;
    onComplete?: (settings: OnboardingSettings) => void;
}

const LoadingScreen: React.FC<Props> = ({ isOnboarding, onComplete }) => {
    const [step, setStep] = React.useState(1);
    const [selectedProvider, setSelectedProvider] = React.useState<string>('google');
    const [selectedModel, setSelectedModel] = React.useState<string>('gemini-2.0-flash-thinking-exp');
    const [apiKey, setApiKey] = React.useState('');

    const providers = [
        { id: 'google', name: 'Google Gemini', icon: Globe, desc: 'High performance & thinking models', logo: '/logos/google.png' },
        { id: 'openrouter', name: 'OpenRouter', icon: Zap, desc: 'Aggregator of all top-tier models', logo: '/logos/openrouter.png' },
        { id: 'xai', name: 'xAI (Grok)', icon: Cpu, desc: 'Fast, concise, and smart reasoning', logo: '/logos/xai.png' },
        { id: 'openai', name: 'OpenAI', icon: Shield, desc: 'The industry standard for capability', logo: '/logos/chatgpt.png' },
        { id: 'anthropic', name: 'Anthropic', icon: Shield, desc: 'Claude models with extended thinking', logo: '/logos/anthropic.png' },
    ];

    const filteredModels = SUPPORTED_MODELS.filter(m => m.provider === selectedProvider);

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
        else if (onComplete) {
            onComplete({ provider: selectedProvider, model: selectedModel, apiKey });
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-black overflow-hidden font-sans">
            {/* Background Image with Gradient Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] scale-110 animate-[ken-burns_20s_infinite_alternate]"
                style={{ backgroundImage: 'url("/background.png")' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

            {/* Center Content: Onboarding UI */}
            {isOnboarding && (
                <div className="flex-1 flex items-center justify-center relative z-20 px-6">
                    <div className="w-full max-w-2xl bg-brand-base border border-white/10 rounded-3xl overflow-hidden animate-[fadeIn_0.5s_ease-out]">

                        {/* Header */}
                        <div className="px-10 pt-10 pb-6 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map(s => (
                                            <div key={s} className={`h-1 w-6 rounded-full transition-all duration-300 ${s <= step ? 'bg-brand-accent' : 'bg-white/10'}`} />
                                        ))}
                                    </div>
                                </div>
                                {step > 1 && (
                                    <button onClick={handleBack} className="flex items-center gap-2 text-[11px] font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest">
                                        <ArrowLeft size={14} /> Back
                                    </button>
                                )}
                            </div>
                            <h2 className="text-3xl font-bold text-white tracking-tight">
                                {step === 1 ? 'Choose your provider' :
                                    step === 2 ? 'Select your model' :
                                        step === 3 ? 'Set up connectivity' :
                                            'Finalize Workspace'}
                            </h2>
                            <p className="text-gray-400 text-sm mt-2 font-medium">
                                {step === 1 ? 'Select the intelligence provider you want to use as your primary brain.' :
                                    step === 2 ? `Choose which ${selectedProvider} model will process your complex RAG queries.` :
                                        step === 3 ? `Enter your ${selectedProvider} API key to enable standard model execution.` :
                                            'Your workspace is ready. You can add more providers and models later.'}
                            </p>
                        </div>

                        {/* Step Content */}
                        <div className="p-10 max-h-[50vh] overflow-y-auto custom-scrollbar">

                            {step === 1 && (
                                <div className="grid grid-cols-2 gap-4">
                                    {providers.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => { setSelectedProvider(p.id); setSelectedModel(SUPPORTED_MODELS.find(m => m.provider === p.id)?.id || ''); }}
                                            className={`flex flex-col items-start gap-4 p-6 rounded-2xl border transition-all text-left group ${selectedProvider === p.id ? 'bg-brand-accent/10 border-brand-accent' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedProvider === p.id ? 'bg-white' : 'bg-white/5 group-hover:bg-white transition-all'}`}>
                                                    <img src={p.logo} alt={p.name} className="w-6 h-6 object-contain" />
                                                </div>
                                                {selectedProvider === p.id && <Check size={18} className="text-brand-accent" />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white mb-1 tracking-wide">{p.name}</div>
                                                <div className="text-[11px] text-gray-500 leading-relaxed font-medium line-clamp-2">{p.desc}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-2">
                                    {filteredModels.map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => setSelectedModel(m.id)}
                                            className={`flex items-center justify-between w-full p-4 rounded-xl border transition-all text-left ${selectedModel === m.id ? 'bg-brand-accent/10 border-brand-accent' : 'bg-white/5 border-white/5 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 bg-white/5 rounded-lg p-1.5 shrink-0">
                                                    <img src={m.logo} alt="" className="w-full h-full object-contain" />
                                                </div>
                                                <div>
                                                    <div className="text-[13px] font-bold text-white capitalize">{m.name}</div>
                                                    <div className="text-[10px] text-gray-500 mt-0.5">{m.description}</div>
                                                </div>
                                            </div>
                                            {selectedModel === m.id && <Check size={16} className="text-brand-accent" />}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-mono text-brand-accent uppercase tracking-widest font-bold">API Key</label>
                                        <div className="relative group">
                                            <input
                                                type="password"
                                                autoFocus
                                                value={apiKey}
                                                onChange={(e) => setApiKey(e.target.value)}
                                                placeholder={`Enter ${selectedProvider} API Key...`}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white outline-none focus:border-brand-accent/50 focus:bg-white/[0.08] transition-all placeholder:text-white"
                                            />
                                        </div>
                                        <div className="flex items-start gap-2 p-4 rounded-xl">
                                            <div className="text-gray-400 mt-0.5"><ChevronRight size={14} /></div>
                                            <p className="text-[11px] text-gray-400/80 leading-relaxed">
                                                Don't worry, you can configure other providers (OpenAI, xAI, etc.) anytime within the workspace settings after setup.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="flex flex-col items-center text-center space-y-8 py-4">
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-bold text-white">All Systems Ready</h3>
                                        <p className="text-gray-400 text-sm max-w-sm font-medium">
                                            Your dual-brain RAG environment is configured with <span className="text-white">{selectedModel}</span>. You can now start indexing documents and chatting.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="px-10 py-8 bg-white/[0.03] border-t border-white/5 flex items-center justify-end">
                            <button
                                onClick={handleNext}
                                disabled={step === 3 && !apiKey}
                                className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold border transition-all text-[13px] ${step === 3 && !apiKey
                                    ? 'bg-black/20 border-black/20 text-gray-500 cursor-not-allowed'
                                    : 'bg-brand-accent border-brand-accent text-white'
                                    }`}
                            >
                                {step === 4 ? 'Launch Workspace' : 'Continue Setup'}
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Left Branding */}
            <div className="absolute bottom-12 left-12 z-10">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold text-white tracking-tighter filter drop-shadow-2xl">
                            RAG <span className="text-brand-accent italic">workspace</span>
                        </h1>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes ken-burns {
          from { transform: scale(1); }
          to { transform: scale(1.15) translate(1%, 1%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
        </div>
    );
};

export default LoadingScreen;
