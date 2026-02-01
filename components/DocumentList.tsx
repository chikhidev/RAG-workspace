import React from 'react';
import { Document } from '../types';
import { FileText, Trash2, Upload, Box } from 'lucide-react';

interface Props {
  documents: Document[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
  isIndexing: boolean;
  onAddText: () => void;
  onAddLink: () => void;
  onCollapse?: () => void;
  activeFileNames?: string[];
}

export const DocumentList: React.FC<Props> = ({ documents, onUpload, onRemove, onToggle, isIndexing, onAddText, onAddLink, onCollapse, activeFileNames = [] }) => {
  const isAtLimit = documents.length >= 10;
  const [fadingFileNames, setFadingFileNames] = React.useState<string[]>([]);
  const [allGlowingFiles, setAllGlowingFiles] = React.useState<string[]>([]);

  // Handle active files and fade-out animation
  React.useEffect(() => {
    if (activeFileNames.length > 0) {
      console.log('Active files being accessed:', activeFileNames);
      setAllGlowingFiles(activeFileNames);
      setFadingFileNames([]);
    } else if (allGlowingFiles.length > 0) {
      // Start fade-out
      setFadingFileNames(allGlowingFiles);
      const timer = setTimeout(() => {
        setFadingFileNames([]);
        setAllGlowingFiles([]);
      }, 300); // Match CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [activeFileNames]);

  return (
    <div className="flex flex-col h-full bg-brand-darker p-6 w-full transition-colors overflow-hidden">
      <div className="flex items-center justify-between mb-2 overflow-hidden shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Collapse Vault"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-right-close"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M15 3v18" /><path d="m8 9 3 3-3 3" /></svg>
            </button>
          )}
          <h2 className="text-[20px] font-serif italic text-gray-100 tracking-tight truncate">
            Knowledge Vault
          </h2>
          
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddText}
            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-accent hover:bg-brand-border transition-colors group"
            title="Paste Text"
          >
            <FileText size={16} />
          </button>
          <button
            onClick={onAddLink}
            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-accent hover:bg-brand-border transition-colors group"
            title="Add from URL"
          >
            <Box size={16} className="hidden" /> {/* Placeholder import if needed */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
          </button>
          <label className={`p-1.5 rounded-lg transition-colors shrink-0 ${isAtLimit
            ? 'text-brand-muted cursor-not-allowed'
            : 'cursor-pointer text-gray-400 hover:text-brand-accent hover:bg-brand-border'
            }`} title="Upload PDF/DOCX/TXT">
            <Upload size={16} />
            {!isAtLimit && <input type="file" multiple accept=".txt,.md,.pdf,.docx" onChange={onUpload} className="hidden" />}
          </label>
        </div>
      </div>

      <div className="mb-8 flex justify-between items-center shrink-0">
        <span className={`text-[9px] font-mono uppercase tracking-widest ${isAtLimit ? 'text-brand-accent font-bold' : 'text-brand-muted'}`}>
          {documents.length} / 10 Files
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {documents.length === 0 ? (
          <div className="text-brand-muted text-center py-20 italic text-[11px] px-6 leading-relaxed border border-dashed border-brand-border rounded-xl">
            Drop context files to begin indexing.
          </div>
        ) : (
          documents.map((doc) => {
            const isActive = activeFileNames.includes(doc.name);
            const isFading = fadingFileNames.includes(doc.name);
            const shouldGlow = isActive || isFading;
            return (
            <div
              key={doc.id}
              className={`group flex items-center justify-between p-3 rounded-lg border transition-all relative z-[1] ${
                shouldGlow ? (isFading ? 'ai-glow-box ai-glow-box-fading' : 'ai-glow-box') : ''
              } ${doc.enabled
                ? 'bg-brand-base border-brand-border/50'
                : 'bg-transparent border-transparent opacity-60'
                }`}
            >
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                <button
                  onClick={() => onToggle(doc.id)}
                  className={`shrink-0 w-7 h-4 rounded-full relative transition-colors  ${doc.enabled ? 'bg-brand-accent' : 'bg-brand-border'
                    }`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${doc.enabled ? 'left-3.5' : 'left-0.5'
                    }`} />
                </button>

                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText size={14} className="text-gray-500 shrink-0" />
                  <span className="text-[12px] font-medium truncate text-gray-300">
                    {doc.name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onRemove(doc.id)}
                className="text-gray-600 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
          );
          })
        )}
      </div>

      {isIndexing && (
        <div className="mt-6 p-4 border border-brand-border rounded-xl shrink-0">
          <div className="text-[9px] text-brand-muted font-bold uppercase tracking-widest mb-2 flex justify-between">
            <span>Syncing</span>
            <span className="animate-pulse">Active</span>
          </div>
          <div className="h-[2px] bg-brand-border rounded-full overflow-hidden">
            <div className="h-full bg-brand-accent w-1/3 animate-[shimmer_1.5s_infinite_linear]"></div>
          </div>
        </div>
      )}

      {/* <a 
        href="https://buymeacoffee.com/chikhidevA" 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-4 flex items-center gap-3 py-3 px-4 hover:bg-white/5 text-gray-300 hover:text-white rounded-xl transition-all group shrink-0 border border-transparent hover:border-white/10"
      >
        <img 
          src="https://play-lh.googleusercontent.com/aMb_Qiolzkq8OxtQZ3Af2j8Zsp-ZZcNetR9O4xSjxH94gMA5c5gpRVbpg-3f_0L7vlo=w240-h480-rw" 
          alt="Buy Me A Coffee" 
          className="w-6 h-6 rounded-full group-hover:scale-110 transition-transform"
        />
        <span className="text-[12px] font-bold tracking-wide">Buy me a coffee</span>
      </a> */}
    </div>
  );
};