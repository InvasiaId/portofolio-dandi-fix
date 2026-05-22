import React, { Suspense, useEffect, useState, createContext, useContext } from 'react';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { Navbar } from '../components/layout/Navbar';
import { Hero } from '../components/sections/Hero';
import { About } from '../components/sections/About';
import { Portfolio } from '../components/sections/Portfolio';
import { Certificates } from '../components/sections/Certificates';
import { Contact } from '../components/sections/Contact';
import { Footer } from '../components/layout/Footer';

export const SettingsContext = createContext<any>(null);

export function useSettings() {
  return useContext(SettingsContext);
}

export function Home() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(setSettings).catch(console.error);
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      <div className="bg-cyber-darker text-gray-300 min-h-screen">
        <LoadingScreen />
        
        <Navbar />
        
        <main>
          <Suspense fallback={<div className="h-screen flex items-center justify-center font-mono text-cyber-green text-sm flex-col"><div className="w-8 h-8 border-2 border-cyber-green border-t-transparent rounded-full animate-spin mb-4"></div>LOADING_3D_ENVIRONMENT...</div>}>
            <Hero />
          </Suspense>
          
          <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
            <About />
          </Suspense>
          
          <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
            <Portfolio />
          </Suspense>
          
          <Certificates />
          <Contact />
        </main>

        <Footer />
      </div>
    </SettingsContext.Provider>
  );
}
