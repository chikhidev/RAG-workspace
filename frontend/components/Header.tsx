import React, { useRef, useState, useEffect } from 'react';
import { Menu, Settings, HelpCircle, PanelLeft, User as UserIcon, LogOut, Upload } from 'lucide-react';

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
  onSettingsClick?: () => void;
  onHelpClick?: () => void;
  onToggleVault?: () => void;
  isVaultOpen?: boolean;
  user?: {
    email: string;
    username?: string;
    avatar_path?: string;
  };
  authToken?: string | null;
  onLogout?: () => void;
  onAvatarUpload?: (file: File) => void;
  onProfileClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = 'Copper Mole',
  onMenuClick,
  onSettingsClick,
  onHelpClick,
  onToggleVault,
  isVaultOpen = true,
  user,
  authToken,
  onLogout,
  onAvatarUpload,
  onProfileClick
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [avatarBlobUrl, setAvatarBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user?.avatar_path && authToken) {
      // Fetch avatar with auth headers
      fetch(`/api${user.avatar_path}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      .then(res => {
        if (res.ok) return res.blob();
        throw new Error('Failed to load avatar');
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        setAvatarBlobUrl(url);
      })
      .catch(err => {
        console.error("Error loading avatar:", err);
        setAvatarBlobUrl(null);
      });

      return () => {
        if (avatarBlobUrl) URL.revokeObjectURL(avatarBlobUrl);
      };
    }
  }, [user?.avatar_path, authToken]);

  const handleAvatarClick = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onAvatarUpload) {
      onAvatarUpload(e.target.files[0]);
      setShowUserMenu(false);
    }
  };

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
          <img src="/logo.png" alt="Copper" className="h-6 w-auto" />
          <h1 className="text-xl font-bold text-gray-100 truncate">
            {title} <span className="text-sm text-gray-400 ml-2">workspace</span>
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
          
          {user && (
            <div className="flex items-center gap-3">
              {/* Display Username */}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-200">{user.username || user.email.split('@')[0]}</p>
              </div>

              <div className="relative">
                <button
                  onClick={handleAvatarClick}
                  className="w-10 h-10 rounded-full border-2 border-brand-border overflow-hidden hover:border-brand-accent transition-colors focus:outline-none"
                >
                  {user.avatar_path && avatarBlobUrl ? (
                    <img 
                      src={avatarBlobUrl} 
                      alt="User Avatar" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + user.email;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-brand-base flex items-center justify-center text-gray-400">
                      <UserIcon size={20} />
                    </div>
                  )}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-brand-darker border border-brand-border rounded-xl shadow-xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-brand-border/50">
                      <p className="text-sm font-bold text-white truncate">{user.username || "No Username"}</p>
                      <p className="text-xs text-brand-muted truncate">{user.email}</p>
                    </div>
                    
                    <div className="py-1">
                      <button
                        onClick={() => {
                          if (onProfileClick) onProfileClick();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-brand-base hover:text-white flex items-center gap-2"
                      >
                        <UserIcon size={14} />
                        Profile Settings
                      </button>

                      {onSettingsClick && (
                        <button
                          onClick={() => {
                            onSettingsClick();
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-brand-base hover:text-white flex items-center gap-2"
                        >
                          <Settings size={14} />
                          API Keys
                        </button>
                      )}
                    </div>
                    
                    <div className="border-t border-brand-border/50 mt-1 pt-1">
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Help Button ALWAYS visible */}
          {onHelpClick && (
            <button
              onClick={onHelpClick}
              className="p-2 rounded-lg hover:bg-brand-border/20 transition-colors text-gray-400 hover:text-gray-200"
              title="Keyboard shortcuts (Ctrl+K)"
            >
              <HelpCircle size={20} />
            </button>
          )}
          {/** Settings available in user menu now */}
        </div>
      </div>
    </header>
  );
};

export default Header;
