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
    <div className="fixed inset-0 z-[1000] flex flex-col animate-in fade-in duration-200 bg-light-base text-gray-900 dark:bg-brand-darker dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-light-border bg-light-base/90 dark:border-brand-border dark:bg-brand-base/50">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Keyboard Shortcuts</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full transition-colors hover:bg-light-darker text-gray-600 hover:text-gray-900 dark:hover:bg-brand-border/50 dark:text-gray-400 dark:hover:text-white"
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
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{section.title}</h3>
                  <p className="text-xs mt-1 text-gray-600 dark:text-gray-500">{section.description}</p>
                </div>
              </div>
              <div className="space-y-3 ml-8 border-l-2 pl-6 border-light-border/30 dark:border-brand-border/30">
                {section.shortcuts.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between py-3 px-4 rounded-lg transition-all group bg-white shadow-sm hover:bg-light-darker border border-light-border/30 hover:border-light-border/60 dark:bg-brand-base/40 dark:hover:bg-brand-base/60 dark:border-brand-border/30 dark:hover:border-brand-border/60`}
                  >
                    <span className="text-sm font-medium transition-colors text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-gray-100">{shortcut.description}</span>
                    <div className="flex gap-1.5">
                      {getKeyDisplay(shortcut)
                        .split(' + ')
                        .map((part, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <span className="text-brand-muted mx-0.5">+</span>}
                            <kbd className="px-3 py-1.5 rounded text-xs font-mono whitespace-nowrap transition-colors shadow-sm bg-light-darker hover:bg-light-border border border-light-border text-gray-800 dark:bg-brand-darker dark:hover:bg-brand-border dark:border-brand-border dark:text-gray-200">{part}</kbd>
                          </React.Fragment>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Drag & Drop Info */}
          <div className="mt-12 pt-8 border-t border-light-border/50 dark:border-brand-border/50">
            <div className="rounded-lg p-6 bg-light-accent/10 border border-light-accent/30 text-gray-700 dark:bg-brand-accent/10 dark:border-brand-accent/30 dark:text-gray-300">
              <h4 className="text-sm font-bold mb-2 text-light-accent dark:text-brand-accent">Pro Tip</h4>
              <p className="text-sm">
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
