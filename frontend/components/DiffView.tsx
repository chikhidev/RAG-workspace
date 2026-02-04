import React, { useState } from 'react';

interface EditProposal {
  filename: string;
  doc_id: string;
  find: string;
  replace: string;
  original_content: string;
  new_content: string;
  diff: string;
  changes_count: number;
  iteration: number;
}

interface DiffViewProps {
  proposal: EditProposal;
  onApprove: (proposal: EditProposal) => void;
  onReject: (proposal: EditProposal) => void;
  isProcessing?: boolean;
}

export const DiffView: React.FC<DiffViewProps> = ({
  proposal,
  onApprove,
  onReject,
  isProcessing = false
}) => {
  const [viewMode, setViewMode] = useState<'diff' | 'side-by-side'>('diff');
  const [decided, setDecided] = useState<'approved' | 'rejected' | null>(null);

  const handleApprove = () => {
    setDecided('approved');
    onApprove(proposal);
  };

  const handleReject = () => {
    setDecided('rejected');
    onReject(proposal);
  };

  // Parse unified diff into colored lines
  const renderDiff = () => {
    const lines = proposal.diff.split('\n');
    return (
      <div className="font-mono text-sm overflow-x-auto">
        {lines.map((line, index) => {
          let bgColor = '';
          let textColor = '';
          
          if (line.startsWith('+++') || line.startsWith('---')) {
            bgColor = 'bg-brand-border/30';
            textColor = 'text-gray-400';
          } else if (line.startsWith('+')) {
            bgColor = 'bg-green-900/30';
            textColor = 'text-green-400';
          } else if (line.startsWith('-')) {
            bgColor = 'bg-red-900/30';
            textColor = 'text-red-400';
          } else if (line.startsWith('@@')) {
            bgColor = 'bg-blue-900/20';
            textColor = 'text-blue-400';
          } else {
            textColor = 'text-gray-300';
          }

          return (
            <div
              key={index}
              className={`px-3 py-0.5 ${bgColor} ${textColor} whitespace-pre`}
            >
              {line || ' '}
            </div>
          );
        })}
      </div>
    );
  };

  // Side by side view
  const renderSideBySide = () => {
    const originalLines = proposal.original_content.split('\n');
    const newLines = proposal.new_content.split('\n');
    const maxLines = Math.max(originalLines.length, newLines.length);

    return (
      <div className="grid grid-cols-2 gap-2 font-mono text-sm">
        <div className="border border-red-900/30 rounded-lg overflow-hidden">
          <div className="bg-red-900/20 px-3 py-1 text-red-400 text-xs font-semibold border-b border-red-900/30">
            Original
          </div>
          <div className="max-h-64 overflow-y-auto">
            {originalLines.map((line, index) => (
              <div key={index} className="px-3 py-0.5 text-gray-300 hover:bg-brand-border/20">
                <span className="text-gray-500 mr-3 select-none">{index + 1}</span>
                {line}
              </div>
            ))}
          </div>
        </div>
        <div className="border border-green-900/30 rounded-lg overflow-hidden">
          <div className="bg-green-900/20 px-3 py-1 text-green-400 text-xs font-semibold border-b border-green-900/30">
            Modified
          </div>
          <div className="max-h-64 overflow-y-auto">
            {newLines.map((line, index) => (
              <div key={index} className="px-3 py-0.5 text-gray-300 hover:bg-brand-border/20">
                <span className="text-gray-500 mr-3 select-none">{index + 1}</span>
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (decided) {
    return (
      <div className={`rounded-lg p-4 ${decided === 'approved' ? 'bg-green-900/20 border border-green-700' : 'bg-red-900/20 border border-red-700'}`}>
        <div className="flex items-center gap-2">
          {decided === 'approved' ? (
            <>
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400 font-medium">Edit approved and saved to {proposal.filename}</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-red-400 font-medium">Edit rejected - no changes made</span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-darker border border-brand-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-brand-base/50 px-4 py-3 border-b border-brand-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <div>
              <span className="text-white font-medium">Proposed Edit: </span>
              <span className="text-brand-accent">{proposal.filename}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 bg-brand-border/50 px-2 py-1 rounded">
              {proposal.changes_count} change{proposal.changes_count !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        {/* What's being replaced */}
        <div className="mt-2 text-sm">
          <span className="text-gray-400">Replace: </span>
          <code className="bg-red-900/30 text-red-300 px-1.5 py-0.5 rounded text-xs">{proposal.find}</code>
          <span className="text-gray-400 mx-2">→</span>
          <code className="bg-green-900/30 text-green-300 px-1.5 py-0.5 rounded text-xs">{proposal.replace}</code>
        </div>
      </div>

      {/* View mode toggle */}
      <div className="px-4 py-2 border-b border-brand-border bg-brand-base/30">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setViewMode('diff')}
            className={`px-3 py-1 text-xs font-medium rounded-l-md border ${
              viewMode === 'diff'
                ? 'bg-brand-accent text-white border-brand-accent'
                : 'bg-brand-darker text-gray-400 border-brand-border hover:bg-brand-border/50'
            }`}
          >
            Unified Diff
          </button>
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-3 py-1 text-xs font-medium rounded-r-md border-t border-r border-b ${
              viewMode === 'side-by-side'
                ? 'bg-brand-accent text-white border-brand-accent'
                : 'bg-brand-darker text-gray-400 border-brand-border hover:bg-brand-border/50'
            }`}
          >
            Side by Side
          </button>
        </div>
      </div>

      {/* Diff content */}
      <div className="max-h-80 overflow-y-auto bg-brand-darker/50">
        {viewMode === 'diff' ? renderDiff() : renderSideBySide()}
      </div>

      {/* Action buttons */}
      <div className="px-4 py-3 border-t border-brand-border bg-brand-base/30 flex items-center justify-end gap-3">
        <button
          onClick={handleReject}
          disabled={isProcessing}
          className="px-4 py-2 text-sm font-medium text-gray-300 bg-brand-darker border border-brand-border rounded-lg hover:bg-brand-border/50 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Reject
        </button>
        <button
          onClick={handleApprove}
          disabled={isProcessing}
          className="px-4 py-2 text-sm font-medium text-white bg-brand-accent rounded-lg hover:bg-brand-accent/80 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Approve & Save
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DiffView;
