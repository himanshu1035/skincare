"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Zap, 
  ArrowRight, 
  Calendar, 
  Tag, 
  ShoppingBag,
  Loader2,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function AllCampaignsPage() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    const { data } = await supabase
      .from('skin_campaigns')
      .select('*, skin_promotions(*)')
      .eq('skin_is_active', true)
      .order('skin_created_at', { ascending: false });
    
    if (data) setCampaigns(data);
    setLoading(false);
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen flex flex-col">
      <Navbar />
      
      <main className="container pt-40 pb-24 flex-1">
        <header className="mb-20 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-accent-gold/10 text-accent-gold text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-accent-gold/20 shadow-sm"
          >
            <Sparkles size={12} /> Live Opportunities
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter text-text-dark uppercase italic leading-none mb-6"
          >
            Active <span className="text-accent-gold">Campaigns</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-text-muted max-w-2xl mx-auto text-lg font-medium italic"
          >
            Explore our curated selection of limited-time offers and exclusive skincare drops.
          </motion.p>
        </header>

        {loading ? (
          <div className="py-24 flex justify-center">
            <Loader2 className="animate-spin text-accent-gold" size={48} />
          </div>
        ) : campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {campaigns.map((campaign, idx) => (
              <motion.div
                key={campaign.skin_id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-white rounded-[4rem] overflow-hidden border border-secondary-ivory hover:shadow-2xl hover:shadow-text-dark/5 transition-all duration-700 h-[600px] flex flex-col"
              >
                 {/* Visual Area */}
                 <div className="h-[350px] relative overflow-hidden bg-secondary-ivory/30">
                    {campaign.skin_banner_image ? (
                      <img 
                        src={campaign.skin_banner_image} 
                        alt={campaign.skin_title} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-secondary-ivory to-white flex items-center justify-center">
                        <ShoppingBag size={80} className="text-secondary-ivory group-hover:scale-110 transition-transform duration-700" />
                      </div>
                    )}
                    <div className="absolute top-8 left-8 flex gap-3">
                       <span className="px-4 py-1.5 bg-text-dark text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-xl">
                          {campaign.skin_promotions?.skin_type?.replace('_', ' ') || 'Special Offer'}
                       </span>
                    </div>
                 </div>

                 {/* Content Area */}
                 <div className="flex-1 p-12 flex flex-col justify-between">
                    <div>
                       <h2 className="text-3xl font-black text-text-dark uppercase tracking-tighter italic mb-4 leading-none group-hover:text-accent-gold transition-colors">{campaign.skin_title}</h2>
                       <p className="text-text-muted text-sm font-medium italic line-clamp-2 mb-6 leading-relaxed">
                          {campaign.skin_description || 'Exclusive limited time offer from COSRX India.'}
                       </p>
                       <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-text-muted">
                          <div className="flex items-center gap-2">
                             <Calendar size={14} className="text-accent-gold" /> 
                             {campaign.skin_end_date ? `Ends: ${new Date(campaign.skin_end_date).toLocaleDateString()}` : 'Limited Time'}
                          </div>
                          <div className="flex items-center gap-2">
                             <Tag size={14} className="text-accent-gold" /> Active Now
                          </div>
                       </div>
                    </div>

                    <Link 
                      href={`/campaign/${campaign.skin_slug}`}
                      className="h-16 w-full rounded-[1.5rem] bg-text-dark text-white flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest hover:bg-accent-gold transition-all shadow-xl shadow-text-dark/10 group-hover:translate-y-[-5px]"
                    >
                       Explore Campaign <ArrowRight size={18} />
                    </Link>
                 </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-white rounded-[4rem] border border-secondary-ivory border-dashed">
             <div className="w-24 h-24 bg-secondary-ivory/50 rounded-full flex items-center justify-center mx-auto mb-8">
                <Zap size={40} className="text-text-muted" />
             </div>
             <h2 className="text-3xl font-black text-text-dark uppercase italic mb-4">No Active Campaigns</h2>
             <p className="text-text-muted font-medium italic max-w-md mx-auto">
                Check back soon for new exclusive offers and seasonal collections.
             </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
