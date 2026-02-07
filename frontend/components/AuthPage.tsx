import React, { useState, useEffect } from 'react';
import { Network } from 'lucide-react';

interface AuthPageProps {
  onLogin: (token: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // You would replace this with your actual backend URL
  const BACKEND_URL = '/api';

  // Check for OAuth callback token in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const oauthError = urlParams.get('error');
    
    if (token) {
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      onLogin(token);
    } else if (oauthError) {
      setError('Google authentication failed. Please try again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [onLogin]);

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${BACKEND_URL}/auth/google/login`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/token' : '/register';
      const body = isLogin
        ? new URLSearchParams({ username: email, password: password })
        : JSON.stringify({ email, password });

      const headers: any = {};
      if (!isLogin) headers['Content-Type'] = 'application/json';

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: isLogin ? { 'Content-Type': 'application/x-www-form-urlencoded' } : { 'Content-Type': 'application/json' },
        body: body
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Authentication failed');
      }

      if (isLogin) {
        const data = await response.json();
        onLogin(data.access_token);
      } else {
        // Just registered, now login
        setIsLogin(true);
        setSuccessMessage('Registration successful! Please login with your new account.');
        // Clear password for safety, keep email
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-base text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img
          src="/brand-rocks.png"
          alt=""
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f12] via-[#0f0f12]/80 to-transparent" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex-1 flex flex-col items-center justify-center relative z-20 gap-12">
          {/* Copper Logo */}
          <img src="/logo.png" alt="Copper" className="h-24 w-auto" />
        </div>

        <form className="mt-8 space-y-6 bg-brand-base/5 p-8 rounded-2xl border border-white/10 backdrop-blur-xl" onSubmit={handleSubmit}>
          {error && (
            <div className="py-3 text-red-400 text-sm bg-red-500/10 px-4 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="py-3 text-green-400 text-sm bg-green-500/10 px-4 rounded-lg border border-green-500/20">
              {successMessage}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-transparent transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-transparent transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-brand-accent hover:bg-brand-accent-dark focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-brand-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              isLogin ? 'Sign in' : 'Create account'
            )}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-brand-base text-gray-400">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-white/10 rounded-lg text-sm font-medium text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-white/20 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign {isLogin ? 'in' : 'up'} with Google
          </button>

          <div className="text-center mt-4">
            <button
              type="button"
              className="text-sm text-brand-accent/80 hover:text-brand-accent transition-colors"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
