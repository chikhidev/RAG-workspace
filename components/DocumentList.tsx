import React from 'react';
import { Document } from '../types';
import { FileText, Trash2, Upload, Box } from 'lucide-react';

interface Props {
  documents: Document[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (id: string) => void;
  isIndexing: boolean;
}

export const DocumentList: React.FC<Props> = ({ documents, onUpload, onRemove, isIndexing }) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-brand-darker border-r border-gray-100 dark:border-brand-border p-6 w-72 transition-colors shrink-0">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <Box size={18} className="text-gray-900 dark:text-gray-100" />
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-500">
            Resource Vault
          </h2>
        </div>
        <label className="cursor-pointer text-gray-400 hover:text-brand-accent transition-colors p-1.5 hover:bg-gray-100 dark:hover:bg-brand-border rounded-lg">
          <Upload size={16} />
          <input type="file" multiple accept=".txt" onChange={onUpload} className="hidden" />
        </label>
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
              className="group flex items-center justify-between p-3 bg-transparent hover:bg-gray-50 dark:hover:bg-brand-border rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-white/5 transition-all"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
                <span className="text-[13px] font-medium truncate text-gray-700 dark:text-gray-300">
                  {doc.name}
                </span>
              </div>
              <button 
                onClick={() => onRemove(doc.id)}
                className="text-gray-300 dark:text-gray-600 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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