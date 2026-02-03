import React, { useState } from 'react';
import { X, Command, Keyboard, MessageSquare, Navigation, Settings, Trash2 } from 'lucide-react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
}

interface ShortcutSection {
  title: string;
  description: string;
  icon: React.ReactNode;
  shortcuts: Shortcut[];
}

const SHORTCUT_SECTIONS: ShortcutSection[] = [
  {
    title: 'Chat',
    description: 'Quick actions for message interactions',
    icon: <MessageSquare size={20} />,
    shortcuts: [
      { key: 'Enter', description: 'Send message' },
      { key: 'Escape', description: 'Stop processing' },
    ]
  },
  {
    title: 'Navigation',
    description: 'Navigate through message history',
    icon: <Navigation size={20} />,
    shortcuts: [
      { key: 'ArrowUp', alt: true, description: 'Previous message in history' },
      { key: 'ArrowDown', alt: true, description: 'Next message in history' },
    ]
  },
  {
    title: 'General',
    description: 'App-wide controls and settings',
    icon: <Settings size={20} />,
    shortcuts: [
      { key: 'K', ctrl: true, description: 'Show keyboard shortcuts' },
      { key: 'L', ctrl: true, shift: true, description: 'Clear conversation' },
      { key: 'V', ctrl: true, shift: true, description: 'Toggle knowledge vault' },
      { key: 'H', ctrl: true, shift: true, description: 'Toggle context history' },
      { key: ',', ctrl: true, description: 'Open API settings' },
    ]
  },
  {
    title: 'Documents',
    description: 'Manage your uploaded documents',
    icon: <Trash2 size={20} />,
    shortcuts: [
      { key: 'Z', ctrl: true, description: 'Undo last document deletion' },
    ]
  },
];

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

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
      <div className="bg-brand-darker border border-brand-border rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-brand-darker border-b border-brand-border/50 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
        <div className="p-6 space-y-8">
          {SHORTCUT_SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-brand-accent">{section.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-100">{section.title}</h3>
                  <p className="text-xs text-gray-500">{section.description}</p>
                </div>
              </div>
              <div className="space-y-2 ml-8 border-l-2 border-brand-border/30 pl-6">
                {section.shortcuts.map((shortcut, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 px-3 hover:bg-brand-base/40 rounded transition-colors group">
                    <span className="text-sm text-gray-300 group-hover:text-gray-100 transition-colors">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {getKeyDisplay(shortcut)
                        .split(' + ')
                        .map((part, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <span className="text-brand-muted mx-0.5">+</span>}
                            <kbd className="px-2.5 py-1 bg-brand-border/50 hover:bg-brand-border border border-brand-border rounded text-xs font-mono text-gray-200 whitespace-nowrap transition-colors">
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
        <div className="sticky bottom-0 bg-brand-darker border-t border-brand-border/50 p-4 flex justify-end gap-3">
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
