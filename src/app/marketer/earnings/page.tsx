"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  CreditCard,
  PieChart
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function MarketerEarningsPage() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarned: 0,
    walletBalance: 0,
    totalPaid: 0,
    totalPending: 0
  });
  
  const supabase = createClient();

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setLoading(true);
    
    // Fetch Commissions & Withdrawals
    const [commissionsRes, withdrawalsRes] = await Promise.all([
      supabase.from('skin_marketer_commissions').select('*').eq('skin_marketer_id', session.user.id).eq('skin_status', 'approved'),
      supabase.from('skin_marketer_withdrawals').select('*').eq('skin_marketer_id', session.user.id)
    ]);

    if (commissionsRes.data && withdrawalsRes.data) {
      setCommissions(commissionsRes.data);
      
      const earned = commissionsRes.data.reduce((acc, c) => acc + Number(c.skin_commission_earned) + Number(c.skin_bonus_earned), 0);
      
      const paid = withdrawalsRes.data
        .filter(w => w.skin_status === 'approved')
        .reduce((acc, w) => acc + Number(w.skin_amount), 0);
      
      const pending = withdrawalsRes.data
        .filter(w => w.skin_status === 'pending')
        .reduce((acc, w) => acc + Number(w.skin_amount), 0);

      setStats({
        totalEarned: earned,
        totalPaid: paid,
        totalPending: pending,
        walletBalance: earned - paid - pending
      });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-accent-gold" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Calculating Financials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-text-dark uppercase italic">Financial Intelligence</h1>
          <p className="text-text-muted mt-2 font-medium italic">Track your commission growth and payout history.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="px-6 py-4 bg-green-50 rounded-2xl border border-green-100">
              <p className="text-[8px] font-black text-green-600 uppercase tracking-widest mb-1">Status</p>
              <p className="text-xs font-black text-green-700 uppercase flex items-center gap-2">
                 <CheckCircle2 size={12} /> Payout System Active
              </p>
           </div>
        </div>
      </header>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Wallet Balance', value: formatPrice(stats.walletBalance), icon: <DollarSign size={20} />, color: 'bg-text-dark text-white' },
          { label: 'Total Earned', value: formatPrice(stats.totalEarned), icon: <TrendingUp size={20} />, color: 'bg-white text-blue-600' },
          { label: 'Total Paid', value: formatPrice(stats.totalPaid), icon: <CheckCircle2 size={20} />, color: 'bg-white text-green-600' },
          { label: 'Pending Payout', value: formatPrice(stats.totalPending), icon: <Clock size={20} />, color: 'bg-white text-orange-600' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-8 rounded-[2.5rem] border border-secondary-ivory shadow-sm ${stat.color}`}
          >
             <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color === 'bg-text-dark text-white' ? 'bg-white/10' : 'bg-secondary-ivory/50'}`}>
                   {stat.icon}
                </div>
                <ArrowUpRight size={16} className="opacity-30" />
             </div>
             <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${stat.color === 'bg-text-dark text-white' ? 'text-white/60' : 'text-text-muted'}`}>{stat.label}</p>
             <p className="text-2xl font-black tracking-tighter">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Ledger */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-secondary-ivory shadow-sm overflow-hidden">
          <div className="p-8 border-b border-secondary-ivory flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tighter text-text-dark uppercase italic">Earnings Ledger</h2>
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary-ivory/50 rounded-full text-[9px] font-black uppercase tracking-widest text-text-muted">
               <Calendar size={12} /> Last 30 Days
            </div>
          </div>
          <div className="divide-y divide-secondary-ivory">
            {commissions.length > 0 ? commissions.map((c) => (
              <div key={c.skin_id} className="p-8 flex items-center justify-between hover:bg-secondary-ivory/10 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary-ivory flex items-center justify-center text-text-dark transition-colors group-hover:bg-text-dark group-hover:text-white">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-text-dark uppercase tracking-tight">Commission Recieved</p>
                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-2">
                       Order #{(c.skin_order_id || '').slice(0, 8)} · {new Date(c.skin_created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-green-600">+{formatPrice(Number(c.skin_commission_earned) + Number(c.skin_bonus_earned))}</p>
                  <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mt-1">Status: Approved</p>
                </div>
              </div>
            )) : (
              <div className="p-20 text-center text-text-muted italic text-[10px] uppercase tracking-widest font-bold">No transactions found in ledger.</div>
            )}
          </div>
        </div>

        {/* Payout Action */}
        <div className="space-y-8">
           <div className="bg-text-dark rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group text-center">
              <DollarSign className="absolute -left-8 -bottom-8 w-40 h-40 text-white/5 group-hover:scale-110 transition-transform duration-700" />
              <h3 className="text-xl font-black uppercase tracking-widest mb-4 italic">Liquidate Balance</h3>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-8 leading-relaxed">
                 Available for immediate transfer: <br/>
                 <span className="text-2xl text-white tracking-tighter mt-2 inline-block">{formatPrice(stats.walletBalance)}</span>
              </p>
              <Link 
                href="/marketer/withdraw"
                className="w-full h-16 bg-white text-text-dark rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent-gold transition-all flex items-center justify-center gap-3 relative z-10"
              >
                 Withdraw Funds <ArrowUpRight size={18} />
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
