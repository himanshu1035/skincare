"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  TrendingUp, 
  DollarSign, 
  Ticket, 
  Users, 
  Plus, 
  Search, 
  Copy, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  ShoppingBag,
  Zap,
  BarChart3,
  Calendar,
  ChevronRight,
  ShieldCheck,
  User,
  ArrowUpRight,
  X,
  Package,
  ExternalLink
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarketerDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  
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
      fetchDashboardData(marketer.skin_id);
    }
  };

  const fetchDashboardData = async (marketerId: string) => {
    setLoading(true);
    const [couponsRes, commissionsRes] = await Promise.all([
      supabase
        .from('skin_marketer_coupons')
        .select('*')
        .eq('skin_marketer_id', marketerId)
        .order('skin_created_at', { ascending: false }),
      supabase
        .from('skin_marketer_commissions')
        .select('*, skin_orders(skin_first_name, skin_last_name, skin_customer_email, skin_items, skin_id)')
        .eq('skin_marketer_id', marketerId)
        .order('skin_created_at', { ascending: false })
    ]);

    if (couponsRes.data) setCoupons(couponsRes.data);
    if (commissionsRes.data) setCommissions(commissionsRes.data);
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
      fetchDashboardData(profile.skin_id);
      setShowGenerator(false);
    }
    setIsGenerating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Code copied to clipboard!');
  };

  if (loading && !profile) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-accent-gold" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Synchronizing Workspace...</p>
      </div>
    );
  }

  const totalEarnings = commissions.reduce((acc, c) => acc + Number(c.skin_commission_earned) + Number(c.skin_bonus_earned), 0);
  const totalSalesValue = commissions.reduce((acc, c) => acc + Number(c.skin_order_amount), 0);

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-text-dark uppercase italic">Performance Hub</h1>
          <p className="text-text-muted mt-2 font-medium italic">Manage campaigns, track conversions, and monitor earnings.</p>
        </div>
        <button 
          onClick={() => setShowGenerator(true)}
          className="h-14 px-10 rounded-full bg-text-dark text-white font-black text-xs tracking-widest uppercase flex items-center gap-3 hover:bg-accent-gold transition-all shadow-xl shadow-text-dark/10 group"
        >
          <Zap size={18} className="group-hover:animate-pulse" /> Generate New Code
        </button>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Earnings', value: formatPrice(totalEarnings), icon: <DollarSign size={20} />, color: 'bg-green-50 text-green-600' },
          { label: 'Attributed Revenue', value: formatPrice(totalSalesValue), icon: <TrendingUp size={20} />, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Conversions', value: commissions.length, icon: <ShoppingBag size={20} />, color: 'bg-purple-50 text-purple-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-secondary-ivory shadow-sm hover:shadow-md transition-all">
             <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
                <ArrowUpRight size={16} className="text-text-muted opacity-30" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">{stat.label}</p>
             <p className="text-3xl font-black text-text-dark tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Coupons */}
        <section className="bg-white rounded-[3rem] border border-secondary-ivory shadow-sm overflow-hidden">
          <div className="p-8 border-b border-secondary-ivory flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tighter text-text-dark uppercase italic">Active Campaigns</h2>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Admin-enforced promotional codes.</p>
            </div>
            <Ticket className="text-accent-gold" size={24} />
          </div>
          <div className="divide-y divide-secondary-ivory">
            {coupons.length > 0 ? coupons.map((c) => (
              <div key={c.skin_id} className="p-8 flex items-center justify-between hover:bg-secondary-ivory/10 transition-colors group">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-secondary-ivory/50 flex items-center justify-center text-text-dark font-black text-xs">
                    {c.skin_discount_percent}%
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-black text-text-dark tracking-widest uppercase">{c.skin_code}</p>
                      <button onClick={() => copyToClipboard(c.skin_code)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white rounded-lg text-text-muted hover:text-accent-gold shadow-sm">
                        <Copy size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                       <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest italic flex items-center gap-1">
                         <Calendar size={10} /> {new Date(c.skin_expiry_date).toLocaleDateString()}
                       </p>
                       <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${c.skin_is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                         {c.skin_is_active ? 'LIVE' : 'EXPIRED'}
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-20 text-center text-text-muted italic text-[10px] uppercase tracking-widest">No active campaigns.</div>
            )}
          </div>
        </section>

        {/* Sales Attribution */}
        <section className="bg-white rounded-[3rem] border border-secondary-ivory shadow-sm overflow-hidden">
          <div className="p-8 border-b border-secondary-ivory flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tighter text-text-dark uppercase italic">Sales Attribution</h2>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Full order transparency for your conversions.</p>
            </div>
            <Users className="text-blue-500" size={24} />
          </div>
          <div className="divide-y divide-secondary-ivory">
            {commissions.length > 0 ? commissions.map((c) => (
              <div key={c.skin_id} className="p-8 flex items-center justify-between hover:bg-secondary-ivory/10 transition-all cursor-pointer group" onClick={() => setSelectedSale(c)}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary-ivory flex items-center justify-center text-text-dark transition-colors group-hover:bg-accent-gold group-hover:text-white">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-text-dark uppercase tracking-tight">
                       Sale #{(c.skin_orders?.skin_id || '').slice(0, 8)}
                    </p>
                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-1">
                       <User size={10} /> {c.skin_orders?.skin_first_name} {c.skin_orders?.skin_last_name?.[0]}. · <Clock size={10} /> {new Date(c.skin_created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="text-sm font-black text-text-dark">{formatPrice(c.skin_order_amount)}</p>
                    <p className="text-[9px] font-black text-accent-gold uppercase tracking-widest mt-1">Earned: +{formatPrice(Number(c.skin_commission_earned) + Number(c.skin_bonus_earned))}</p>
                  </div>
                  <ChevronRight size={16} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            )) : (
              <div className="p-20 text-center text-text-muted italic text-[10px] uppercase tracking-widest">No sales attributed yet.</div>
            )}
          </div>
        </section>
      </div>

      {/* Sale Details Modal */}
      <AnimatePresence>
        {selectedSale && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSale(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 border border-secondary-ivory overflow-hidden">
               <header className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter text-text-dark uppercase italic">Order Details</h2>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Transparency for attributed sale #{(selectedSale.skin_orders?.skin_id || '').slice(0, 8)}</p>
                  </div>
                  <button onClick={() => setSelectedSale(null)} className="w-10 h-10 rounded-full bg-secondary-ivory flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><X size={20}/></button>
               </header>

               <div className="space-y-6">
                  <div className="bg-secondary-ivory/30 p-6 rounded-[2rem] border border-secondary-ivory">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                        <Package size={14} /> Ordered Products
                     </h3>
                     <div className="space-y-4">
                        {selectedSale.skin_orders?.skin_items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between group">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-secondary-ivory">
                                   <Package size={16} className="text-text-muted" />
                                </div>
                                <div>
                                   <p className="text-[11px] font-black text-text-dark uppercase">{item.skin_title}</p>
                                   <p className="text-[9px] text-text-muted font-bold uppercase italic">Qty: {item.skin_quantity} · {formatPrice(item.skin_price)}</p>
                                </div>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100">
                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Total Value</p>
                        <p className="text-xl font-black text-blue-700">{formatPrice(selectedSale.skin_order_amount)}</p>
                     </div>
                     <div className="bg-green-50/50 p-6 rounded-[2rem] border border-green-100">
                        <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Your Commission</p>
                        <p className="text-xl font-black text-green-700">{formatPrice(Number(selectedSale.skin_commission_earned) + Number(selectedSale.skin_bonus_earned))}</p>
                     </div>
                  </div>
               </div>

               <button onClick={() => setSelectedSale(null)} className="w-full h-14 bg-text-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent-gold transition-all mt-8">Close Details</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1"><p className="text-2xl font-black text-text-dark">{profile?.skin_default_discount || 10}%</p><p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Fixed Discount</p></div>
                        <div className="space-y-1"><p className="text-2xl font-black text-text-dark">{profile?.skin_coupon_duration_days || 30}</p><p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Validity Days</p></div>
                     </div>
                  </div>
                  <div className="bg-accent-gold/5 p-6 rounded-2xl border border-accent-gold/20 flex items-start gap-4"><ShieldCheck className="text-accent-gold shrink-0" size={20} /><p className="text-[10px] font-bold text-accent-gold uppercase leading-relaxed">Your code will be generated instantly using pre-defined store rules.</p></div>
                  <div className="flex flex-col gap-3">
                    <button onClick={handleCreateCoupon} disabled={isGenerating} className="w-full h-16 bg-text-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent-gold transition-all shadow-xl shadow-text-dark/10 flex items-center justify-center gap-3">
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
