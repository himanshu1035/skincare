"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Ticket, 
  Plus, 
  Copy, 
  Calendar, 
  Loader2, 
  Zap, 
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function MarketerCouponsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: marketer } = await supabase
      .from('skin_marketers')
      .select('*')
      .eq('skin_id', session.user.id)
      .single();

    if (marketer) {
      setProfile(marketer);
      fetchCoupons(marketer.skin_id);
    }
  };

  const fetchCoupons = async (marketerId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('skin_marketer_coupons')
      .select(`
        skin_id,
        skin_code,
        skin_discount_percent,
        skin_expiry_date,
        skin_is_active,
        skin_created_at,
        skin_marketer_commissions(count)
      `)
      .eq('skin_marketer_id', marketerId)
      .order('skin_created_at', { ascending: false });

    if (data) setCoupons(data);
    setLoading(false);
  };

  const generateRandomCode = (length: number = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateCoupon = async () => {
    if (!profile) return;
    setIsGenerating(true);
    const code = generateRandomCode(profile.skin_code_length || 10);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + (profile.skin_coupon_duration_days || 30));

    const { error } = await supabase
      .from('skin_marketer_coupons')
      .insert({
        skin_marketer_id: profile.skin_id,
        skin_code: code,
        skin_discount_percent: profile.skin_default_discount || 10,
        skin_expiry_date: expiry.toISOString(),
        skin_max_usage: profile.skin_is_one_time_use ? 1 : null
      });

    if (!error) {
      fetchCoupons(profile.skin_id);
      setShowGenerator(false);
    }
    setIsGenerating(false);
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm('Delete this unused coupon code?')) return;
    
    const { error } = await supabase
      .from('skin_marketer_coupons')
      .delete()
      .eq('skin_id', id);

    if (!error) {
      setCoupons(prev => prev.filter(c => c.skin_id !== id));
    } else {
      alert('Failed to delete coupon: ' + error.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Code copied to clipboard!');
  };

  if (loading && !profile) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-accent-gold" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Loading Campaigns...</p>
      </div>
    );
  }

  const hasUnusedCoupon = coupons.some(c => (c.skin_marketer_commissions?.[0]?.count || 0) === 0);

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-text-dark uppercase italic">Marketing Campaigns</h1>
          <p className="text-text-muted mt-2 font-medium italic">Generate and manage your promotional attribution codes.</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <button 
            disabled={hasUnusedCoupon}
            onClick={() => setShowGenerator(true)}
            className={`h-14 px-10 rounded-full font-black text-xs tracking-widest uppercase flex items-center gap-3 transition-all shadow-xl group ${
              hasUnusedCoupon 
                ? 'bg-secondary-ivory text-text-muted cursor-not-allowed border border-secondary-ivory' 
                : 'bg-text-dark text-white hover:bg-accent-gold shadow-text-dark/10'
            }`}
          >
            <Zap size={18} className={hasUnusedCoupon ? "" : "group-hover:animate-pulse"} /> 
            {hasUnusedCoupon ? "Code Already Active" : "Launch New Campaign"}
          </button>
          {hasUnusedCoupon && (
            <p className="text-[9px] font-black text-accent-gold uppercase tracking-widest italic animate-pulse">
              Use your existing code before generating a new one.
            </p>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {coupons.length > 0 ? coupons.map((c) => {
          const usageCount = c.skin_marketer_commissions?.[0]?.count || 0;
          const isUsed = usageCount > 0;
          
          return (
            <motion.div 
              key={c.skin_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-[3rem] border border-secondary-ivory shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-8 group"
            >
              <div className="flex items-center gap-8 w-full md:w-auto">
                <div className={`w-20 h-20 rounded-[2rem] flex flex-col items-center justify-center border transition-colors duration-500 ${
                  isUsed ? 'bg-secondary-ivory/50 border-secondary-ivory text-text-muted' : 'bg-accent-gold text-white border-accent-gold'
                }`}>
                  <p className="text-2xl font-black leading-none">{c.skin_discount_percent}%</p>
                  <p className="text-[8px] font-black uppercase tracking-widest mt-1">OFF</p>
                </div>
                <div>
                  <div className="flex items-center gap-4">
                    <h3 className={`text-2xl font-black tracking-[0.2em] uppercase ${isUsed ? 'text-text-muted line-through' : 'text-text-dark'}`}>{c.skin_code}</h3>
                    {!isUsed && (
                      <button onClick={() => copyToClipboard(c.skin_code)} className="p-2 hover:bg-secondary-ivory rounded-xl text-text-muted hover:text-accent-gold transition-all">
                        <Copy size={16} />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                     <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-widest italic">
                       <Zap size={12} /> Redemptions: {usageCount}
                     </div>
                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${!isUsed ? 'bg-green-50 text-green-600' : 'bg-secondary-ivory text-text-muted'}`}>
                       {!isUsed ? 'Available' : 'Used'}
                     </span>
                  </div>
                </div>
              </div>

               <div className="flex items-center gap-3">
                 <Link 
                   href={`/marketer/orders?coupon=${c.skin_code}`}
                   className="h-12 px-8 rounded-2xl bg-secondary-ivory/50 text-text-dark font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-text-dark hover:text-white transition-all group/btn"
                 >
                   View Conversions <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                 </Link>
                 {!isUsed && (
                   <button 
                     onClick={() => handleDeleteCoupon(c.skin_id)}
                     className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                     title="Delete Unused Code"
                   >
                     <Trash2 size={18} />
                   </button>
                 )}
               </div>
            </motion.div>
          );
        }) : (
          <div className="py-32 text-center bg-white rounded-[3rem] border border-secondary-ivory border-dashed">
            <Ticket className="mx-auto text-secondary-ivory mb-6" size={64} />
            <h3 className="text-xl font-black text-text-dark uppercase italic">No Campaigns Active</h3>
            <p className="text-text-muted mt-2 font-medium italic">Generate your first coupon code to start tracking sales.</p>
          </div>
        )}
      </div>

      {/* Generator Modal */}
      <AnimatePresence>
        {showGenerator && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowGenerator(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl p-12 border border-secondary-ivory">
               <header className="flex items-center justify-between mb-10">
                  <div>
                     <h2 className="text-3xl font-black tracking-tighter text-text-dark uppercase italic">Initialize Campaign</h2>
                     <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Generate a new custom code.</p>
                  </div>
               </header>
               <div className="space-y-8">
                  <div className="bg-secondary-ivory/50 p-8 rounded-[2rem] border border-secondary-ivory/50">
                     <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-6">Admin Applied Policies:</p>
                     <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-1"><p className="text-2xl font-black text-text-dark">{profile?.skin_default_discount || 10}%</p><p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Fixed Discount</p></div>
                     </div>
                  </div>
                  <div className="bg-accent-gold/5 p-6 rounded-2xl border border-accent-gold/20 flex items-start gap-4">
                    <ShieldCheck className="text-accent-gold shrink-0" size={20} />
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-accent-gold uppercase leading-relaxed">This code will have **Infinite Validity** but can only be used **Once**.</p>
                      <p className="text-[9px] text-accent-gold/70 italic leading-relaxed">Once this code is used, you can generate a new one.</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button onClick={handleCreateCoupon} disabled={isGenerating} className="w-full h-16 bg-text-dark text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-accent-gold transition-all shadow-xl shadow-text-dark/10 flex items-center justify-center gap-3">
                       {isGenerating ? <Loader2 className="animate-spin" size={20} /> : "Generate & Publish Code"}
                    </button>
                    <button onClick={() => setShowGenerator(false)} className="w-full h-14 bg-secondary-ivory text-text-dark rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all">Cancel</button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
