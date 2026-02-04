import React from 'react';
import { Document, MindMap } from '../types';
import { FileText, Trash2, Upload, Box, Network } from 'lucide-react';
import { CustomToggle } from './CustomToggle';
import { getFileIcon } from './icons/FilesFormats';

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
  onOpenMindMap?: () => void;
  mindMaps?: MindMap[];
  onToggleMindMap?: (id: string) => void;
}

export const DocumentList: React.FC<Props> = ({ 
  documents, 
  onUpload, 
  onRemove, 
  onToggle, 
  isIndexing, 
  onAddText, 
  onAddLink, 
  onCollapse, 
  activeFileNames = [], 
  onOpenMindMap,
  mindMaps = [],
  onToggleMindMap
}) => {
  const isAtLimit = documents.length >= 20;
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
    <div className="flex flex-col h-full dark:bg-brand-darker light:bg-light-base p-6 w-full transition-colors overflow-hidden">
      <div className="flex items-center justify-between mb-2 overflow-hidden shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="p-1.5 rounded-lg dark:text-gray-400 light:text-gray-600 dark:hover:text-white light:hover:text-gray-900 dark:hover:bg-white/5 light:hover:bg-gray-200/10 transition-colors"
              title="Collapse Vault"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-right-close"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M15 3v18" /><path d="m8 9 3 3-3 3" /></svg>
            </button>
          )}
          
        </div>
        <div className="flex items-center gap-2">
          {onOpenMindMap && (
            <button
              onClick={onOpenMindMap}
              className="p-1.5 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-brand-border transition-colors group"
              title="Mind Map Editor"
            >
              <Network size={16} />
            </button>
          )}
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

      {/* Mind Maps Section */}
      {mindMaps.length > 0 && (
        <div className="my-4 space-y-2">
          <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest text-purple-400 mb-2">
            Mind Map
            <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded text-[7px] font-bold">BETA</span>
          </div>
          {mindMaps.map((map) => {
            const isActive = activeFileNames.includes(map.name);
            const isFading = fadingFileNames.includes(map.name);
            const shouldGlow = isActive || isFading;
            return (
            <div
              key={map.id}
              className={`group flex items-center justify-between p-3 rounded-lg border transition-all relative z-[1] ${
                shouldGlow ? (isFading ? 'ai-glow-box ai-glow-box-fading' : 'ai-glow-box') : ''
              } ${
                map.enabled
                  ? 'bg-purple-500/10 border-purple-500/30'
                  : 'bg-transparent border-transparent opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                <CustomToggle
                  checked={map.enabled}
                  onChange={() => onToggleMindMap?.(map.id)}
                  activeColor="#a855f7"
                  inactiveColor="#d3d3d6"
                />

                <div className="flex items-center gap-2 overflow-hidden">
                  <Network size={14} className="text-purple-400 shrink-0" />
                  <span className="text-[12px] font-medium truncate text-gray-300">
                    {map.name}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    ({Object.keys(map.nodes).length} nodes)
                  </span>
                </div>
              </div>
              <button
                onClick={() => onOpenMindMap?.()}
                className="text-gray-600 hover:text-purple-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0"
                title="Edit Mind Map"
              >
                <FileText size={13} />
              </button>
            </div>
            );
          })}
        </div>
      )}

      <div className="mb-4 flex justify-between items-center shrink-0">
        <span className={`text-[9px] font-mono uppercase tracking-widest ${isAtLimit ? 'text-brand-accent font-bold' : 'text-brand-muted'}`}>
          {documents.length} / 20 Files
        </span>
      </div>


      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {documents.length === 0 ? (
          <div className="dark:text-brand-muted light:text-light-muted text-center py-20 italic text-[11px] px-6 leading-relaxed border border-dashed dark:border-brand-border light:border-light-border rounded-xl">
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
                <CustomToggle
                  checked={doc.enabled}
                  onChange={() => onToggle(doc.id)}
                />

                <div className="flex items-center gap-2 overflow-hidden">
                  {getFileIcon(doc.name)}
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