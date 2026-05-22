import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const certificates = [
  { id: 1, title: 'AWS Solutions Architect', issuer: 'Amazon Web Services', year: '2025', desc: 'Detailed knowledge of AWS architectural principles and services.' },
  { id: 2, title: 'Advanced React Patterns', issuer: 'Frontend Masters', year: '2024', desc: 'In-depth exploration of advanced React concepts, hooks, and performance optimization.' },
  { id: 3, title: 'Three.js Journey', issuer: 'Bruno Simon', year: '2024', desc: 'Comprehensive guide to building custom 3D WebGL experiences with Three.js.' },
];

const CHARS = '!<>-_\\/[]{}—=+*^?#01X';
const INTENSITY = 15;

function makeSlices(certificate: typeof certificates[0], glitchTitle: string, glitchIssuer: string) {
  const count = 8 + Math.floor(Math.random() * 7); // 8-15 slices
  const sliceH = 100 / count;
  return Array.from({ length: count }, (_, i) => {
    const topPct = i * sliceH;
    const bottomPct = 100 - topPct - sliceH;
    const tx = (Math.random() - 0.5) * INTENSITY * 8;
    const tint = Math.random() < 0.5
      ? (Math.random() < 0.5 ? 'rgba(0,255,255,0.1)' : 'rgba(255,0,255,0.1)')
      : 'transparent';
    return { topPct, bottomPct, tx, tint, i };
  });
}

