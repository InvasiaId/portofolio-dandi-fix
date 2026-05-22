import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AboutCanvas } from '../canvas/AboutCanvas';
import { TerminalWindow } from '../ui/TerminalWindow';
import { Fingerprint } from 'lucide-react';
import { useSettings } from '../../pages/Home';

export function About() {
  const settings = useSettings();
  const aboutData = settings?.aboutData || {};
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const identified = leftOpen || rightOpen;
  const [leftCode, setLeftCode] = useState("");
  const [rightCode, setRightCode] = useState("");

  const rawLeft = `> RETRIEVING PROFILE DATA...
> PARSING SKILLS...

============ ${aboutData.skillsTitle || 'KEAHLIAN TEKNIS'} ============
${(aboutData.skillsList || 'Front-End Development\n(React, Vue, Three.js)\nBack-End (Node.js, Go)\nDesain UI/UX (Figma)\nData Science\nCloud Architecture').split(',').map((s: string) => `| ${s.trim()}`).join('\n')}
=========================================

> SYS_STATS:
> ${aboutData.sysStats || 'SUBS:     4/10     [████░░░░░░]\n> CPU LOAD: 89.00%   [████████░░]\n> RAM USAGE: 64.20%  [██████░░░░]'}

> READY.`;

  const rawRight = `[${aboutData.scanCompleteText || 'BIOMETRIC SCAN COMPLETE'}]
${aboutData.scanDetails || '> USER_ID:   JOHNDOE\n> ACCESS:    ADMINISTRATOR\n> LOCATION:  SECTOR 4\n> CLEARANCE: LEVEL_9\n\n[SYSTEM LOGS]\n> Initializing neural pathways......[OK]\n> Connecting to mainframe...........[OK]\n> Bypassing firewall................[OK]\n> Downloading creative assets.......[OK]\n> Syncing consciousness.............[OK]\n\n> HACKER_MODE: ENGAGED'}`;

  useEffect(() => {
    if (leftOpen) {
      let i = 0;
      const interval = setInterval(() => {
          setLeftCode(rawLeft.substring(0, i));
          i += 1;
          if (i > rawLeft.length) clearInterval(interval);
      }, 15);
      return () => clearInterval(interval);
    } else {
      setLeftCode("");
    }
  }, [leftOpen, rawLeft]);

  useEffect(() => {
    if (rightOpen) {
      let j = 0;
      const timeout = setTimeout(() => {
        const interval = setInterval(() => {
            setRightCode(rawRight.substring(0, j));
            j += 1;
            if (j > rawRight.length) clearInterval(interval);
        }, 15);
        return () => clearInterval(interval);
      }, 200);
      return () => clearTimeout(timeout);
    } else {
      setRightCode("");
    }
  }, [rightOpen, rawRight]);

  return (
    <section id="about" className="relative min-h-screen py-20 flex flex-col justify-center overflow-hidden">
      {/* Background stars/particles CSS approach for simplicity */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-screen pointer-events-none"></div>
      
      <div className="absolute inset-0 z-0">
         <AboutCanvas />
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10 flex flex-col items-center justify-between h-full min-h-[80vh]">
        
        <div className="w-full flex flex-col md:flex-row justify-between items-center md:items-stretch gap-8 mt-10 md:mt-20">
          
          {/* Left Terminal */}
          <div className="w-full md:w-1/3 h-[400px] pointer-events-none">
            <AnimatePresence>
              {leftOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -20 }}
                  className="h-full z-50 pointer-events-auto"
                >
                  <TerminalWindow title={aboutData.leftTerminalTitle || "PROFILE V1.0"} className="h-[400px] shadow-[0_0_20px_rgba(0,255,65,0.15)] bg-black/80" onClose={() => setLeftOpen(false)}>
                    <div className="whitespace-pre-wrap font-mono text-[10px] md:text-sm text-cyber-green pt-2 leading-relaxed">
                      {leftCode}
                      <span className="animate-pulse">_</span>
                    </div>
                  </TerminalWindow>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Center Space for 3D */}
          <div className="w-full md:w-1/3 flex items-end justify-center pb-10">
            {/* The canvas is positioned absolutely behind, this just provides structural space */}
          </div>

          {/* Right Terminal */}
          <div className="w-full md:w-1/3 h-[400px] pointer-events-none">
            <AnimatePresence>
              {rightOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 20 }}
                  className="h-full z-50 pointer-events-auto"
                >
                  <TerminalWindow title={aboutData.rightTerminalTitle || "TERMINAL V1.0"} className="h-[400px] shadow-[0_0_20px_rgba(0,255,65,0.15)] bg-black/80" onClose={() => setRightOpen(false)}>
                    <div className="whitespace-pre-wrap font-mono text-[10px] md:text-sm text-cyber-green pt-2 leading-relaxed tracking-wider">
                      {rightCode}
                      <span className="animate-pulse">_</span>
                    </div>
                  </TerminalWindow>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Identification Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setLeftOpen(true);
            setRightOpen(true);
          }}
          className={`mt-16 md:mt-24 mb-10 px-8 py-3 rounded-full font-bold tracking-widest transition-all duration-300 flex items-center gap-2 relative overflow-hidden group ${
            identified 
              ? 'bg-cyber-green text-black shadow-[0_0_20px_#00ff41]' 
              : 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue hover:bg-cyber-blue hover:text-black hover:shadow-[0_0_20px_#0ae2ff]'
          }`}
        >
          {identified && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
          <Fingerprint size={20} className={identified ? 'animate-pulse' : ''} />
          {identified ? (aboutData.fingerprintActiveText || 'ACCESS GRANTED') : (aboutData.fingerprintText || 'IDENTIFICATION')}
        </motion.button>

      </div>
    </section>
  );
}
