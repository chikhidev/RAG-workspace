import React, { useState } from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  category: 'Chat' | 'Navigation' | 'General' | 'Documents';
}

const SHORTCUTS: Shortcut[] = [
  // Chat
  { key: 'Enter', description: 'Send message', category: 'Chat' },
  { key: 'Escape', description: 'Stop processing', category: 'Chat' },
  
  // Navigation
  { key: 'ArrowUp', alt: true, description: 'Previous message in history', category: 'Navigation' },
  { key: 'ArrowDown', alt: true, description: 'Next message in history', category: 'Navigation' },
  
  // General
  { key: 'K', ctrl: true, description: 'Show keyboard shortcuts', category: 'General' },
  { key: 'L', ctrl: true, shift: true, description: 'Clear conversation', category: 'General' },
  { key: 'V', ctrl: true, shift: true, description: 'Toggle knowledge vault', category: 'General' },
  { key: 'H', ctrl: true, shift: true, description: 'Toggle context history', category: 'General' },
  { key: ',', ctrl: true, description: 'Open API settings', category: 'General' },
  
  // Documents
  { key: 'Z', ctrl: true, description: 'Undo last document deletion', category: 'Documents' },
];

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const categories = Array.from(new Set(SHORTCUTS.map(s => s.category)));

  const getKeyDisplay = (shortcut: Shortcut): string => {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    parts.push(shortcut.key);
    return parts.join(' + ');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-brand-darker border border-brand-border rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-brand-darker border-b border-brand-border/50 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Keyboard size={24} className="text-brand-accent" />
            <h2 className="text-2xl font-bold text-gray-100">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-brand-border/30 rounded-lg transition-colors text-gray-400 hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-sm font-bold text-brand-accent uppercase tracking-widest mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {SHORTCUTS.filter(s => s.category === category).map((shortcut, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-brand-base/40 border border-brand-border/30 rounded-lg hover:border-brand-border/60 transition-all">
                    <span className="text-sm text-gray-300">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {getKeyDisplay(shortcut)
                        .split(' + ')
                        .map((part, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <span className="text-brand-muted mx-1">+</span>}
                            <kbd className="px-2.5 py-1 bg-brand-border/50 border border-brand-border rounded text-xs font-mono text-gray-200 whitespace-nowrap">
                              {part}
                            </kbd>
                          </React.Fragment>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-brand-darker border-t border-brand-border/50 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;
