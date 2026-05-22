import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useSettings } from '../../pages/Home';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const settings = useSettings();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'ABOUT', href: '#about' },
    { name: 'PROJECTS', href: '#portfolio' },
    { name: 'CERTIFICATES', href: '#certificates' },
    { name: 'CONTACT', href: '#contact' },
  ];
  
  const title = settings?.siteTitle ? settings.siteTitle.toUpperCase().split(' ')[0] : 'JOHNDOE';

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, delay: 1 }}
      className={`fixed top-0 w-full z-40 transition-all duration-300 ${
        scrolled ? 'bg-cyber-dark/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="#" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 border border-cyber-blue/50 rotate-45 group-hover:rotate-90 transition-all duration-500 rounded-sm"></div>
            <div className="absolute inset-2 border border-cyber-green/50 -rotate-45 group-hover:rotate-0 transition-all duration-500 rounded-sm"></div>
            <span className="font-mono text-xs font-bold font-cyber-blue">{title.charAt(0)}</span>
          </div>
          <span className="text-xl font-bold tracking-widest text-glow-blue ml-2">{title}</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8 font-mono text-sm">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-gray-400 hover:text-cyber-blue hover:text-glow-blue transition-all relative group"
            >
              {link.name}
              <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-cyber-blue transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-gray-400 hover:text-cyber-blue"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      <motion.div 
        className={`md:hidden absolute top-full left-0 w-full bg-cyber-dark/95 backdrop-blur-xl border-b border-white/10 overflow-hidden`}
        initial={{ height: 0 }}
        animate={{ height: mobileMenuOpen ? 'auto' : 0 }}
      >
        <div className="flex flex-col py-4 px-6 space-y-4 font-mono">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-gray-400 hover:text-cyber-blue py-2 border-b border-white/5 w-full"
              onClick={() => setMobileMenuOpen(false)}
            >
              &gt; {link.name}
            </a>
          ))}
        </div>
      </motion.div>
    </motion.nav>
  );
}
