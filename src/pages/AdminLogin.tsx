import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, User, Key, ChevronRight } from 'lucide-react';

export function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('adminToken', data.token);
        navigate('/admin');
      } else {
        alert('Invalid Admin ID or Access Key');
      }
    } catch (err) {
      alert('Login failed. Ensure server is running.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-darker text-gray-300 flex items-center justify-center font-sans relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,150,255,0.05),transparent_60%)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-cyber-blue/20" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-cyber-purple/20" />
      
      <div className="absolute -left-32 top-1/4 w-64 h-64 bg-cyber-blue/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -right-32 bottom-1/4 w-64 h-64 bg-cyber-purple/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 relative z-10"
      >
        <div className="mb-8 text-center relative">
          <div className="absolute left-1/2 -top-12 -translate-x-1/2 w-16 h-16 bg-black border border-cyber-blue/30 rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(10,226,255,0.2)]">
            <Lock className="text-cyber-blue" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-widest mt-8">NEXUS<span className="text-cyber-blue">CMS</span></h1>
          <p className="font-mono text-xs text-gray-500 mt-2 tracking-widest uppercase">Restricted Access Area</p>
        </div>

        <div className="bg-[#121212] border border-cyber-blue/30 p-8 relative">
          {/* Corner borders */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyber-blue" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyber-blue" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-cyber-blue" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-cyber-blue" />

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-mono text-cyber-blue mb-2 uppercase">Admin ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 pl-10 pr-4 py-3 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none focus:ring-1 focus:ring-cyber-blue/50 transition-all"
                  placeholder="Enter administrator ID"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-cyber-blue mb-2 uppercase">Access Key</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key size={16} className="text-gray-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 pl-10 pr-4 py-3 text-white font-mono text-sm focus:border-cyber-blue focus:outline-none focus:ring-1 focus:ring-cyber-blue/50 transition-all font-sans tracking-widest"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full relative group bg-cyber-blue text-black font-bold font-mono text-sm py-3 px-4 flex items-center justify-center gap-2 overflow-hidden hover:bg-white transition-colors"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  INITIALIZE_SESSION
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="font-mono text-[10px] text-gray-500">
            SYSTEM V2.0.4 // UNAUTHORIZED ACCESS IS STRICTLY PROHIBITED
          </p>
        </div>
      </motion.div>
    </div>
  );
}
