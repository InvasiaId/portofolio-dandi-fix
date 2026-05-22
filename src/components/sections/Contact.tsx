import React from 'react';
import { motion } from 'motion/react';
import { Send, Terminal } from 'lucide-react';

export function Contact() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message')
    };

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(() => {
      alert("Transmission Data Sent successfully.");
      (e.target as HTMLFormElement).reset();
    })
    .catch(console.error);
  };

  return (
    <section id="contact" className="relative py-32 bg-cyber-darker">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        <div className="flex items-center gap-4 mb-12">
          <Terminal className="text-cyber-green" />
          <h2 className="text-3xl font-mono font-bold text-white">INITIATE_CONTACT</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-cyber-green/50 to-transparent"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border border-white/10 bg-black/50 p-6 md:p-10 backdrop-blur-md relative"
        >
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-green"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyber-green"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyber-green"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-green"></div>

          <form className="space-y-6 font-mono text-sm max-w-2xl mx-auto" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-gray-400 block">&gt; IDENTIFIER [NAME]</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  className="w-full bg-cyber-dark border border-white/20 p-3 text-white focus:border-cyber-green focus:outline-none transition-colors"
                  placeholder="Enter name..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-gray-400 block">&gt; COMM_LINK [EMAIL]</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  className="w-full bg-cyber-dark border border-white/20 p-3 text-white focus:border-cyber-green focus:outline-none transition-colors"
                  placeholder="Enter email..."
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-gray-400 block">&gt; TRANSMISSION_DATA [MESSAGE]</label>
              <textarea 
                rows={5}
                name="message"
                required
                className="w-full bg-cyber-dark border border-white/20 p-3 text-white focus:border-cyber-green focus:outline-none transition-colors resize-none"
                placeholder="Enter message..."
              ></textarea>
            </div>

            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-cyber-green/10 border border-cyber-green text-cyber-green py-4 hover:bg-cyber-green hover:text-black transition-all duration-300 font-bold tracking-widest uppercase group"
            >
              TRANSMIT_DATA
              <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
