import React from 'react';
import { Document } from '../types';
import { FileText, Trash2, Upload, Database } from 'lucide-react';

interface Props {
  documents: Document[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (id: string) => void;
  isIndexing: boolean;
}

export const DocumentList: React.FC<Props> = ({ documents, onUpload, onRemove, isIndexing }) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-brand-base border-r border-gray-100 dark:border-brand-border p-6 w-80 transition-colors shrink-0">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 dark:bg-brand-accent/10 rounded-lg">
            <Database size={18} className="text-purple-600 dark:text-brand-accent" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Vault
          </h2>
        </div>
        <label className="cursor-pointer text-gray-400 hover:text-purple-600 dark:hover:text-brand-accent transition-colors p-2 hover:bg-purple-50 dark:hover:bg-brand-accent/5 rounded-full">
          <Upload size={18} />
          <input type="file" multiple accept=".txt" onChange={onUpload} className="hidden" />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {documents.length === 0 ? (
          <div className="text-gray-400 dark:text-gray-600 text-center py-20 italic text-xs px-6 leading-relaxed">
            Upload text files to activate the knowledge brain.
          </div>
        ) : (
          documents.map((doc) => (
            <div 
              key={doc.id} 
              className="group flex items-center justify-between p-3.5 bg-gray-50/50 dark:bg-brand-darker rounded-xl border border-gray-100 dark:border-brand-border hover:border-purple-200 dark:hover:border-brand-accent/50 hover:bg-white dark:hover:bg-brand-base hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText size={16} className="text-purple-300 dark:text-brand-accent shrink-0" />
                <span className="text-[13px] font-medium truncate text-gray-700 dark:text-gray-300">
                  {doc.name}
                </span>
              </div>
              <button 
                onClick={() => onRemove(doc.id)}
                className="text-gray-300 dark:text-gray-600 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {isIndexing && (
        <div className="mt-6 p-4 bg-purple-50 dark:bg-brand-accent/10 rounded-2xl border border-purple-100 dark:border-brand-border">
          <div className="text-[10px] text-purple-600 dark:text-brand-accent font-bold uppercase tracking-widest mb-2">Syncing Vectors...</div>
          <div className="h-1 bg-purple-100 dark:bg-brand-border rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 dark:bg-brand-accent w-1/3 animate-[shimmer_1.5s_infinite_linear]"></div>
          </div>
        </div>
      )}
    </div>
  );
};