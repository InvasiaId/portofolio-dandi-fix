import React from 'react';
import { useSettings } from '../../pages/Home';
import { Github, Linkedin, Twitter, Instagram, Mail, Phone } from 'lucide-react';

export function Footer() {
  const settings = useSettings();
  const year = new Date().getFullYear();
  const title = settings?.siteTitle?.toUpperCase() || 'JOHNDOE';

  return (
    <footer className="border-t border-white/10 bg-cyber-dark py-8 px-6 mt-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border border-cyber-blue/50 rotate-45 flex items-center justify-center">
            <span className="font-mono text-[8px] -rotate-45">{title.substring(0, 2)}</span>
          </div>
          <span className="font-mono text-xs text-gray-500">© {year} {title} SYSTEM. ALL RIGHTS RESERVED.</span>
        </div>
        
        <div className="flex gap-6 font-mono text-sm">
          {settings?.socialLinks?.github && (
            <a href={settings.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-cyber-green transition-colors" title="Github">
              <Github size={20} />
            </a>
          )}
          {settings?.socialLinks?.linkedin && (
            <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-cyber-blue transition-colors" title="LinkedIn">
              <Linkedin size={20} />
            </a>
          )}
          {settings?.socialLinks?.twitter && (
            <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-cyber-purple transition-colors" title="Twitter / X">
              <Twitter size={20} />
            </a>
          )}
          {settings?.socialLinks?.instagram && (
            <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#ff0ab5] transition-colors" title="Instagram">
              <Instagram size={20} />
            </a>
          )}
          {settings?.socialLinks?.email && (
            <a href={`mailto:${settings.socialLinks.email}`} className="text-gray-500 hover:text-white transition-colors" title="Email">
              <Mail size={20} />
            </a>
          )}
          {settings?.socialLinks?.whatsapp && (
            <a href={`https://wa.me/${settings.socialLinks.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#00ff41] transition-colors" title="WhatsApp">
              <Phone size={20} />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
