import React, { useState } from 'react';
import { Network } from 'lucide-react';

interface AuthPageProps {
  onLogin: (token: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // You would replace this with your actual backend URL
  const BACKEND_URL = 'http://localhost:8000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
        setError('Registration successful! Please login.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f12] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
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
                    <img src="/COPPER_RAG_LOGO.png" alt="Copper" className="h-24 w-auto" />
                </div>

        <form className="mt-8 space-y-6 bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-xl" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
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
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-brand-accent hover:bg-brand-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                isLogin ? 'Sign in' : 'Create account'
            )}
          </button>
          
          <div className="text-center">
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
