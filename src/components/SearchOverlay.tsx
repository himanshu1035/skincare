"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export const SearchOverlay = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 2) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('skin_products')
      .select('*')
      .ilike('skin_name', `%${query}%`)
      .limit(6);
    
    setResults(data || []);
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl"
        >
          <div className="container max-w-4xl pt-24 pb-12 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-4xl font-black tracking-tighter text-text-dark">Search Products</h2>
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-full bg-secondary-ivory flex items-center justify-center text-text-dark hover:bg-text-dark hover:text-white transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Input Field */}
            <div className="relative mb-12">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted" size={28} />
              <input 
                ref={inputRef}
                type="text"
                placeholder="What are you looking for?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-secondary-ivory/50 border-none rounded-[2rem] pl-20 pr-8 py-8 text-2xl font-bold placeholder:text-text-muted/40 focus:ring-2 focus:ring-accent-gold outline-none transition-all"
              />
              {isLoading && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2">
                  <Loader2 className="animate-spin text-accent-gold" size={24} />
                </div>
              )}
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
              {results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {results.map((product) => (
                    <Link 
                      key={product.skin_id} 
                      href={`/products/${product.skin_slug}`}
                      onClick={onClose}
                      className="group flex items-center gap-6 p-4 rounded-3xl hover:bg-secondary-ivory transition-all"
                    >
                      <div className="w-24 h-24 bg-white rounded-2xl flex-shrink-0 overflow-hidden relative border border-secondary-ivory p-2">
                        <img 
                          src={product.skin_image_url || 'https://www.cosrx.com/cdn/shop/files/Snail_Essence_PC_800x.jpg'} 
                          alt="" 
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-accent-gold uppercase tracking-[0.3em] mb-1">{product.skin_brand || 'COSRX'}</p>
                        <h3 className="text-lg font-black text-text-dark line-clamp-1 mb-2 tracking-tight">{product.skin_name}</h3>
                        <p className="text-sm font-bold text-text-muted">{formatPrice(product.skin_price)}</p>
                      </div>
                      <ArrowRight className="text-text-muted group-hover:text-text-dark transition-colors" size={20} />
                    </Link>
                  ))}
                </div>
              ) : query.length > 2 && !isLoading ? (
                <div className="text-center py-20">
                  <p className="text-xl font-bold text-text-muted">No products found for "{query}"</p>
                  <p className="text-sm text-text-muted mt-2">Try searching for "Snail Mucin" or "Sunscreen"</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Popular Searches</p>
                  <div className="flex flex-wrap gap-3">
                    {['Snail Mucin', 'Low pH Cleanser', 'Pimple Patch', 'The 6 Peptide', 'Retinol'].map(term => (
                      <button 
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-6 py-3 bg-secondary-ivory rounded-full text-sm font-bold text-text-dark hover:bg-accent-gold hover:text-white transition-all"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
