
import React, { useState } from 'react';
import { X, Search, Check, Smartphone, Cpu, Zap, CreditCard } from 'lucide-react';
import { SUPPORTED_MODELS } from '../services/modelService';
import { ModelDefinition } from '../types';

interface ModelSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentModelId: string;
    onSelect: (modelId: string) => void;
    title: string;
}

export const ModelSelectorModal: React.FC<ModelSelectorModalProps> = ({
    isOpen, onClose, currentModelId, onSelect, title
}) => {
    const [search, setSearch] = useState('');
    const [providerFilter, setProviderFilter] = useState<'all' | string>('all');

    if (!isOpen) return null;

    // Filter models based on search term and provider
    const models = SUPPORTED_MODELS.filter(m => {
        const matchesProvider = providerFilter === 'all' || m.provider.toLowerCase() === providerFilter.toLowerCase();

        const matchesSearch =
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.provider.toLowerCase().includes(search.toLowerCase()) ||
            m.description.toLowerCase().includes(search.toLowerCase());

        return matchesProvider && matchesSearch;
    });

    const providers = ['all', ...new Set(SUPPORTED_MODELS.map(m => m.provider))];

    return (
        <div className="fixed inset-0 z-[1000] flex flex-col bg-brand-darker animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-8 py-6 border-b border-brand-border bg-brand-base/50">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-100 tracking-tight">{title}</h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-brand-border/50 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto px-8 py-12 space-y-8">
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white">Select Primary Intelligence</h3>
                        <p className="text-sm text-brand-muted">Choose the best model for your task. Each model offers different strengths in reasoning, speed, and cost.</p>
                    </div>



                    {/* Search & Filters */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search models..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-brand-border rounded-xl pl-10 pr-4 py-3 text-sm text-gray-200 placeholder:text-gray-600 focus:border-brand-accent outline-none transition-colors"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {providers.map(p => {
                            const logoPath = p === 'openai' ? '/logos/chatgpt.png' : `/logos/${p}.png`;
                            return (
                                <button
                                    key={p}
                                    onClick={() => setProviderFilter(p)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border flex items-center gap-2.5 ${providerFilter === p
                                        ? 'bg-brand-accent/20 border-brand-accent text-brand-accent'
                                        : 'bg-brand-base border-brand-border text-gray-500 hover:border-gray-400 hover:text-gray-300'
                                        }`}
                                >
                                    { p !== 'all' && <img src={logoPath} alt={p} className='w-4 h-4 object-contain rounded' /> }
                                    {p}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Grid Content */}
                <div className="bg-[#1a1a1a] border border-brand-border rounded-2xl p-6 max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {models.map(model => (
                            <button
                                key={model.id}
                                onClick={() => { onSelect(model.id); onClose(); }}
                                className={`flex flex-col text-left p-4 rounded-xl border transition-all hover:-translate-y-0.5 group relative ${currentModelId === model.id
                                    ? 'bg-brand-accent/10 border-brand-accent ring-1 ring-brand-accent'
                                    : 'bg-[#252525] border-brand-border hover:border-brand-accent/50 hover:shadow-lg'
                                    }`}
                            >

                                {/* Free Badge */}
                                {model.isFree && (
                                    <div className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase rounded border border-emerald-500/20">
                                        Free
                                    </div>
                                )}

                                {/* Header: Logo & Name */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-white rounded-lg p-1 shrink-0">
                                        <img src={model.logo} alt={model.name} className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-200 leading-tight group-hover:text-white transition-colors pr-6">
                                            {model.name}
                                        </h3>
                                        <span className="text-[10px] text-brand-muted uppercase tracking-wider">{model.provider}</span>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-[11px] text-gray-400 mb-4 line-clamp-2 h-8 leading-relaxed">
                                    {model.description}
                                </p>

                                {/* Specs Grid */}
                                <div className="mt-auto grid grid-cols-2 gap-2 pt-3 border-t border-white/5">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[9px] text-brand-muted uppercase tracking-tighter flex items-center gap-1">
                                            <CreditCard size={10} /> Input Price
                                        </span>
                                        <span className="text-[11px] font-mono text-gray-300">{model.metadata.inputPrice}</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[9px] text-brand-muted uppercase tracking-tighter flex items-center gap-1">
                                            <CreditCard size={10} /> Output Price
                                        </span>
                                        <span className="text-[11px] font-mono text-gray-300">{model.metadata.outputPrice}</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[9px] text-brand-muted uppercase tracking-tighter flex items-center gap-1">
                                            <Zap size={10} /> Latency
                                        </span>
                                        <span className="text-[11px] font-mono text-gray-300">{model.metadata.latency}</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[9px] text-brand-muted uppercase tracking-tighter flex items-center gap-1">
                                            <Cpu size={10} /> Context
                                        </span>
                                        <span className="text-[11px] font-mono text-gray-300">{model.metadata.context}</span>
                                    </div>
                                </div>

                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="border-t border-brand-border bg-brand-base/80 backdrop-blur-md px-8 py-6 shrink-0 z-50 sticky bottom-0">
                <div className="max-w-6xl mx-auto flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl text-sm font-bold tracking-wide transition-all hover:-translate-y-0.5 active:translate-y-0"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
