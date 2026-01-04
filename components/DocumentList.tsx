import React from 'react';
import { Document } from '../types';
import { FileText, Trash2, Upload, Box } from 'lucide-react';

interface Props {
  documents: Document[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
  isIndexing: boolean;
}

export const DocumentList: React.FC<Props> = ({ documents, onUpload, onRemove, onToggle, isIndexing }) => {
  const isAtLimit = documents.length >= 10;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-brand-darker border-r border-gray-100 dark:border-brand-border p-6 w-72 transition-colors shrink-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Box size={18} className="text-gray-900 dark:text-gray-100" />
          <h2 className="text-[20px] font-serif italic text-gray-900 dark:text-gray-100 tracking-tight">
            Knowledge Vault
          </h2>
        </div>
        <label className={`p-1.5 rounded-lg transition-colors ${
          isAtLimit 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'cursor-pointer text-gray-400 hover:text-brand-accent hover:bg-gray-100 dark:hover:bg-brand-border'
        }`}>
          <Upload size={16} />
          {!isAtLimit && <input type="file" multiple accept=".txt" onChange={onUpload} className="hidden" />}
        </label>
      </div>
      
      <div className="mb-8 flex justify-between items-center">
        <span className={`text-[9px] font-mono uppercase tracking-widest ${isAtLimit ? 'text-brand-accent font-bold' : 'text-gray-400'}`}>
          {documents.length} / 10 Files
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {documents.length === 0 ? (
          <div className="text-gray-400 dark:text-gray-600 text-center py-20 italic text-[11px] px-6 leading-relaxed border border-dashed border-gray-200 dark:border-brand-border rounded-xl">
            Drop context files to begin indexing.
          </div>
        ) : (
          documents.map((doc) => (
            <div 
              key={doc.id} 
              className={`group flex items-center justify-between p-3 rounded-lg border transition-all ${
                doc.enabled 
                  ? 'bg-gray-50 dark:bg-brand-base border-gray-200 dark:border-brand-border/50' 
                  : 'bg-transparent border-transparent opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                {/* Switch Toggle for Files */}
                <button 
                  onClick={() => onToggle(doc.id)}
                  className={`shrink-0 w-7 h-4 rounded-full relative transition-colors ${
                    doc.enabled ? 'bg-brand-accent' : 'bg-gray-200 dark:bg-brand-border'
                  }`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
                    doc.enabled ? 'left-3.5' : 'left-0.5'
                  }`} />
                </button>
                
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
                  <span className="text-[12px] font-medium truncate text-gray-700 dark:text-gray-300">
                    {doc.name}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => onRemove(doc.id)}
                className="text-gray-300 dark:text-gray-600 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>

      {isIndexing && (
        <div className="mt-6 p-4 border border-gray-100 dark:border-brand-border rounded-xl">
          <div className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-2 flex justify-between">
            <span>Syncing</span>
            <span className="animate-pulse">Active</span>
          </div>
          <div className="h-[2px] bg-gray-100 dark:bg-brand-border rounded-full overflow-hidden">
            <div className="h-full bg-brand-accent w-1/3 animate-[shimmer_1.5s_infinite_linear]"></div>
          </div>
        </div>
      )}
    </div>
  );
};