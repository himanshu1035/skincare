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
  const [upis, setUpis] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
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
      supabase.from('skin_marketer_commissions').select('skin_commission_earned, skin_bonus_earned, skin_status').eq('skin_marketer_id', session.user.id),
      supabase.from('skin_marketer_upi').select('*').eq('skin_marketer_id', session.user.id),
      supabase.from('skin_marketer_withdrawals').select('*').eq('skin_marketer_id', session.user.id).order('skin_created_at', { ascending: false }),
      supabase.from('skin_marketer_settings').select('skin_min_withdrawal').eq('skin_id', 1).single()
    ]);

    if (commissionsRes.data) {
      // Balance is only from approved/unpaid commissions? 
      // Actually let's assume all approved are part of balance until paid
      // This logic should be hardened later
      const earned = commissionsRes.data.filter(c => c.skin_status === 'approved').reduce((acc, c) => acc + Number(c.skin_commission_earned) + Number(c.skin_bonus_earned), 0);
      const paid = withdrawalsRes.data?.filter(w => w.skin_status === 'approved').reduce((acc, w) => acc + Number(w.skin_amount), 0) || 0;
      setBalance(earned - paid);
    }

    if (upisRes.data) {
      setUpis(upisRes.data);
      const primary = upisRes.data.find(u => u.skin_is_primary);
      if (primary) setSelectedUpi(primary.skin_upi_id);
      else if (upisRes.data.length > 0) setSelectedUpi(upisRes.data[0].skin_upi_id);
    }

    if (withdrawalsRes.data) setWithdrawals(withdrawalsRes.data);
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
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Available for Settlement</p>
                 <h2 className="text-6xl font-black tracking-tighter mb-10">{formatPrice(balance)}</h2>
                 
                 <div className="flex items-center gap-6">
                    <div className="px-6 py-3 bg-white/10 rounded-2xl flex items-center gap-3">
                       <ShieldCheck className="text-accent-gold" size={18} />
                       <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Verified Balance</span>
                    </div>
                    <div className="px-6 py-3 bg-white/10 rounded-2xl flex items-center gap-3">
                       <Clock className="text-blue-400" size={18} />
                       <span className="text-[9px] font-black uppercase tracking-widest text-white/80">48h Processing</span>
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
                    <h2 className="text-sm font-black text-text-dark uppercase italic">Recent Ledger</h2>
                 </div>
              </header>
              <div className="flex-1 divide-y divide-secondary-ivory max-h-[600px] overflow-y-auto">
                 {withdrawals.length > 0 ? withdrawals.map((w) => (
                    <div key={w.skin_id} className="p-8 flex items-center justify-between hover:bg-secondary-ivory/10 transition-colors">
                       <div>
                          <p className="text-sm font-black text-text-dark">{formatPrice(w.skin_amount)}</p>
                          <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-0.5">{new Date(w.skin_created_at).toLocaleDateString()}</p>
                       </div>
                       <div className={`px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          w.skin_status === 'approved' ? 'bg-green-50 text-green-600' :
                          w.skin_status === 'declined' ? 'bg-red-50 text-red-500' :
                          'bg-blue-50 text-blue-600'
                       }`}>
                          {w.skin_status}
                       </div>
                    </div>
                 )) : (
                    <div className="py-20 text-center">
                       <p className="text-[10px] font-black text-text-muted uppercase tracking-widest italic">No prior settlements.</p>
                    </div>
                 )}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}
