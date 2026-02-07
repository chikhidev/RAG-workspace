import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Lock,
  MessageSquare,
  Search,
  Brain,
  Moon,
  Sun,
  ChevronRight,
  Layers,
  Eye
} from 'lucide-react';
import { ChatDemo } from '../components/ChatDemo';
import { User } from '../types';

export default function LandingPage() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [user, setUser] = useState<User | null>(null);
  
  // Demo section scroll logic
  const demoSectionRef = useRef<HTMLDivElement>(null);
  const [demoScale, setDemoScale] = useState(0.95);
  const [startDemo, setStartDemo] = useState(false);

  // Trigger start when visible using IntersectionObserver
  useEffect(() => {
    const el = demoSectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartDemo(true);
          observer.disconnect(); // Only need to trigger once
        }
      },
      { threshold: 0.15 } // Start when 15% visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Handle scaling effect
  useEffect(() => {
    const handleScroll = () => {
      if (!demoSectionRef.current) return;
      
      const rect = demoSectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate scale based on center alignment
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;
      const distanceFromCenter = Math.abs(elementCenter - viewportCenter);
      
      // Define the "active zone" (e.g. within 600px of center)
      const maxDistance = viewportHeight / 1.5;
      
      if (distanceFromCenter < maxDistance) {
        const factor = 1 - (distanceFromCenter / maxDistance);
        // Scale range: 0.95 to 1.05
        const scale = 0.95 + (0.1 * factor);
        setDemoScale(Math.min(1.05, Math.max(0.95, scale)));
      } else {
        setDemoScale(0.95);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle OAuth token in URL params (fallback if callback lands here)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      localStorage.setItem('auth_token', token);
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate('/app');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      const authToken = localStorage.getItem('auth_token');
      if (authToken) {
        try {
          const res = await fetch('/api/users/me', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else if (res.status === 401) {
            // Token expired, clear it
            localStorage.removeItem('auth_token');
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
          setUser(null);
        }
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const features = [
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Multi-Format Support",
      description: "PDFs, Word docs, text files. Copper extracts and indexes everything automatically."
    },
    {
      icon: <Layers className="w-5 h-5" />,
      title: "Choose Your Model",
      description: "Use your own API keys. Switch between OpenRouter, Google Gemini, xAI Grok, Mistral, and OpenAI."
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: "Privacy First",
      description: "Your API keys are encrypted at rest. All processing happens securely with your own credentials."
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: "Smart Search",
      description: "Semantic search, grep patterns, and line-by-line reading with intelligent strategy selection."
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: "Real-Time Streaming",
      description: "See the AI think in real-time as it searches, reasons, and generates answers."
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Context Memory",
      description: "Maintains conversation context across queries. Builds on previous discussions."
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-brand-base text-white' : 'bg-light-base text-gray-900'
    }`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-lg transition-colors ${
        darkMode ? 'bg-brand-base/90 border-b border-brand-border' : 'bg-light-base/90 border-b border-light-border'
      }`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center space-x-3 group">
            <img src="/logo.png" alt="Copper" className="w-8 h-8 transition-transform group-hover:scale-105" />
            <span className="text-xl font-bold">Copper</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-brand-border' : 'hover:bg-light-darker'
              }`}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => navigate('/app')}
              className={`px-5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                darkMode 
                  ? 'bg-brand-accent hover:bg-brand-accent/90 text-white'
                  : 'bg-light-accent hover:bg-light-accent/90 text-white'
              }`}
            >
              {user && user.avatar_path ? (
                <img 
                  src={user.avatar_path} 
                  alt={user.email} 
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : null}
              <span>Launch App</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`pt-32 pb-24 px-6 grid-bg relative overflow-hidden`}>

        <div className="absolute inset-0 -top-60 opacity-70 flex items-center justify-center z-0 pointer-events-none translate-y-12">
              {/* Rocks background */}
              <img 
                src="/brand-rocks.png" 
                alt="Copper Brand Rocks" 
                className="w-full max-w-4xl mx-auto"
              />
        </div>

        <div className="max-w-6xl mx-auto flex flex-col items-center relative z-10">
          <div className="flex flex-col items-center text-center space-y-6 max-w-2xl">
            <div className="space-y-6 w-full">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-mono border ${
                darkMode ? 'border-brand-border text-brand-muted' : 'border-light-border text-light-muted'
              }`}>
                Free Forever
              </div>
              
              <h1 className="text-5xl md:text-6xl leading-tight font-bold">
                AI-Powered Research Over Your Documents
              </h1>
              
              <p className={`text-lg leading-relaxed ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Use your own API keys to make research easier than ever before. Upload documents, choose your preferred LLM, 
                and watch as an intelligent agent searches, analyzes, and synthesizes comprehensive answers in real-time.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
                <button
                  onClick={() => navigate('/app')}
                  className={`group px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
                    darkMode 
                      ? 'bg-brand-accent hover:bg-brand-accent/90 text-white'
                      : 'bg-light-accent hover:bg-light-accent/90 text-white'
                  }`}
                >
                  <span>Get Started</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className={`px-6 py-3 rounded-lg font-medium transition-all border ${
                    darkMode 
                      ? 'border-brand-border hover:bg-brand-border/50' 
                      : 'border-light-border hover:bg-light-darker'
                  }`}
                >
                  Learn More
                </button>
              </div>
            </div>
            
            
          </div>
        </div>
      </section>

      {/* Preview Section - Interactive Demo */}
      <section 
        className={`py-16 px-6 border-t ${
          darkMode ? 'bg-brand-darker border-brand-border' : 'bg-light-darker border-light-border'
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl mb-2">See It In Action</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Watch how Copper's agent thinks and researches
            </p>
          </div>
          
          <div 
            ref={demoSectionRef}
            style={{ 
              transform: `scale(${demoScale})`,
              opacity: Math.max(0.5, (demoScale - 0.95) * 10 + 0.5), // Fade in as it scales up
              transition: 'transform 0.1s ease-out, opacity 0.2s ease-out'
            }}
            className={`rounded-xl overflow-hidden border shadow-2xl ${
              darkMode ? 'border-brand-border bg-brand-base' : 'border-light-border bg-white'
            }`}
          >
            <ChatDemo start={startDemo} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl">
              Features
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Everything you need for intelligent document research
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg transition-all border ${
                  darkMode 
                    ? 'bg-brand-darker border-brand-border hover:border-brand-accent/50' 
                    : 'bg-white border-light-border hover:border-light-accent/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                  darkMode 
                    ? 'bg-brand-accent/10 text-brand-accent' 
                    : 'bg-light-accent/10 text-light-accent'
                }`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                <p className={`text-sm leading-relaxed ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Models Section */}
      <section className={`py-20 px-6 border-t ${
        darkMode ? 'bg-brand-darker border-brand-border' : 'bg-light-darker border-light-border'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl">
              World-Class Models
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Choose from the best open and commercial models for your research
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                name: "Gemini 3 Pro",
                provider: "Google",
                desc: "Multimodal reasoning & long context",
                logo: "/logos/gemini.png"
              },
              {
                name: "Llama 3.2",
                provider: "Meta",
                desc: "Optimized instruction tuning",
                logo: "/logos/meta.png"
              },
              {
                name: "DeepSeek R1",
                provider: "DeepSeek",
                desc: "High-performance reasoning",
                logo: "/logos/deepseek.png"
              },
              {
                name: "Qwen3",
                provider: "Qwen",
                desc: "Ultra-fast state of the art",
                logo: "/logos/qwen.png"
              },
              {
                name: "Nemotron",
                provider: "NVIDIA",
                desc: "Enterprise-grade reliability",
                logo: "/logos/nvidia.png"
              }
            ].map((model, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-xl text-center transition-all hover:-translate-y-1 ${
                  darkMode 
                    ? 'bg-brand-base border border-brand-border hover:border-brand-accent/50' 
                    : 'bg-white border border-light-border hover:border-light-accent/50'
                }`}
              >
                <div className="h-12 flex items-center justify-center mb-3">
                  <img src={model.logo} alt={model.provider} className="h-8 w-auto object-contain opacity-90" />
                </div>
                <h3 className="font-semibold mb-1">{model.name}</h3>
                <p className={`text-xs uppercase tracking-wider font-mono mb-2 ${
                  darkMode ? 'text-brand-muted' : 'text-light-muted'
                }`}>
                  {model.provider}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {model.desc}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <p className={`text-sm ${darkMode ? 'text-brand-muted' : 'text-light-muted'}`}>
              + Many more models available via OpenRouter integration
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 px-6 border-t ${
        darkMode ? 'border-brand-border' : 'border-light-border'
      }`}>
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-5xl">
            Ready to Get Started?
          </h2>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Use your own API keys and choose your preferred model. Join researchers, students, and professionals 
            using Copper to unlock insights from their documents.
          </p>
          <button
            onClick={() => navigate('/app')}
            className={`group px-8 py-4 rounded-lg font-medium text-lg transition-all inline-flex items-center space-x-2 ${
              darkMode 
                ? 'bg-brand-accent hover:bg-brand-accent/90 text-white'
                : 'bg-light-accent hover:bg-light-accent/90 text-white'
            }`}
          >
            <span>Start Using Copper</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-6 border-t ${
        darkMode ? 'bg-brand-darker border-brand-border' : 'bg-light-darker border-light-border'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img src="/logo.png" alt="Copper" className="w-8 h-8" />
                <span className="text-xl font-medium">Copper</span>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                AI-powered research assistant for your documents
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Product</h4>
              <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>
                  <button onClick={() => navigate('/app')} className="hover:text-brand-accent transition-colors">
                    Launch App
                  </button>
                </li>
                <li>
                  <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-brand-accent transition-colors">
                    Features
                  </button>
                </li>
              </ul>
            </div>
            
          </div>
          
          <div className={`pt-8 border-t text-center text-sm ${
            darkMode ? 'border-brand-border text-gray-400' : 'border-light-border text-gray-600'
          }`}>
            <p>&copy; 2026 Copper. Built for researchers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