function GlitchCard({ certificate, onClick }: any) {
  const certId = React.useMemo(
    () => Math.random().toString(36).substr(2, 9).toUpperCase(),
    [certificate.id]
  );

  const [state, setState] = React.useState({
    slices: [] as any[],
    warp: 'none',
    title: certificate.title,
    issuer: certificate.issuer,
  });

  React.useEffect(() => {
    let loopTimeout: number;
    let seqTimeout: number;
    let running = false;

    const glitchText = (s: string, chance: number) =>
      s.split('').map(c => Math.random() < chance ? CHARS[Math.floor(Math.random() * CHARS.length)] : c).join('');

    const doGlitch = () => {
      if (!running) return;
      const lvl = INTENSITY / 10;
      const warp = Math.random() < lvl
        ? `translate(${(Math.random() - 0.5) * INTENSITY * 2}px, ${(Math.random() - 0.5) * INTENSITY * 1}px) skewX(${(Math.random() - 0.5) * INTENSITY * 0.8}deg)`
        : 'none';

      setState({
        slices: makeSlices(certificate, '', ''),
        warp,
        title: glitchText(certificate.title, lvl * 0.45),
        issuer: glitchText(certificate.issuer, lvl * 0.35),
      });

      seqTimeout = window.setTimeout(doGlitch, 20 + Math.random() * 40);
    };

    const startRoutine = () => {
      running = true;
      doGlitch();
      window.setTimeout(() => {
        running = false;
        clearTimeout(seqTimeout);
        setState({ slices: [], warp: 'none', title: certificate.title, issuer: certificate.issuer });
      }, 150 + Math.random() * 150);
      loopTimeout = window.setTimeout(startRoutine, 1000 + Math.random() * 1000);
    };

    loopTimeout = window.setTimeout(startRoutine, 200 + Math.random() * 500);
    return () => { clearTimeout(loopTimeout); clearTimeout(seqTimeout); };
  }, [certificate]);

  const InnerContent = ({ title, issuer }: { title: string; issuer: string }) => (
    <div className="w-full h-full border border-cyber-blue/30 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-cyber-blue/5 to-transparent relative">
      <div className="absolute top-4 right-4 font-mono text-xs text-cyber-blue/50">{certificate.year}</div>
      <h3 className="text-2xl font-bold text-center text-white mb-2 tracking-widest uppercase">{title}</h3>
      <p className="font-mono text-cyber-blue text-sm">ISSUER: {issuer}</p>
      <div className="mt-8 border-t border-b border-cyber-blue/20 py-2 w-full text-center font-mono text-[10px] text-gray-500">
        ID: {certId} // VERIFIED
      </div>
    </div>
  );

  return (
    <div
      className="relative aspect-[4/3] bg-black/80 border border-cyber-blue/50 p-1 flex items-center justify-center overflow-hidden cursor-pointer"
      onClick={() => onClick(certificate)}
      style={{ transform: state.warp }}
    >
      {/* Scanline */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-20 pointer-events-none" />

      {/* Base card */}
      <div className="absolute inset-0 p-1">
        <InnerContent title={state.title} issuer={state.issuer} />
      </div>

      {/* Multi-slice distortion */}
      {state.slices.map((slice) => (
        <React.Fragment key={slice.i}>
          {/* Cyan ghost */}
          <div
            className="absolute inset-0 p-1 pointer-events-none z-10"
            style={{
              clipPath: `inset(${slice.topPct}% 0% ${slice.bottomPct}% 0%)`,
              transform: `translateX(${slice.tx * 0.8}px)`,
              mixBlendMode: 'screen',
              opacity: 0.6,
              background: 'rgba(0,255,255,0.04)',
              border: '1px solid rgba(0,255,255,0.3)',
            }}
          >
            <InnerContent title={state.title} issuer={state.issuer} />
          </div>
          {/* Magenta ghost */}
          <div
            className="absolute inset-0 p-1 pointer-events-none z-10"
            style={{
              clipPath: `inset(${slice.topPct}% 0% ${slice.bottomPct}% 0%)`,
              transform: `translateX(${-slice.tx * 0.6}px)`,
              mixBlendMode: 'screen',
              opacity: 0.5,
              background: slice.tint,
              border: '1px solid rgba(255,0,255,0.3)',
            }}
          >
            <InnerContent title={state.title} issuer={state.issuer} />
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export function Certificates() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCert, setSelectedCert] = useState<any | null>(null);
  const [certificates, setCertificates] = useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/certificates').then(res => res.json()).then(data => setCertificates(data || [])).catch(console.error);
  }, []);

  const next = () => {
    if (certificates.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % certificates.length);
  }
  const prev = () => {
    if (certificates.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + certificates.length) % certificates.length);
  }

  if (certificates.length === 0) {
    return null; // Or return a loading state / empty state
  }

  return (
    <section id="certificates" className="relative py-32 bg-cyber-dark overflow-hidden flex flex-col items-center justify-center">
      
      {/* Hologram Base & Beam */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-12 bg-cyber-blue/20 rounded-[100%] blur-xl"></div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 h-8 bg-cyber-blue/40 rounded-[100%] blur-md border border-cyber-blue"></div>
      <div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[300px] h-[500px] pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(10, 226, 255, 0.4) 0%, rgba(10, 226, 255, 0) 100%)',
          clipPath: 'polygon(20% 100%, 80% 100%, 100% 0, 0 0)',
          filter: 'blur(10px)'
        }}
      ></div>

      <div className="max-w-4xl w-full mx-auto px-6 relative z-10 flex items-center justify-between">
        
        <button onClick={prev} className="p-2 border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/20 transition-colors backdrop-blur-md">
          <ChevronLeft />
        </button>

        <div className="flex-1 max-w-[500px] mx-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 50, scale: 0.9, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -50, scale: 0.9, filter: 'blur(10px)' }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <GlitchCard 
                certificate={certificates[currentIndex]} 
                onClick={(cert: any) => setSelectedCert(cert)} 
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <button onClick={next} className="p-2 border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/20 transition-colors backdrop-blur-md">
          <ChevronRight />
        </button>
        
      </div>

      {/* Modal Popup */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedCert(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-cyber-darker border border-cyber-blue/50 p-8 shadow-2xl glass-panel"
            >
              <button 
                onClick={() => setSelectedCert(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
              
              <div className="mb-6 font-mono text-xs text-cyber-blue/50">
                CERTIFICATE_ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-2 tracking-widest uppercase">
                {selectedCert.title}
              </h2>
              
              <div className="font-mono text-cyber-green text-sm mb-6">
                ISSUED BY: {selectedCert.issuer} // {selectedCert.year}
              </div>
              
              <p className="text-gray-300 font-mono text-sm leading-relaxed">
                {selectedCert.description || selectedCert.desc}
              </p>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setSelectedCert(null)}
                  className="px-6 py-2 border border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10 font-mono text-sm transition-colors"
                >
                  CLOSE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
