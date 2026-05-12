"use client";

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Loader2, MessageSquare, Mail, Phone, MapPin } from 'lucide-react';

export default function ContactUsPage() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-white overflow-hidden">
      <Navbar />
      
      {/* Absolute center loading screen */}
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-12">
           <div className="w-24 h-24 rounded-full border-4 border-secondary-ivory border-t-accent-gold animate-spin" />
           <Loader2 className="absolute inset-0 m-auto text-accent-gold/20" size={32} />
        </div>
        
        <div className="space-y-6 max-w-md">
          <h2 className="text-3xl font-black tracking-tighter text-text-dark">Connecting to Support{dots}</h2>
          <p className="text-text-muted text-sm font-medium italic animate-pulse">
            Establishing a secure channel with our concierge team. Please do not close this window.
          </p>
          
          <div className="pt-12 grid grid-cols-2 gap-4 opacity-10">
             <div className="p-4 rounded-2xl bg-secondary-ivory flex items-center gap-3">
                <MessageSquare size={16} /> <span className="text-[10px] font-bold uppercase tracking-widest">Live Chat</span>
             </div>
             <div className="p-4 rounded-2xl bg-secondary-ivory flex items-center gap-3">
                <Mail size={16} /> <span className="text-[10px] font-bold uppercase tracking-widest">Email</span>
             </div>
          </div>
        </div>

        {/* Subtle background branding */}
        <div className="absolute bottom-20 left-0 right-0 flex justify-center opacity-[0.03] select-none pointer-events-none">
           <h1 className="text-[15vw] font-black tracking-tighter">CONTACT</h1>
        </div>
      </div>

      {/* Hidden layout content to keep the DOM structure consistent */}
      <div className="invisible">
        <Navbar />
        <div className="pt-40 pb-24 container">
           <h1>Contact Us</h1>
        </div>
        <Footer />
      </div>
    </main>
  );
}
