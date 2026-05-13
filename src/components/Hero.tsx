"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

const Hero = () => {
  const [imageError, setImageError] = useState(false);

  // Premium clean banner image for better text legibility
  const bannerImage = imageError 
    ? 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=2000&auto=format&fit=crop'
    : '/hero-snail.png';

  return (
    <section className="relative h-[80vh] w-full overflow-hidden bg-[#FAF9F6] border-b border-secondary-ivory">
      {/* Clean Minimalist Background - No Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[60%] h-full bg-accent-gold/5 rounded-l-[10rem] blur-3xl opacity-50" />
      </div>

      {/* Content */}
      <div className="container relative z-10 h-full flex flex-col justify-center items-start pt-20">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-block text-accent-gold font-black tracking-[0.4em] uppercase mb-6 text-[10px] sm:text-xs"
          >
            BEST SELLER EXCLUSIVE
          </motion.span>

          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-text-dark tracking-tighter leading-[0.9] mb-8">
            THE GLOW OF<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-text-dark to-accent-gold">CONFIDENCE</span>
          </h1>
          
          <p className="text-lg text-text-dark font-medium mb-12 max-w-md leading-relaxed opacity-80">
            Advanced Snail Mucin & Propolis Synergy. Experience the 
            dermatologist-loved formula for a radiant, glass-skin finish.
          </p>
          
          <div className="flex flex-wrap gap-5">
            <Link href="/collections/snail-mucin">
              <Button size="lg" className="h-16 px-10 text-sm font-black tracking-widest bg-text-dark hover:bg-accent-gold text-white border-none rounded-none shadow-2xl transition-all active:scale-95">
                SHOP THE GLOW
              </Button>
            </Link>
            <Link href="/collections/peptide">
              <Button variant="outline" size="lg" className="h-16 px-10 text-sm font-black tracking-widest border-2 border-text-dark text-text-dark hover:bg-text-dark hover:text-white rounded-none transition-all">
                EXPLORE PEPTIDE
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center"
      >
        <span className="text-[9px] font-bold tracking-[0.4em] uppercase text-text-dark/40 mb-4">Scroll</span>
        <div className="w-[1px] h-16 bg-text-dark/10 relative overflow-hidden">
          <motion.div 
            animate={{ y: [-64, 64] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-1/2 bg-accent-gold"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
