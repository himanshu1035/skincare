"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Wallet, 
  ArrowUpRight, 
  CreditCard, 
  History, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '@/lib/utils';

export default function MarketerWithdraw() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [upis, setUpis] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [selectedUpi, setSelectedUpi] = useState('');
  const [amount, setAmount] = useState('');
  const [minWithdrawal, setMinWithdrawal] = useState(500);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setLoading(true);
    
    const [commissionsRes, upisRes, withdrawalsRes, settingsRes] = await Promise.all([
      supabase.from('skin_marketer_commissions').select('skin_id, skin_commission_earned, skin_bonus_earned, skin_status, skin_created_at').eq('skin_marketer_id', session.user.id),
      supabase.from('skin_marketer_upi').select('*').eq('skin_marketer_id', session.user.id),
      supabase.from('skin_marketer_withdrawals').select('*').eq('skin_marketer_id', session.user.id).order('skin_created_at', { ascending: false }),
      supabase.from('skin_marketer_settings').select('skin_min_withdrawal').eq('skin_id', 1).single()
    ]);

    if (commissionsRes.data && withdrawalsRes.data) {
      // 1. Calculate Approved Earnings (Lifetime)
      const lifetimeEarned = commissionsRes.data
        .filter(c => c.skin_status === 'approved')
        .reduce((acc, c) => acc + Number(c.skin_commission_earned) + Number(c.skin_bonus_earned), 0);

      // 2. Calculate Payouts
      const paid = withdrawalsRes.data
        .filter(w => w.skin_status === 'approved')
        .reduce((acc, w) => acc + Number(w.skin_amount), 0);
      
      const pending = withdrawalsRes.data
        .filter(w => w.skin_status === 'pending')
        .reduce((acc, w) => acc + Number(w.skin_amount), 0);

      setTotalPaid(paid);
      setTotalPending(pending);
      
      // 3. Wallet Balance = Lifetime Earned - (Paid + Pending)
      // This ensures pending money is "locked" and cannot be double-withdrawn
      setBalance(lifetimeEarned - paid - pending);

      // 4. Merge Ledger (Commissions and Withdrawals)
      const commissionItems = commissionsRes.data.map(c => ({
        id: c.skin_id,
        type: 'earning',
        amount: Number(c.skin_commission_earned) + Number(c.skin_bonus_earned),
        status: c.skin_status,
        date: c.skin_created_at,
        label: 'Sales Commission'
      }));

      const withdrawalItems = withdrawalsRes.data.map(w => ({
        id: w.skin_id,
        type: 'payout',
        amount: Number(w.skin_amount),
        status: w.skin_status,
        date: w.skin_created_at,
        label: 'Wallet Withdrawal'
      }));

      const mergedLedger = [...commissionItems, ...withdrawalItems].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setLedger(mergedLedger);
    }

    if (upisRes.data) {
      setUpis(upisRes.data);
      const primary = upisRes.data.find(u => u.skin_is_primary);
      if (primary) setSelectedUpi(primary.skin_upi_id);
      else if (upisRes.data.length > 0) setSelectedUpi(upisRes.data[0].skin_upi_id);
    }

    if (settingsRes.data) setMinWithdrawal(Number(settingsRes.data.skin_min_withdrawal));

    setLoading(false);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = Number(amount);

    if (withdrawAmount < minWithdrawal) {
      setError(`Minimum withdrawal amount is ${formatPrice(minWithdrawal)}`);
      return;
    }

    if (withdrawAmount > balance) {
      setError('Insufficient balance in your wallet.');
      return;
    }

    if (!selectedUpi) {
      setError('Please select or add a UPI ID.');
      return;
    }

    setRequesting(true);
    setError('');

    const { data: { session } } = await supabase.auth.getSession();
    
    const { error: reqError } = await supabase
      .from('skin_marketer_withdrawals')
      .insert({
        skin_marketer_id: session?.user.id,
        skin_amount: withdrawAmount,
        skin_upi_id: selectedUpi,
        skin_status: 'pending'
      });

    if (reqError) {
      console.error('Withdrawal Error:', reqError);
      setError('Failed to process request: ' + reqError.message);
    } else {
      setSuccess(true);
      setAmount('');
      fetchData();
      setTimeout(() => setSuccess(false), 5000);
    }
    setRequesting(false);
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="animate-spin text-accent-gold" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <header>
        <h1 className="text-4xl font-black tracking-tighter text-text-dark uppercase italic">Payout Portal</h1>
        <p className="text-text-muted mt-2 font-medium italic">Securely settle your earnings directly to your UPI wallet.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
           {/* Wallet Card */}
           <div className="bg-text-dark rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
              <Wallet className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10">
                 <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Available Wallet Balance</p>
                    {totalPending > 0 && (
                       <div className="px-3 py-1 bg-accent-gold/20 rounded-lg border border-accent-gold/30">
                          <p className="text-[8px] font-black text-accent-gold uppercase tracking-widest flex items-center gap-2">
                             <Clock size={10} /> {formatPrice(totalPending)} Pending
                          </p>
                       </div>
                    )}
                 </div>
                 <h2 className="text-6xl font-black tracking-tighter mb-10">{formatPrice(balance)}</h2>
                 
                 <div className="flex items-center gap-6">
                    <div className="px-6 py-3 bg-white/10 rounded-2xl flex items-center gap-3">
                       <ShieldCheck className="text-accent-gold" size={18} />
                       <div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Total Payouts</p>
                          <span className="text-xs font-black uppercase tracking-widest text-white/80">{formatPrice(totalPaid)}</span>
                       </div>
                    </div>
                    <div className="px-6 py-3 bg-white/10 rounded-2xl flex items-center gap-3">
                       <History className="text-blue-400" size={18} />
                       <div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Settlement Cycle</p>
                          <span className="text-xs font-black uppercase tracking-widest text-white/80">48h Verification</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Withdraw Form */}
           <section className="bg-white rounded-[3rem] border border-secondary-ivory shadow-sm overflow-hidden">
              <header className="p-8 border-b border-secondary-ivory bg-secondary-ivory/10 flex items-center gap-4">
                 <div className="p-3 bg-white rounded-2xl shadow-sm text-text-dark"><ArrowUpRight size={24} /></div>
                 <div>
                    <h2 className="text-lg font-black text-text-dark uppercase italic">Initiate Withdrawal</h2>
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Submit a settlement request to admin.</p>
                 </div>
              </header>
              <form onSubmit={handleWithdraw} className="p-10 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Select Payout Channel</label>
                       {upis.length > 0 ? (
                          <div className="grid grid-cols-1 gap-3">
                             {upis.map((upi) => (
                                <button 
                                  key={upi.skin_id}
                                  type="button"
                                  onClick={() => setSelectedUpi(upi.skin_upi_id)}
                                  className={`p-5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                                    selectedUpi === upi.skin_upi_id ? 'bg-secondary-ivory border-text-dark' : 'bg-white border-secondary-ivory hover:bg-secondary-ivory/30'
                                  }`}
                                >
                                   <div className="flex items-center gap-4">
                                      <Smartphone size={18} className={selectedUpi === upi.skin_upi_id ? 'text-text-dark' : 'text-text-muted'} />
                                      <span className="text-xs font-black uppercase">{upi.skin_upi_id}</span>
                                   </div>
                                   {selectedUpi === upi.skin_upi_id && <CheckCircle2 size={16} className="text-text-dark" />}
                                </button>
                             ))}
                          </div>
                       ) : (
                          <div className="p-5 bg-red-50 border border-red-100 rounded-2xl text-center">
                             <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3">No UPI ID Configured</p>
                             <button type="button" onClick={() => window.location.href='/marketer/settings'} className="text-[9px] font-black text-text-dark uppercase underline tracking-widest">Go to Settings</button>
                          </div>
                       )}
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Withdrawal Amount (₹)</label>
                       <input 
                         type="number" 
                         value={amount}
                         onChange={(e) => setAmount(e.target.value)}
                         placeholder="Enter Amount"
                         className="w-full h-16 bg-secondary-ivory/50 border-none rounded-[1.5rem] px-8 text-2xl font-black text-text-dark focus:ring-2 focus:ring-accent-gold transition-all"
                       />
                       <p className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-4 italic flex items-center gap-2">
                          <AlertCircle size={12} /> Min. Withdrawal: {formatPrice(minWithdrawal)}
                       </p>
                    </div>
                 </div>

                 {error && (
                    <div className="p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-500">
                       <AlertCircle size={20} />
                       <p className="text-[11px] font-black uppercase tracking-widest">{error}</p>
                    </div>
                 )}

                 {success && (
                    <div className="p-5 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-4 text-green-600">
                       <CheckCircle2 size={20} />
                       <p className="text-[11px] font-black uppercase tracking-widest">Withdrawal request submitted successfully.</p>
                    </div>
                 )}

                 <button 
                   disabled={requesting || upis.length === 0}
                   className="w-full h-18 bg-text-dark text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:bg-accent-gold transition-all shadow-2xl shadow-text-dark/10 disabled:opacity-50 flex items-center justify-center gap-3"
                 >
                    {requesting ? <Loader2 className="animate-spin" size={24} /> : <><Smartphone size={24} /> Transfer to Wallet</>}
                 </button>
              </form>
           </section>
        </div>

        <div className="space-y-10">
           <section className="bg-white rounded-[3rem] border border-secondary-ivory shadow-sm overflow-hidden flex flex-col">
              <header className="p-8 border-b border-secondary-ivory bg-secondary-ivory/10 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <History size={20} className="text-text-muted" />
                    <h2 className="text-sm font-black text-text-dark uppercase italic">Financial Ledger</h2>
                 </div>
              </header>
              <div className="flex-1 divide-y divide-secondary-ivory max-h-[600px] overflow-y-auto">
                 {ledger.length > 0 ? ledger.map((item, idx) => (
                    <div key={idx} className="p-8 flex items-center justify-between hover:bg-secondary-ivory/10 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === 'earning' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                             {item.type === 'earning' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                          </div>
                          <div>
                             <p className="text-sm font-black text-text-dark uppercase tracking-tight">{item.label}</p>
                             <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-0.5">{new Date(item.date).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className={`text-sm font-black ${item.type === 'earning' ? 'text-green-600' : 'text-red-500'}`}>
                             {item.type === 'earning' ? '+' : '-'}{formatPrice(item.amount)}
                          </p>
                          <div className={`mt-1 text-[8px] font-black uppercase tracking-widest ${
                             item.status === 'approved' ? 'text-green-600' :
                             item.status === 'declined' ? 'text-red-500' :
                             'text-blue-600'
                          }`}>
                             {item.status}
                          </div>
                       </div>
                    </div>
                 )) : (
                    <div className="py-20 text-center">
                       <p className="text-[10px] font-black text-text-muted uppercase tracking-widest italic">No prior transactions.</p>
                    </div>
                 )}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}
