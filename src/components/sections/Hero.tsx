import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HeroCanvas } from '../canvas/HeroCanvas';
import { ArrowDown, Terminal } from 'lucide-react';
import { TerminalWindow } from '../ui/TerminalWindow';
import { useSettings } from '../../pages/Home';

export function Hero() {
  const settings = useSettings();
  const heroData = settings?.heroData || {};
  const [text, setText] = useState('');
  const fullText = heroData.typeText2 || '> Loading Portfolio_AI_Engineer/Designer_';
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [codeText, setCodeText] = useState("");
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setText(fullText.substring(0, i));
      i++;
      if (i > fullText.length) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, [fullText]);

  useEffect(() => {
    if (terminalOpen) {
      let rawCode = `
> INITIALIZING CYBER_PROTOCOL...
> BYPASSING SECURITY_MAINFRAME...
[+] CONNECTION ESTABLISHED.

function hackMind() {
  const neuralNet = new QuantumNetwork();
  neuralNet.inject(payload);
  while(true) {
    console.log("Expanding limits...");
  }
}
> DATA_STREAM_INCOMING: ${Math.random().toFixed(4)}
> READY...
`;
      let i = 0;
      const interval = setInterval(() => {
          setCodeText(rawCode.substring(0, i));
          i += 3;
          if(i > rawCode.length) clearInterval(interval);
      }, 10);
      return () => clearInterval(interval);
    } else {
      setCodeText("");
    }
  }, [terminalOpen]);

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <HeroCanvas onBallClick={() => setTerminalOpen(true)} />
      
      <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid md:grid-cols-2 gap-8 items-center pointer-events-none">
        
        {/* Pointer events auto enabled only on interactive elements to not block canvas */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="py-8 md:py-12 pointer-events-auto"
        >
          <div className="font-mono text-sm text-cyber-green mb-6 h-12">
            <div className="opacity-70">{heroData.typeText1 || '> System Initialized...'}</div>
            <div className="flex items-center">
              <span>{text}</span>
              <motion.span 
                animate={{ opacity: [1, 0] }} 
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-2 h-4 bg-cyber-green ml-1"
              />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {heroData.heading ? (
              // Splitting to highlight intelligence if present
              heroData.heading.includes('Intelligence') ? (
                <>
                  {heroData.heading.split('Intelligence')[0]}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-cyber-purple text-glow-blue border-b border-cyber-blue/30 pb-1">
                    Intelligence
                  </span>
                  {heroData.heading.split('Intelligence')[1]}
                </>
              ) : (
                heroData.heading
              )
            ) : (
              <>
                Architecting <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-cyber-purple text-glow-blue border-b border-cyber-blue/30 pb-1">
                  Intelligence
                </span> & <br/>
                Digital Experiences.
              </>
            )}
          </h1>
          
          <p className="text-gray-400 text-lg mb-10 max-w-md">
            {heroData.description || 'Fusing code, design, and machine learning to build future-ready solutions. Welcome to my neural workspace.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href={heroData.exploreLink || '#portfolio'}
              className="inline-flex items-center justify-center gap-2 bg-cyber-blue/10 border border-cyber-blue hover:bg-cyber-blue hover:text-black text-cyber-blue px-6 py-3 font-mono text-sm transition-all duration-300 group"
            >
              {heroData.exploreText || 'EXPLORE MY WORK'}
              <ArrowDown size={16} className="group-hover:translate-y-1 transition-transform" />
            </a>
            <a 
              href={heroData.cvFile || '#'} 
              download={heroData.cvFile ? true : undefined}
              className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/50 bg-black/50 px-6 py-3 font-mono text-sm transition-all duration-300 group"
            >
              <Terminal size={16} className="text-cyber-green group-hover:animate-pulse" />
              {heroData.cvText || 'DOWNLOAD_CV.exe'}
            </a>
          </div>
        </motion.div>
        
        {/* Right side area for terminal */}
        <div className="relative h-[400px] pointer-events-none hidden md:flex items-center justify-end">
           <AnimatePresence>
            {terminalOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                className="w-[350px] z-50 pointer-events-auto"
              >
                <TerminalWindow title="HACK_SHELL" className="bg-black/90 h-[300px]" onClose={() => setTerminalOpen(false)}>
                     <div className="whitespace-pre-wrap font-mono text-[10px] text-cyber-green pt-2 leading-relaxed">
                        {codeText}
                        <span className="animate-pulse">_</span>
                     </div>
                     <div className="mt-6 flex justify-end">
                       <button 
                         className="border border-cyber-green/50 px-3 py-1 text-[10px] hover:bg-cyber-green hover:text-black transition-colors uppercase font-bold"
                         onClick={() => setTerminalOpen(false)}
                       >
                          [CLOSE_CONNECTION]
                       </button>
                     </div>
                </TerminalWindow>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </section>
  );
}
