
import React, { useState } from 'react';
import { X, Search, Check, Smartphone, Cpu, Zap, CreditCard, ArrowUpDown, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import { SUPPORTED_MODELS } from '../services/modelService';
import { ModelDefinition } from '../types';

interface ModelSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentModelId: string;
    onSelect: (modelId: string) => void;
    title: string;
}

type SortBy = 'name' | 'context' | 'latency' | 'price';
type SortDirection = 'asc' | 'desc';

export const ModelSelectorModal: React.FC<ModelSelectorModalProps> = ({
    isOpen, onClose, currentModelId, onSelect, title
}) => {
    const [search, setSearch] = useState('');
    const [providerFilter, setProviderFilter] = useState<'all' | string>('all');
    const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');
    const [sortBy, setSortBy] = useState<SortBy>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [showProviderDropdown, setShowProviderDropdown] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    if (!isOpen) return null;

    // Get unique categories from all models
    const allCategories = ['all', ...new Set(SUPPORTED_MODELS.flatMap(m => m.categories || []))];

    // Filter models based on search term, provider, and category
    let filteredModels = SUPPORTED_MODELS.filter(m => {
        const matchesProvider = providerFilter === 'all' || m.provider.toLowerCase() === providerFilter.toLowerCase();
        const matchesCategory = categoryFilter === 'all' || (m.categories && m.categories.includes(categoryFilter as any));
        const matchesSearch =
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.provider.toLowerCase().includes(search.toLowerCase()) ||
            m.description.toLowerCase().includes(search.toLowerCase());

        return matchesProvider && matchesCategory && matchesSearch;
    });

    // Sort models
    const parseContext = (ctx: string): number => {
        const match = ctx.match(/(\d+)/);
        if (!match) return 0;
        const value = parseInt(match[1]);
        if (ctx.includes('M')) return value * 1000000;
        if (ctx.includes('K')) return value * 1000;
        return value;
    };

    const parseLatency = (latency: string): number => {
        const match = latency.match(/(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]) : 999;
    };

    const parsePrice = (price: string): number => {
        const match = price.match(/(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]) : 999;
    };

    filteredModels.sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
            case 'context':
                comparison = parseContext(b.metadata.context) - parseContext(a.metadata.context);
                break;
            case 'latency':
                comparison = parseLatency(a.metadata.latency) - parseLatency(b.metadata.latency);
                break;
            case 'price': {
                const priceA = parsePrice(a.metadata.inputPrice) + parsePrice(a.metadata.outputPrice);
                const priceB = parsePrice(b.metadata.inputPrice) + parsePrice(b.metadata.outputPrice);
                comparison = priceA - priceB;
                break;
            }
            case 'name':
            default:
                comparison = a.name.localeCompare(b.name);
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
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
                    <div className="space-y-4">
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

                        {/* Filters & Sort in one line */}
                        <div className="flex gap-4 items-end flex-wrap">
                            {/* Provider Dropdown */}
                            <div className="relative flex-1 min-w-[150px]">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Provider</label>
                                <button
                                    onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                                    className="w-full bg-[#1a1a1a] border border-brand-border rounded-lg px-4 py-2 text-[12px] font-bold text-gray-300 flex items-center justify-between hover:border-brand-accent/50 transition-colors"
                                >
                                    <span className="capitalize">{providerFilter === 'all' ? 'All Providers' : providerFilter}</span>
                                    <ChevronDown size={14} className={`transition-transform ${showProviderDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {showProviderDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-brand-border rounded-lg shadow-lg z-10">
                                        {providers.map(p => (
                                            <button
                                                key={p}
                                                onClick={() => { setProviderFilter(p); setShowProviderDropdown(false); }}
                                                className={`w-full text-left px-4 py-2.5 text-[12px] font-medium flex items-center gap-2 hover:bg-brand-accent/20 transition-colors border-b border-brand-border/50 last:border-0 ${
                                                    providerFilter === p ? 'bg-brand-accent/10 text-brand-accent' : 'text-gray-300'
                                                }`}
                                            >
                                                {p !== 'all' && <img src={p === 'openai' ? '/logos/chatgpt.png' : `/logos/${p}.png`} alt={p} className='w-3 h-3 object-contain rounded' />}
                                                <span className="capitalize">{p === 'all' ? 'All Providers' : p}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Category Dropdown */}
                            <div className="relative flex-1 min-w-[150px]">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Category</label>
                                <button
                                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                    className="w-full bg-[#1a1a1a] border border-brand-border rounded-lg px-4 py-2 text-[12px] font-bold text-gray-300 flex items-center justify-between hover:border-brand-accent/50 transition-colors"
                                >
                                    <span className="capitalize">{categoryFilter === 'all' ? 'All Categories' : categoryFilter}</span>
                                    <ChevronDown size={14} className={`transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {showCategoryDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-brand-border rounded-lg shadow-lg z-10">
                                        {allCategories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => { setCategoryFilter(cat); setShowCategoryDropdown(false); }}
                                                className={`w-full text-left px-4 py-2.5 text-[12px] font-medium hover:bg-brand-accent/20 transition-colors border-b border-brand-border/50 last:border-0 ${
                                                    categoryFilter === cat ? 'bg-brand-accent/10 text-brand-accent' : 'text-gray-300'
                                                }`}
                                            >
                                                <span className="capitalize">{cat === 'all' ? 'All Categories' : cat}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Sort Dropdown with Direction */}
                            <div className="relative flex-1 min-w-[150px]">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Sort By</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                                        className="flex-1 bg-[#1a1a1a] border border-brand-border rounded-lg px-4 py-2 text-[12px] font-bold text-gray-300 flex items-center justify-between hover:border-brand-accent/50 transition-colors"
                                    >
                                        <span className="capitalize">{sortBy}</span>
                                        <ChevronDown size={14} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    <button
                                        onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                                        className="bg-[#1a1a1a] border border-brand-border rounded-lg px-3 py-2 text-gray-300 hover:border-brand-accent/50 transition-colors flex items-center justify-center"
                                        title={sortDirection === 'asc' ? 'Click for descending' : 'Click for ascending'}
                                    >
                                        {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                    </button>
                                </div>
                                
                                {showSortDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-brand-border rounded-lg shadow-lg z-10">
                                        {(['name', 'context', 'latency', 'price'] as SortBy[]).map(sort => (
                                            <button
                                                key={sort}
                                                onClick={() => { setSortBy(sort); setShowSortDropdown(false); }}
                                                className={`w-full text-left px-4 py-2.5 text-[12px] font-medium hover:bg-brand-accent/20 transition-colors border-b border-brand-border/50 last:border-0 ${
                                                    sortBy === sort ? 'bg-brand-accent/10 text-brand-accent' : 'text-gray-300'
                                                }`}
                                            >
                                                <span className="capitalize">{sort}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Clear Filters Button */}
                            <button
                                onClick={() => { setProviderFilter('all'); setCategoryFilter('all'); setSortBy('name'); setSortDirection('asc'); }}
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-[12px] font-bold uppercase transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Grid Content */}
                <div className="bg-[#1a1a1a] border border-brand-border rounded-2xl p-6 max-w-6xl mx-auto mb-10">
                    {filteredModels.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-sm">No models found matching your filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredModels.map(model => (
                                <button
                                    key={model.id}
                                    onClick={() => { onSelect(model.id); onClose(); }}
                                    className={`flex flex-col text-left p-4 rounded-xl border transition-all hover:-translate-y-0.5 group ${currentModelId === model.id
                                        ? 'bg-brand-accent/10 border-brand-accent ring-1 ring-brand-accent'
                                        : 'bg-[#252525] border-brand-border hover:border-brand-accent/50 hover:shadow-lg'
                                        }`}
                                >

                                    {/* Header: Logo & Name */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-white rounded-lg p-1 shrink-0">
                                            <img src={model.logo} alt={model.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-200 leading-tight group-hover:text-white transition-colors">
                                                {model.name}
                                            </h3>
                                            <span className="text-[10px] text-brand-muted uppercase tracking-wider">{model.provider}</span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-[11px] text-gray-400 mb-3 line-clamp-2 h-8 leading-relaxed">
                                        {model.description}
                                    </p>

                                    {/* Tags: Free & Category Badges - Bottom */}
                                    <div className="flex gap-2 mb-3 flex-wrap">
                                        {model.isFree && (
                                            <span className="px-2 py-1 bg-brand-base text-[9px] font-bold uppercase rounded border border-brand-border">
                                                Free
                                            </span>
                                        )}
                                        {model.categories && model.categories.map(cat => (
                                            <span key={cat} className="px-2 py-1 bg-brand-base text-[9px] font-bold uppercase rounded border border-brand-border">
                                                {cat}
                                            </span>
                                        ))}
                                    </div>

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
                    )}
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
