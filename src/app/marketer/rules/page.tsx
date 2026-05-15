"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Shield, Zap, Info, ChevronRight, Loader2, Award, Target, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MarketerRules() {
  const [tieredRules, setTieredRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    const { data } = await supabase
      .from('skin_marketer_settings')
      .select('skin_tiered_rules')
      .eq('skin_id', 1)
      .single();
    
    if (data?.skin_tiered_rules) {
      setTieredRules(data.skin_tiered_rules);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-accent-gold" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header>
        <div className="flex items-center gap-4 mb-4">
           <div className="w-12 h-12 rounded-2xl bg-text-dark text-white flex items-center justify-center">
              <Shield size={24} />
           </div>
           <h1 className="text-4xl font-black tracking-tighter text-text-dark uppercase italic">Network Governance</h1>
        </div>
        <p className="text-text-muted font-medium italic text-lg">Understanding our tiered commission ecosystem and platform policies.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Minimum Payout', value: '₹500.00', icon: <Wallet size={18} /> },
           { label: 'Verification Period', value: '24-48 Hours', icon: <Zap size={18} /> },
           { label: 'Fraud Detection', value: 'Active Monitoring', icon: <Shield size={18} /> },
         ].map((stat, i) => (
           <div key={i} className="p-8 bg-white rounded-[2.5rem] border border-secondary-ivory shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-secondary-ivory flex items-center justify-center text-text-dark mb-4">
                 {stat.icon}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">{stat.label}</p>
              <p className="text-xl font-black text-text-dark uppercase">{stat.value}</p>
           </div>
         ))}
      </div>

      <section className="bg-white rounded-[3rem] p-10 md:p-12 border border-secondary-ivory shadow-sm">
        <div className="flex items-center gap-4 mb-10">
          <Award className="text-accent-gold" size={28} />
          <h2 className="text-2xl font-black uppercase tracking-tighter text-text-dark italic">Commission Tiers</h2>
        </div>

        <div className="space-y-4">
          {tieredRules.map((tier, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={tier.level} 
              className="group p-8 rounded-3xl border border-secondary-ivory hover:border-text-dark hover:shadow-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-secondary-ivory group-hover:bg-text-dark group-hover:text-white flex items-center justify-center transition-colors">
                  <span className="text-2xl font-black uppercase italic">{tier.level[0]}</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-text-dark uppercase">{tier.level} Status</h3>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Requires {tier.sales} Verified Conversions</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Base Yield</p>
                   <p className="text-2xl font-black text-text-dark">{tier.commission}%</p>
                </div>
                <ChevronRight className="text-secondary-ivory group-hover:text-text-dark transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-text-dark rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
        <Target size={120} className="absolute -bottom-8 -right-8 opacity-10" />
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-6">General Guidelines</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-accent-gold flex-shrink-0 flex items-center justify-center text-[10px] font-bold">1</div>
              <p className="text-sm font-medium text-white/80 leading-relaxed italic">Commission is only calculated on the discount amount provided by your specific marketer coupon code.</p>
            </div>
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-accent-gold flex-shrink-0 flex items-center justify-center text-[10px] font-bold">2</div>
              <p className="text-sm font-medium text-white/80 leading-relaxed italic">Orders must be verified by the admin (successful payment confirmation) before commission is moved to approved.</p>
            </div>
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-accent-gold flex-shrink-0 flex items-center justify-center text-[10px] font-bold">3</div>
              <p className="text-sm font-medium text-white/80 leading-relaxed italic">Self-referrals or fraudulent activity will result in immediate account termination and forfeiture of all pending funds.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
