"use client";

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { createClient } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import { motion } from 'framer-motion';
import { Trophy, Star, TrendingUp, Sparkles, Loader2 } from 'lucide-react';

export default function BestSellersPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchBestSellers();
  }, []);

  const fetchBestSellers = async () => {
    setLoading(true);
    // Fetch products from the best-sellers collection
    const { data: coll } = await supabase
      .from('skin_collections')
      .select('skin_id')
      .eq('skin_slug', 'best-sellers')
      .single();

    if (coll) {
      const { data: productLinks } = await supabase
        .from('skin_collection_products')
        .select('skin_products(*)')
        .eq('skin_collection_id', coll.skin_id);

      if (productLinks) {
        // Flatten and preserve order from our manual setup (if possible)
        // For now, we'll ensure Snail Mucin is first
        const items = productLinks.map((l: any) => l.skin_products).filter(Boolean);
        const sorted = items.sort((a: any, b: any) => {
          if (a.skin_name.includes('Snail 96 Mucin Power Essence')) return -1;
          if (b.skin_name.includes('Snail 96 Mucin Power Essence')) return 1;
          return 0;
        });
        setProducts(sorted);
      }
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-secondary-ivory/20">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-40 pb-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[120%] bg-gradient-radial from-accent-gold/10 via-transparent to-transparent -z-10 blur-3xl opacity-50" />
        
        <div className="container max-w-6xl text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-2 bg-text-dark text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-xl"
          >
            <Trophy size={14} className="text-accent-gold" /> COSRX Hall of Fame
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter text-text-dark uppercase"
          >
            Best <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-orange-400">Sellers</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-text-muted font-medium italic max-w-2xl mx-auto"
          >
            Discover the award-winning essentials that defined the K-Beauty revolution. Trusted by millions, perfected by science.
          </motion.p>
        </div>
      </section>

      {/* Stats/Badges */}
      <section className="pb-24">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Star className="text-accent-gold" />, label: "4.9/5 Rating", sub: "Based on 10k+ Reviews" },
              { icon: <TrendingUp className="text-accent-gold" />, label: "#1 in Korea", sub: "Best Selling Brands" },
              { icon: <Sparkles className="text-accent-gold" />, label: "Derm Approved", sub: "Clinically Validated" },
              { icon: <Trophy className="text-accent-gold" />, label: "Global Awards", sub: "Beauty Winners 2024" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-white p-6 rounded-[2rem] border border-secondary-ivory shadow-sm flex flex-col items-center text-center gap-2"
              >
                {stat.icon}
                <p className="text-xs font-black text-text-dark uppercase tracking-widest">{stat.label}</p>
                <p className="text-[10px] text-text-muted font-medium italic">{stat.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="pb-32">
        <div className="container max-w-6xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-accent-gold" size={40} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Curating Excellence...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {products.map((product, index) => (
                <div key={product.skin_id} className="relative group">
                  {index === 0 && (
                    <div className="absolute -top-4 -left-4 z-20 bg-accent-gold text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 animate-bounce">
                      <Star size={12} fill="white" /> #1 Best Seller
                    </div>
                  )}
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
