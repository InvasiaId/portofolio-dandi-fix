import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsVisible(false), 500);
          return 100;
        }
        return p + Math.floor(Math.random() * 15) + 5;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cyber-darker text-cyber-green font-mono"
        >
          <div className="w-64 max-w-[80vw]">
            <div className="mb-2 flex justify-between text-sm">
              <span>SYSTEM_INITIALIZATION</span>
              <span>{Math.min(progress, 100)}%</span>
            </div>
            <div className="h-1 w-full border border-cyber-green/50 bg-black/50 p-0.5">
              <motion.div 
                className="h-full bg-cyber-green shadow-[0_0_10px_#00ff41]" 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <div className="mt-4 text-xs opacity-70 flex flex-col gap-1">
              {progress > 10 && <div>&gt; Loading core modules...</div>}
              {progress > 40 && <div>&gt; Establishing neural link...</div>}
              {progress > 70 && <div>&gt; Rendering 3D environment...</div>}
              {progress >= 100 && <div>&gt; System ready.</div>}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
