import React from 'react';
import { Menu, Settings } from 'lucide-react';

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
  onSettingsClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = 'RAG Workspace',
  onMenuClick,
  onSettingsClick
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-brand-darker border-b border-brand-border/50 backdrop-blur-sm bg-opacity-95">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-brand-border/20 transition-colors text-gray-400 hover:text-gray-200"
              title="Toggle menu"
            >
              <Menu size={20} />
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-100 truncate">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="p-2 rounded-lg hover:bg-brand-border/20 transition-colors text-gray-400 hover:text-gray-200"
              title="API Management"
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
