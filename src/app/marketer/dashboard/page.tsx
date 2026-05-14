"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  TrendingUp, 
  DollarSign, 
  Ticket, 
  ShoppingBag,
  ArrowUpRight,
  Loader2,
  Zap,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Package,
  Activity
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function MarketerDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [tieredRules, setTieredRules] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEarned: 0,
    walletBalance: 0,
    totalPaid: 0,
    totalPending: 0,
    conversions: 0
  });
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setLoading(true);
    
    // Fetch Profile, Commissions, and Withdrawals
    const [marketerRes, settingsRes, commissionsRes, withdrawalsRes] = await Promise.all([
      supabase.from('skin_marketers').select('*').eq('skin_id', session.user.id).single(),
      supabase.from('skin_marketer_settings').select('skin_tiered_rules').eq('skin_id', 1).single(),
      supabase.from('skin_marketer_commissions').select('*, skin_orders(*)').eq('skin_marketer_id', session.user.id).eq('skin_status', 'approved'),
      supabase.from('skin_marketer_withdrawals').select('*').eq('skin_marketer_id', session.user.id)
    ]);

    if (marketerRes.data) setProfile(marketerRes.data);
    if (settingsRes.data?.skin_tiered_rules) setTieredRules(settingsRes.data.skin_tiered_rules);

    if (commissionsRes.data && withdrawalsRes.data) {
      const earned = commissionsRes.data.reduce((acc, c) => acc + Number(c.skin_commission_earned) + Number(c.skin_bonus_earned), 0);
      
      const paid = withdrawalsRes.data
        .filter(w => w.skin_status === 'approved')
        .reduce((acc, w) => acc + Number(w.skin_amount), 0);
      
      const pending = withdrawalsRes.data
        .filter(w => w.skin_status === 'pending')
        .reduce((acc, w) => acc + Number(w.skin_amount), 0);

      setRecentSales(commissionsRes.data.slice(0, 5).sort((a, b) => new Date(b.skin_created_at).getTime() - new Date(a.skin_created_at).getTime()));
      
      setStats({
        totalEarned: earned,
        totalPaid: paid,
        totalPending: pending,
        walletBalance: earned - paid - pending,
        conversions: commissionsRes.data.length
      });
    }

    setLoading(false);
  };

  const getTierInfo = () => {
    if (!profile || !tieredRules.length) return null;
    const current = tieredRules.find(r => r.level === (profile.skin_level || 'Bronze'));
    const nextIdx = tieredRules.findIndex(r => r.level === (profile.skin_level || 'Bronze')) + 1;
    const next = nextIdx < tieredRules.length ? tieredRules[nextIdx] : null;
    
    const progress = next ? Math.min((stats.conversions / next.sales) * 100, 100) : 100;
    const remaining = next ? next.sales - stats.conversions : 0;

    return { current, next, progress, remaining };
  };

  const tier = getTierInfo();

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-accent-gold" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Analyzing Performance Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 rounded-[2rem] bg-text-dark text-white flex items-center justify-center text-2xl font-black shadow-2xl shadow-text-dark/20 border-4 border-white rotate-3">
              {profile?.skin_name?.[0].toUpperCase()}
           </div>
           <div>
              <h1 className="text-4xl font-black tracking-tighter text-text-dark uppercase italic">Dashboard Overview</h1>
              <p className="text-text-muted mt-1 font-medium italic">Performance audit for {profile?.skin_name}.</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="px-6 py-3 bg-white border border-secondary-ivory rounded-2xl shadow-sm flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Active Tier: {profile?.skin_level || 'Bronze'}</span>
           </div>
           <Link 
            href="/marketer/coupons"
            className="h-14 px-10 rounded-full bg-text-dark text-white font-black text-xs tracking-widest uppercase flex items-center gap-3 hover:bg-accent-gold transition-all shadow-xl shadow-text-dark/10 group"
          >
            <Zap size={18} className="group-hover:animate-pulse" /> Launch
          </Link>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Wallet Balance', value: formatPrice(stats.walletBalance), icon: <DollarSign size={20} />, color: 'bg-text-dark text-white', link: '/marketer/withdraw' },
          { label: 'Total Earned', value: formatPrice(stats.totalEarned), icon: <TrendingUp size={20} />, color: 'bg-white text-blue-600', link: '/marketer/earnings' },
          { label: 'Total Paid', value: formatPrice(stats.totalPaid), icon: <CheckCircle2 size={20} />, color: 'bg-white text-green-600', link: '/marketer/withdraw' },
          { label: 'Pending Payout', value: formatPrice(stats.totalPending), icon: <Clock size={20} />, color: 'bg-white text-orange-600', link: '/marketer/withdraw' },
        ].map((stat, i) => (
          <Link key={i} href={stat.link}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-8 rounded-[2.5rem] border border-secondary-ivory shadow-sm hover:shadow-xl transition-all group ${stat.color === 'bg-text-dark text-white' ? 'bg-text-dark' : 'bg-white'}`}
            >
               <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color === 'bg-text-dark text-white' ? 'bg-white/10' : 'bg-secondary-ivory/50'}`}>
                    {stat.icon}
                  </div>
                  <ArrowUpRight size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity ${stat.color === 'bg-text-dark text-white' ? 'text-white' : 'text-text-muted'}`} />
               </div>
               <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${stat.color === 'bg-text-dark text-white' ? 'text-white/60' : 'text-text-muted'}`}>{stat.label}</p>
               <p className={`text-3xl font-black tracking-tighter ${stat.color === 'bg-text-dark text-white' ? 'text-white' : 'text-text-dark'}`}>{stat.value}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tier Progression */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white rounded-[3rem] p-10 border border-secondary-ivory shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                       <h3 className="text-2xl font-black uppercase tracking-tighter text-text-dark italic">Path to {tier?.next?.level || 'Maximum Glory'}</h3>
                       <p className="text-xs font-medium text-text-muted mt-1 italic">
                          {tier?.next 
                            ? `Only ${tier.remaining} more conversions to unlock ${tier.next.level} status.` 
                            : "You have achieved the ultimate Diamond level."}
                       </p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold">
                       <Zap size={24} />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-text-muted">
                       <span>{profile?.skin_level || 'Bronze'}</span>
                       <span>{tier?.next?.level || 'Diamond'}</span>
                    </div>
                    <div className="h-4 bg-secondary-ivory rounded-full overflow-hidden p-1 border border-secondary-ivory shadow-inner">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${tier?.progress || 0}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-text-dark rounded-full shadow-lg shadow-text-dark/20"
                       />
                    </div>
                    <p className="text-right text-[10px] font-black uppercase tracking-widest text-text-dark">
                       {tier?.progress.toFixed(0)}% Complete
                    </p>
                 </div>

               <div className="mt-10 grid grid-cols-2 gap-6">
                    <div className="p-6 bg-secondary-ivory/30 rounded-3xl border border-secondary-ivory">
                       <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2">Wallet Yield</p>
                       <p className="text-xl font-black text-text-dark uppercase">{profile?.skin_commission_percent || 0}% Commission</p>
                    </div>
                    <div className="p-6 bg-accent-gold/5 rounded-3xl border border-accent-gold/20">
                       <p className="text-[9px] font-black text-accent-gold uppercase tracking-widest mb-2">Availability</p>
                       <p className="text-xl font-black text-text-dark uppercase">
                          Instant Payouts
                       </p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Activity Feed */}
           <div className="bg-white rounded-[3rem] border border-secondary-ivory shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 border-b border-secondary-ivory flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tighter text-text-dark uppercase italic">Earnings Tracker</h2>
                <Link href="/marketer/earnings" className="text-[10px] font-black text-accent-gold uppercase tracking-widest hover:underline flex items-center gap-2">
                   Financial Ledger <ChevronRight size={14} />
                </Link>
              </div>
              <div className="flex-1 divide-y divide-secondary-ivory">
                {recentSales.length > 0 ? recentSales.map((sale) => (
                  <div key={sale.skin_id} className="p-8 flex items-center justify-between hover:bg-secondary-ivory/10 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary-ivory flex items-center justify-center text-text-dark group-hover:bg-text-dark group-hover:text-white transition-all">
                        <DollarSign size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-text-dark uppercase tracking-tight">Commission Recieved</p>
                        <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-2">
                           <ShieldCheck size={10} /> Verified · {new Date(sale.skin_created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-green-600">+{formatPrice(Number(sale.skin_commission_earned) + Number(sale.skin_bonus_earned))}</p>
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center text-text-muted italic text-[10px] font-bold uppercase tracking-widest">No transaction activity.</div>
                )}
              </div>
           </div>
        </div>

        {/* Pulse & Stats - Removed and replaced with simplified guard */}
        <div className="space-y-8">
           <div className="bg-white rounded-[3rem] p-10 border border-secondary-ivory shadow-sm">
              <h3 className="text-xl font-black uppercase tracking-widest mb-6 text-text-dark italic">Network Rules</h3>
              <div className="space-y-4">
                 {[
                   { label: 'Commission Tier', value: `${profile?.skin_commission_percent || 0}% Value` },
                   { label: 'Discount Cap', value: `${profile?.skin_default_discount || 0}% Off` },
                   { label: 'Withdrawal Limit', value: '₹500.00' }
                 ].map((p, i) => (
                   <div key={i} className="flex items-center justify-between py-4 border-b border-secondary-ivory/50 last:border-0">
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">{p.label}</p>
                      <p className="text-[10px] font-black text-text-dark uppercase">{p.value}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
