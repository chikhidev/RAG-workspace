
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-[#1e1e1e] border border-brand-border rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-brand-border">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
                        <p className="text-sm text-brand-muted mt-1">Select the best model for your task</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="px-6 py-4 border-b border-brand-border/50 bg-[#1e1e1e] space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search models..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#252525] border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:border-brand-accent outline-none transition-colors"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {providers.map(p => {
                            const logoPath = p === 'openai' ? '/logos/chatgpt.png' : `/logos/${p}.png`;
                            return (
                                <button
                                    key={p}
                                    onClick={() => setProviderFilter(p)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border flex items-center gap-2 ${providerFilter === p
                                        ? 'bg-brand-accent/20 border-brand-accent text-brand-accent'
                                        : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10 hover:text-gray-300'
                                        }`}
                                >
                                    <img src={logoPath} alt={p} className='w-4 h-4 object-contain' />
                                    {p}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Grid Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#1a1a1a]">
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
        </div>
    );
};
