"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  User, 
  CreditCard, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Loader2,
  ShieldCheck,
  Smartphone,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarketerSettings() {
  const [loading, setLoading] = useState(true);
  const [upis, setUpis] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUpi, setNewUpi] = useState('');
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchUpis();
  }, []);

  const fetchUpis = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from('skin_marketer_upi')
      .select('*')
      .eq('skin_marketer_id', session.user.id)
      .order('skin_created_at', { ascending: false });

    if (data) setUpis(data);
    setLoading(false);
  };

  const handleAddUpi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpi.includes('@')) return;

    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    const { error } = await supabase
      .from('skin_marketer_upi')
      .insert({
        skin_marketer_id: session?.user.id,
        skin_upi_id: newUpi,
        skin_is_primary: upis.length === 0
      });

    if (!error) {
      setNewUpi('');
      setIsModalOpen(false);
      fetchUpis();
    }
    setSaving(false);
  };

  const handleDeleteUpi = async (id: string) => {
    const { error } = await supabase
      .from('skin_marketer_upi')
      .delete()
      .eq('skin_id', id);

    if (!error) fetchUpis();
  };

  const setPrimary = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Reset all
    await supabase
      .from('skin_marketer_upi')
      .update({ skin_is_primary: false })
      .eq('skin_marketer_id', session?.user.id);

    // Set primary
    await supabase
      .from('skin_marketer_upi')
      .update({ skin_is_primary: true })
      .eq('skin_id', id);

    fetchUpis();
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="animate-spin text-accent-gold" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header>
        <h1 className="text-4xl font-black tracking-tighter text-text-dark uppercase italic">Settlement Settings</h1>
        <p className="text-text-muted mt-2 font-medium italic">Manage your UPI IDs and financial security protocols.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
           <section className="bg-white rounded-[3rem] border border-secondary-ivory shadow-sm overflow-hidden">
              <header className="p-8 border-b border-secondary-ivory bg-secondary-ivory/10 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-accent-gold"><Smartphone size={24} /></div>
                    <div>
                       <h2 className="text-lg font-black text-text-dark uppercase italic">UPI Wallet</h2>
                       <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Saved VPA handles for payouts.</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => setIsModalOpen(true)}
                   className="w-10 h-10 rounded-full bg-text-dark text-white flex items-center justify-center hover:bg-accent-gold transition-all"
                 >
                   <Plus size={20} />
                 </button>
              </header>

              <div className="p-8 space-y-4">
                 {upis.length > 0 ? upis.map((upi) => (
                    <div 
                      key={upi.skin_id}
                      className={`p-6 rounded-[2rem] border transition-all flex items-center justify-between group ${
                        upi.skin_is_primary ? 'bg-secondary-ivory/30 border-accent-gold/30' : 'bg-white border-secondary-ivory'
                      }`}
                    >
                       <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${upi.skin_is_primary ? 'bg-accent-gold text-white' : 'bg-secondary-ivory text-text-muted'}`}>
                             <CreditCard size={20} />
                          </div>
                          <div>
                             <p className="text-sm font-black text-text-dark uppercase tracking-tight">{upi.skin_upi_id}</p>
                             <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                                {upi.skin_is_primary ? 'Primary Settlement ID' : 'Alternative Channel'}
                             </p>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          {!upi.skin_is_primary && (
                            <button 
                              onClick={() => setPrimary(upi.skin_id)}
                              className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-text-muted hover:text-text-dark transition-all"
                            >
                               Set Primary
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteUpi(upi.skin_id)}
                            className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-100"
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                    </div>
                 )) : (
                    <div className="py-12 text-center">
                       <p className="text-[10px] font-black text-text-muted uppercase tracking-widest italic">No UPI handles configured.</p>
                    </div>
                 )}
              </div>
           </section>

           <section className="bg-text-dark rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <ShieldCheck className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5 group-hover:scale-110 transition-transform duration-700" />
              <h3 className="text-2xl font-black uppercase tracking-widest mb-4 italic">Security Guard</h3>
              <p className="text-white/60 text-sm font-medium mb-8 leading-relaxed italic">
                 All settlement data is encrypted and used exclusively for automated payout clearing. Ensure your UPI ID is linked to your verified bank account.
              </p>
              <div className="flex items-center gap-3 px-6 py-3 bg-white/10 rounded-full w-fit">
                 <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Encrypted Settlement Active</span>
              </div>
           </section>
        </div>

        <div className="space-y-8">
           <div className="bg-white rounded-[3rem] p-10 border border-secondary-ivory shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-secondary-ivory flex items-center justify-center text-text-dark mb-6">
                 <Info size={24} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-widest text-text-dark mb-4 italic">Payout Protocol</h3>
              <ul className="space-y-4">
                 {[
                   'Weekly automated clearing',
                   'Minimum ₹500 balance',
                   'Instant verification',
                   'Direct bank settlement'
                 ].map((text, i) => (
                    <li key={i} className="flex items-center gap-3 text-[10px] font-black text-text-muted uppercase tracking-widest">
                       <CheckCircle2 size={14} className="text-green-500" /> {text}
                    </li>
                 ))}
              </ul>
           </div>
        </div>
      </div>

      {/* Add UPI Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 border border-secondary-ivory">
               <h2 className="text-2xl font-black tracking-tighter text-text-dark uppercase italic mb-8">Register UPI VPA</h2>
               <form onSubmit={handleAddUpi} className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">VPA Address (e.g. name@bank)</label>
                     <input 
                       required
                       autoFocus
                       placeholder="yourname@okaxis"
                       value={newUpi}
                       onChange={(e) => setNewUpi(e.target.value)}
                       className="w-full h-16 bg-secondary-ivory/30 border-none rounded-2xl px-6 text-lg font-black text-text-dark outline-none focus:ring-2 focus:ring-accent-gold transition-all"
                     />
                  </div>
                  <button 
                    disabled={saving}
                    className="w-full h-16 bg-text-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent-gold transition-all shadow-xl shadow-text-dark/10 flex items-center justify-center gap-3"
                  >
                     {saving ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20} /> Add Payout Channel</>}
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
