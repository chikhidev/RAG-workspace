
import React, { useState } from 'react';
import { X, Type, Link as LinkIcon, Loader2, FileText } from 'lucide-react';
import { fileService } from '../services/fileService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string, content: string) => void;
    type?: 'text' | 'url';
}

export const InputModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, type = 'text' }) => {
    const [activeTab, setActiveTab] = useState<'text' | 'url'>(type);
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setError(null);
        if (!name.trim()) {
            setError('Please provide a name for this document.');
            return;
        }

        if (activeTab === 'text') {
            if (!content.trim()) {
                setError('Please paste some text content.');
                return;
            }
            onConfirm(name, content);
            handleClose();
        } else {
            // URL Mode
            if (!content.trim()) {
                setError('Please enter a valid URL.');
                return;
            }
            setIsLoading(true);
            try {
                const fetchedText = await fileService.fetchUrlContent(content);
                onConfirm(name, fetchedText);
                handleClose();
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleClose = () => {
        setName('');
        setContent('');
        setError(null);
        setIsLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-brand-darker w-full max-w-lg rounded-2xl border border-brand-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-brand-base/50 shrink-0">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-100">Add Knowledge Source</h3>
                    </div>
                    <button onClick={handleClose} className="p-1 hover:bg-brand-base rounded-lg transition-colors text-gray-400">
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-brand-border">
                    <button
                        onClick={() => setActiveTab('text')}
                        className={`flex-1 py-3 text-[13px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${activeTab === 'text'
                            ? 'bg-brand-base text-brand-accent border-b-2 border-brand-accent'
                            : 'text-brand-muted hover:text-gray-300 hover:bg-brand-base/50'
                            }`}
                    >
                        <Type size={14} />
                        Paste Text
                    </button>
                    <button
                        onClick={() => setActiveTab('url')}
                        className={`flex-1 py-3 text-[13px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${activeTab === 'url'
                            ? 'bg-brand-base text-brand-accent border-b-2 border-brand-accent'
                            : 'text-brand-muted hover:text-gray-300 hover:bg-brand-base/50'
                            }`}
                    >
                        <LinkIcon size={14} />
                        Import from URL
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono text-brand-muted uppercase tracking-widest block">
                            Document Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={activeTab === 'text' ? "e.g., My Notes" : "e.g., Wikipedia Article"}
                            className="w-full bg-[#252525] border border-brand-border rounded-xl p-3 text-[13px] text-gray-200 outline-none focus:border-brand-accent/50 transition-all font-medium"
                        />
                    </div>

                    <div className="space-y-2 flex-1 flex flex-col min-h-0">
                        <label className="text-[10px] font-mono text-brand-muted uppercase tracking-widest block">
                            {activeTab === 'text' ? 'Content' : 'URL Address'}
                        </label>
                        {activeTab === 'text' ? (
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Paste your text content here..."
                                className="w-full h-40 bg-[#252525] border border-brand-border rounded-xl p-3 text-[13px] font-mono text-gray-300 outline-none focus:border-brand-accent/50 transition-all resize-none"
                            />
                        ) : (
                            <input
                                type="url"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="https://example.com/article"
                                className="w-full bg-[#252525] border border-brand-border rounded-xl p-3 text-[13px] font-mono text-brand-accent outline-none focus:border-brand-accent/50 transition-all"
                            />
                        )}
                        {activeTab === 'url' && (
                            <p className="text-[11px] text-brand-muted italic flex items-start gap-1.5 mt-2">
                                <FileText size={12} className="shrink-0 mt-0.5" />
                                Note: Some websites may block access depending on their security settings (CORS). Text extraction works best on static pages.
                            </p>
                        )}
                    </div>

                    {error && (
                        <div className="text-red-400 text-[12px] bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 pt-2 shrink-0">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full py-3 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl text-[13px] font-bold tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Fetching...
                            </>
                        ) : (
                            activeTab === 'text' ? 'Save Document' : 'Import Content'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
