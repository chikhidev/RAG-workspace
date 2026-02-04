import React from 'react';
import { X, Keyboard, MessageSquare, Navigation, Settings, Trash2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-[1000] flex flex-col bg-brand-darker animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-brand-border bg-brand-base/50">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-100 tracking-tight">Keyboard Shortcuts</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-brand-border/50 rounded-full transition-colors text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-12 space-y-12">
          {SHORTCUT_SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-3 mb-6">
                <div className="text-brand-accent">{section.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-100">{section.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{section.description}</p>
                </div>
              </div>
              <div className="space-y-3 ml-8 border-l-2 border-brand-border/30 pl-6">
                {section.shortcuts.map((shortcut, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between py-3 px-4 bg-brand-base/40 hover:bg-brand-base/60 rounded-lg border border-brand-border/30 hover:border-brand-border/60 transition-all group"
                  >
                    <span className="text-sm text-gray-300 group-hover:text-gray-100 transition-colors font-medium">
                      {shortcut.description}
                    </span>
                    <div className="flex gap-1.5">
                      {getKeyDisplay(shortcut)
                        .split(' + ')
                        .map((part, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <span className="text-brand-muted mx-0.5">+</span>}
                            <kbd className="px-3 py-1.5 bg-brand-darker hover:bg-brand-border border border-brand-border rounded text-xs font-mono text-gray-200 whitespace-nowrap transition-colors shadow-sm">
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

          {/* Drag & Drop Info */}
          <div className="mt-12 pt-8 border-t border-brand-border/50">
            <div className="bg-brand-accent/10 border border-brand-accent/30 rounded-lg p-6">
              <h4 className="text-sm font-bold text-brand-accent mb-2">Pro Tip</h4>
              <p className="text-sm text-gray-300">
                You can drag and drop files from your computer anywhere in the app to upload them instantly. No need to navigate to the documents panel!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;
