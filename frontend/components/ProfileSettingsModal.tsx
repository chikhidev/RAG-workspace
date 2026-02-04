import React, { useState, useRef, useEffect } from 'react';
import { User, X, Camera, Save, Loader2, AlertCircle, Edit2 } from 'lucide-react';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    email: string;
    username?: string;
    avatar_path?: string;
  } | undefined;
  authToken: string | null;
  onUpdate: () => void; // Trigger to refresh user data in App
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen, onClose, user, authToken, onUpdate
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [avatarBlobUrl, setAvatarBlobUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email);
      
      // Load avatar if exists
      if (user.avatar_path && authToken) {
        fetch(`/api${user.avatar_path}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
        .then(res => res.ok ? res.blob() : null)
        .then(blob => {
          if (blob) setAvatarBlobUrl(URL.createObjectURL(blob));
        })
        .catch(console.error);
      } else {
        setAvatarBlobUrl(null);
      }
    }
  }, [user, authToken, isOpen]);

  // Clean up blob URL
  useEffect(() => {
    return () => {
      if (avatarBlobUrl) URL.revokeObjectURL(avatarBlobUrl);
    };
  }, [avatarBlobUrl]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ username })
      });

      if (!res.ok) throw new Error('Failed to update profile');
      
      onUpdate();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && authToken) {
      const file = e.target.files[0];
      
      // Basic client-side validation
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      
      const formData = new FormData();
      formData.append('file', file);
      setIsSubmitting(true);

      try {
        const res = await fetch('/api/users/me/avatar', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${authToken}` },
          body: formData
        });

        if (!res.ok) {
            const data = await res.json(); 
            throw new Error(data.detail || 'Upload failed');
        }
        
        onUpdate();
        // Refresh avatar preview immediately (optional, or wait for effect)
        const newUrl = URL.createObjectURL(file);
        setAvatarBlobUrl(newUrl);
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-brand-darker animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-brand-border bg-brand-base/50 shrink-0">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-100 tracking-tight">Account Profile</h2>
          <p className="text-xs text-brand-muted mt-0.5">Update your profile picture, username, and account details</p>
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
        <div className="max-w-5xl mx-auto px-8 py-12 space-y-8">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Cards Grid - Side by side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Avatar Card */}
            <div className="bg-[#1a1a1a] border border-brand-border rounded-2xl p-8">
            <div className="flex flex-col items-center">
              <div className="relative group shrink-0">
                <div className="w-32 h-32 rounded-full border-4 border-brand-border overflow-hidden bg-brand-base ring-2 ring-brand-accent/10">
                  {avatarBlobUrl ? (
                    <img src={avatarBlobUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-muted bg-gradient-to-br from-brand-base to-brand-darker">
                      <User size={48} />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-all cursor-pointer"
                >
                  <div className="flex flex-col items-center gap-1">
                    <Camera className="text-white drop-shadow-lg" size={24} />
                    <span className="text-white text-xs font-bold drop-shadow-lg">Change</span>
                  </div>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif, image/webp"
                  onChange={handleAvatarUpload}
                />
              </div>

              <div className="mt-6 text-center space-y-3 w-full">
                <div>
                  <p className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-1">Profile Picture</p>
                  <p className="text-sm text-gray-300">Click on your avatar to upload a new picture (Max 5MB)</p>
                </div>
                <div className="pt-2 border-t border-brand-border/50">
                  <p className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-1">Supported Formats</p>
                  <p className="text-xs text-gray-400">JPG, PNG, GIF, WebP</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details Card */}
          <div className="bg-[#1a1a1a] border border-brand-border rounded-2xl p-8">
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Username</label>
                <div className="relative">
                  <Edit2 className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter a display name"
                    className="w-full bg-brand-darker border border-brand-border rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 outline-none transition-all placeholder:text-gray-600"
                  />
                </div>
                <p className="text-xs text-brand-muted mt-2">This is how others will see you in the community</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-brand-base/50 border border-brand-border/50 rounded-lg px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-brand-muted mt-2">Your email cannot be changed at this time</p>
              </div>

              <div className="pt-4 border-t border-brand-border/50">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-brand-border bg-brand-base/80 backdrop-blur-md px-8 py-6 shrink-0 z-50 sticky bottom-0">
        <div className="max-w-5xl mx-auto flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-brand-base hover:bg-brand-border text-gray-300 rounded-lg text-sm font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsModal;
