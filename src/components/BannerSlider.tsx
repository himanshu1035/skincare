"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Banner {
  skin_id: string;
  skin_title: string;
  skin_subtitle: string;
  skin_image_desktop: string;
  skin_image_mobile?: string;
  skin_cta_text: string;
  skin_link_type: string;
  skin_link_id: string;
  skin_bg_color?: string;
  skin_text_color?: string;
}

export const BannerSlider: React.FC<{ initialBanners: Banner[] }> = ({ initialBanners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (initialBanners.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % initialBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [initialBanners.length, isHovered]);

  if (initialBanners.length === 0) return null;

  const currentBanner = initialBanners[currentIndex];

  const getLink = (banner: Banner) => {
    switch (banner.skin_link_type) {
      case 'collection': return `/collections/${banner.skin_link_id}`;
      case 'product': return `/products/${banner.skin_link_id}`;
      default: return banner.skin_link_id || '#';
    }
  };

  return (
    <div 
      className="relative w-full h-[85vh] overflow-hidden bg-secondary-ivory"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.skin_id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Desktop View - Premium Grid Editorial */}
          <div className="hidden md:block absolute inset-0">
             <img 
               src={currentBanner.skin_image_desktop} 
               alt={currentBanner.skin_title} 
               className="w-full h-full object-cover object-right-top"
             />
             <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent" />
          </div>

          {/* Mobile View - Enhanced for Readability */}
          <div className="md:hidden absolute inset-0">
             <img 
               src={currentBanner.skin_image_mobile || currentBanner.skin_image_desktop} 
               alt={currentBanner.skin_title} 
               className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-text-dark via-text-dark/40 to-transparent" />
          </div>

          {/* Content */}
          <div className="container relative h-full flex flex-col justify-center items-center md:items-start pt-20 z-10 text-center md:text-left">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="max-w-2xl space-y-8"
            >
              <div className="space-y-4">
                <motion.span 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="inline-block text-accent-gold font-black uppercase tracking-[0.4em] text-[10px]"
                >
                  Limited Time Exclusive
                </motion.span>
                <h1 
                  className="text-5xl md:text-8xl font-black font-outfit tracking-tighter leading-[0.9] uppercase text-white md:text-text-dark"
                >
                  {currentBanner.skin_title}
                </h1>
                <p 
                  className="text-base md:text-xl font-medium max-w-lg leading-relaxed italic text-white/80 md:text-text-muted"
                >
                  {currentBanner.skin_subtitle}
                </p>
              </div>

              <Link href={getLink(currentBanner)} className="mx-auto md:mx-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group px-10 py-5 bg-white md:bg-text-dark text-text-dark md:text-white rounded-full font-black text-xs tracking-[0.2em] uppercase flex items-center gap-4 shadow-2xl hover:bg-accent-gold transition-all mt-10"
                >
                  {currentBanner.skin_cta_text}
                  <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      {initialBanners.length > 1 && (
        <>
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-20">
            {initialBanners.map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 transition-all duration-500 rounded-full ${currentIndex === i ? 'w-12 bg-accent-gold' : 'w-6 bg-white/40'}`}
              />
            ))}
          </div>

          <div className="absolute inset-y-0 left-8 flex items-center z-20">
             <button 
               onClick={() => setCurrentIndex((prev) => (prev - 1 + initialBanners.length) % initialBanners.length)}
               className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-white backdrop-blur-md hover:bg-white hover:text-text-dark transition-all"
             >
               <ChevronLeft size={24} />
             </button>
          </div>
          <div className="absolute inset-y-0 right-8 flex items-center z-20">
             <button 
               onClick={() => setCurrentIndex((prev) => (prev + 1) % initialBanners.length)}
               className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-white backdrop-blur-md hover:bg-white hover:text-text-dark transition-all"
             >
               <ChevronRight size={24} />
             </button>
          </div>
        </>
      )}

      {/* Campaign Progress Bar (Visual only for premium feel) */}
      <div className="absolute -bottom-1 left-0 w-full h-1 bg-white/10 z-20">
        <motion.div 
          key={currentIndex}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 6, ease: 'linear' }}
          className="h-full bg-accent-gold/40"
        />
      </div>
    </div>
  );
};
