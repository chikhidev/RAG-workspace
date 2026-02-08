import React, { useRef, useState, useEffect } from 'react';
import { Menu, Settings, HelpCircle, PanelLeft, User as UserIcon, LogOut, Upload, MessageCircle } from 'lucide-react';
import { useResponsive } from '../hooks/useResponsive';

interface HeaderProps {
  title?: string;
  conversationTitle?: string | null;
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
  onConversationsClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = 'Copper Mole',
  conversationTitle,
  onMenuClick,
  onSettingsClick,
  onHelpClick,
  onToggleVault,
  isVaultOpen = true,
  user,
  authToken,
  onLogout,
  onAvatarUpload,
  onProfileClick,
  onConversationsClick
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [avatarBlobUrl, setAvatarBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user?.avatar_path && authToken) {
      // Check if avatar_path is an external URL (e.g., from Google OAuth)
      if (user.avatar_path.startsWith('http://') || user.avatar_path.startsWith('https://')) {
        // Use external URL directly
        setAvatarBlobUrl(user.avatar_path);
      } else {
        // Fetch avatar from backend with auth headers (local uploads)
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
          if (avatarBlobUrl && !avatarBlobUrl.startsWith('http')) {
            URL.revokeObjectURL(avatarBlobUrl);
          }
        };
      }
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

  const responsive = useResponsive();

  return (
    <header className="sticky top-0 z-40 w-full bg-light-base dark:bg-brand-darker border-b border-light-border/50 dark:border-brand-border/50 backdrop-blur-sm bg-opacity-95">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-200/20 dark:hover:bg-brand-border/20 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 flex-shrink-0"
              title="Toggle menu"
            >
              <Menu size={responsive.isMobile ? 18 : 20} />
            </button>
          )}
          <img src="/logo.png" alt="Copper" className={`w-auto flex-shrink-0 ${responsive.isMobile ? 'h-9' : 'h-6'}`} />
          <h1 className={`font-bold text-gray-900 dark:text-gray-100 truncate ${responsive.isMobile ? 'text-base' : 'text-xl'}`}>
            {title} <span className={`text-gray-600 dark:text-gray-400 ml-1 md:ml-2 ${responsive.isMobile ? 'hidden' : 'inline text-sm'}`}>workspace</span>
          </h1>
          {conversationTitle && !responsive.isMobile && (
            <>
              <span className="text-gray-400 dark:text-gray-600 mx-2">/</span>
              <span className="text-gray-600 dark:text-gray-400 text-sm truncate max-w-[200px] lg:max-w-xs" title={conversationTitle}>
                {conversationTitle}
              </span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-1 md:gap-2">
          {/* Conversations Button */}
          {onConversationsClick && (
            <button
              onClick={onConversationsClick}
              className="p-2 rounded-lg hover:bg-gray-200/20 dark:hover:bg-brand-border/20 transition-colors text-gray-600 dark:text-gray-400 hover:text-brand-accent flex-shrink-0"
              title="Conversations"
            >
              <MessageCircle size={20} className="mx-auto text-gray-600" />

            </button>
          )}
          
          {!isVaultOpen && onToggleVault && (
            <button
              onClick={onToggleVault}
              className="p-2 rounded-lg hover:bg-gray-200/20 dark:hover:bg-brand-border/20 transition-colors text-gray-600 dark:text-gray-400 hover:text-brand-accent flex-shrink-0"
              title="Open Vault (Ctrl+Shift+V)"
            >
              <PanelLeft size={responsive.isMobile ? 18 : 20} className="rotate-180" />
            </button>
          )}
          
          {user && (
            <div className="flex items-center gap-2 md:gap-3">
              {/* Display Username - Hidden on small mobile */}
              {!responsive.isSmallMobile && (
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-200">{user.username || user.email.split('@')[0]}</p>
                </div>
              )}

              <div className="relative">
                <button
                  onClick={handleAvatarClick}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-light-border dark:border-brand-border overflow-hidden hover:border-brand-accent transition-colors focus:outline-none flex-shrink-0"
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
                    <div className="w-full h-full bg-light-darker dark:bg-brand-base flex items-center justify-center text-gray-600 dark:text-gray-400">
                      <UserIcon size={18} />
                    </div>
                  )}
                </button>

                {showUserMenu && (
                  <div className={`absolute right-0 mt-2 bg-light-base dark:bg-brand-darker border border-light-border dark:border-brand-border rounded-xl shadow-xl py-2 z-50 ${responsive.isMobile ? 'w-48' : 'w-56'}`}>
                    <div className="px-4 py-3 border-b border-light-border/50 dark:border-brand-border/50">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.username || "No Username"}</p>
                      <p className="text-xs text-light-muted dark:text-brand-muted truncate">{user.email}</p>
                    </div>
                    
                    <div className="py-1">
                      <button
                        onClick={() => {
                          if (onProfileClick) onProfileClick();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-light-darker dark:hover:bg-brand-base hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
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
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-light-darker dark:hover:bg-brand-base hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
                        >
                          <Settings size={14} />
                          API Keys
                        </button>
                      )}
                    </div>
                    
                    <div className="border-t border-light-border/50 dark:border-brand-border/50 mt-1 pt-1">
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 flex items-center gap-2"
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
              className="p-2 rounded-lg hover:bg-gray-200/20 dark:hover:bg-brand-border/20 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 flex-shrink-0"
              title="Keyboard shortcuts (Ctrl+K)"
            >
              <HelpCircle size={responsive.isMobile ? 18 : 20} />
            </button>
          )}
          {/** Settings available in user menu now */}
        </div>
      </div>
    </header>
  );
};

export default Header;