import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { Minus, Square, X } from 'lucide-react';

interface TerminalWindowProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  onClose?: () => void;
}

export function TerminalWindow({ title = "TERMINAL V1.0", children, className, delay = 0, onClose }: TerminalWindowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "flex flex-col border border-cyber-green/50 bg-black/80 backdrop-blur-sm overflow-hidden",
        "border-glow-green font-mono text-xs sm:text-sm text-cyber-green",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyber-green/50 bg-cyber-green/10 px-2 sm:px-4 py-1.5 sm:py-2">
        <span className="font-bold tracking-wider">{title}</span>
        <div className="flex items-center space-x-2">
          <Minus size={14} className="hover:text-white cursor-pointer" />
          <Square size={12} className="hover:text-white cursor-pointer" />
          <X size={14} className="hover:text-white cursor-pointer" onClick={onClose} />
        </div>
      </div>
      
      {/* Content */}
      <div className="p-3 sm:p-5 flex-1 overflow-y-auto">
        {children}
      </div>
    </motion.div>
  );
}
