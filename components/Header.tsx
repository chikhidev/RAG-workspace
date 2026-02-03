import React from 'react';
import { Menu, Settings, HelpCircle, PanelLeft } from 'lucide-react';

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
  onSettingsClick?: () => void;
  onHelpClick?: () => void;
  onToggleVault?: () => void;
  isVaultOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = 'Copper Mole',
  onMenuClick,
  onSettingsClick,
  onHelpClick,
  onToggleVault,
  isVaultOpen = true
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-brand-darker border-b border-brand-border/50 backdrop-blur-sm bg-opacity-95">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-brand-border/20 transition-colors text-gray-400 hover:text-gray-200"
              title="Toggle menu"
            >
              <Menu size={20} />
            </button>
          )}
          <img src="/COPPER_RAG_LOGO.png" alt="Copper" className="h-6 w-auto" />
          <h1 className="text-xl font-bold text-gray-100 truncate">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {!isVaultOpen && onToggleVault && (
            <button
              onClick={onToggleVault}
              className="p-2 rounded-lg hover:bg-brand-border/20 transition-colors text-gray-400 hover:text-brand-accent"
              title="Open Vault (Ctrl+Shift+V)"
            >
              <PanelLeft size={20} className="rotate-180" />
            </button>
          )}
          {onHelpClick && (
            <button
              onClick={onHelpClick}
              className="p-2 rounded-lg hover:bg-brand-border/20 transition-colors text-gray-400 hover:text-gray-200"
              title="Keyboard shortcuts (Ctrl+K)"
            >
              <HelpCircle size={20} />
            </button>
          )}
          {onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="p-2 rounded-lg hover:bg-brand-border/20 transition-colors text-gray-400 hover:text-gray-200"
              title="API Management (Ctrl+,)"
            >
              <Settings size={20} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
