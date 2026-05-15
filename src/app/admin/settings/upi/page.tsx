"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Smartphone,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UPIManagementPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newVpa, setNewVpa] = useState('');
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const [globalSettings, setGlobalSettings] = useState({
    primary_upi_id: '',
    primary_upi_name: ''
  });
  const [isSavingGlobal, setIsSavingGlobal] = useState(false);

  useEffect(() => {
    fetchAccounts();
    fetchGlobalUPI();
  }, []);

  const fetchGlobalUPI = async () => {
    const { data } = await supabase.from('skin_settings').select('*').in('skin_key', ['primary_upi_id', 'primary_upi_name']);
    if (data) {
      const settings: any = {};
      data.forEach(s => settings[s.skin_key] = s.skin_value);
      setGlobalSettings({
        primary_upi_id: settings.primary_upi_id || '',
        primary_upi_name: settings.primary_upi_name || ''
      });
    }
  };

  const saveGlobalUPI = async () => {
    setIsSavingGlobal(true);
    const updates = [
      { skin_key: 'primary_upi_id', skin_value: globalSettings.primary_upi_id },
      { skin_key: 'primary_upi_name', skin_value: globalSettings.primary_upi_name }
    ];
    const { error } = await supabase.from('skin_settings').upsert(updates);
    if (!error) alert('Global Payment Config Saved!');
    setIsSavingGlobal(false);
  };

  const fetchAccounts = async () => {
    setLoading(true);
    const { data } = await supabase.from('skin_upi_accounts').select('*').order('skin_created_at', { ascending: false });
    if (data) setAccounts(data);
    setLoading(false);
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVpa.includes('@')) {
      alert('Invalid VPA format. Must include @');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from('skin_upi_accounts').insert([{
      skin_vpa: newVpa.trim(),
      skin_name: newName.trim(),
      skin_is_active: true
    }]);

    if (!error) {
      setNewVpa('');
      setNewName('');
      setIsAdding(false);
      fetchAccounts();
    } else {
      alert(error.message);
    }
    setIsSubmitting(false);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('skin_upi_accounts')
      .update({ skin_is_active: !currentStatus })
      .eq('skin_id', id);
    
    if (!error) {
      setAccounts(accounts.map(a => a.skin_id === id ? { ...a, skin_is_active: !currentStatus } : a));
    }
  };

  const deleteAccount = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this UPI ID?')) return;
    
    const { error } = await supabase.from('skin_upi_accounts').delete().eq('skin_id', id);
    if (!error) {
      setAccounts(accounts.filter(a => a.skin_id !== id));
    }
  };

  return (
    <main className="min-h-screen bg-secondary-ivory/20 p-8 md:p-12 pb-32">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-text-dark tracking-tighter uppercase">Payment Management</h1>
            <p className="text-text-muted text-xs mt-2 font-medium italic">Manage global merchant config and rotation pool.</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="h-14 px-8 bg-text-dark text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-accent-gold transition-all shadow-xl flex items-center gap-3"
          >
            <Plus size={16} /> ADD ROTATION ID
          </button>
        </header>

        {/* Global Config Section */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-secondary-ivory shadow-sm space-y-8">
           <div className="flex items-center gap-4 pb-6 border-b border-secondary-ivory/50">
             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
               <Smartphone size={24} />
             </div>
             <h2 className="text-sm font-black uppercase tracking-widest text-text-dark">Primary Merchant Config</h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4">Primary UPI ID (Fallback)</label>
                <input 
                  type="text"
                  value={globalSettings.primary_upi_id}
                  onChange={(e) => setGlobalSettings({...globalSettings, primary_upi_id: e.target.value})}
                  className="w-full h-14 bg-secondary-ivory/30 border-none rounded-2xl px-6 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none"
                  placeholder="merchant@upi"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4">Primary Display Name</label>
                <input 
                  type="text"
                  value={globalSettings.primary_upi_name}
                  onChange={(e) => setGlobalSettings({...globalSettings, primary_upi_name: e.target.value})}
                  className="w-full h-14 bg-secondary-ivory/30 border-none rounded-2xl px-6 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none"
                  placeholder="COSRX OFFICIAL"
                />
              </div>
           </div>
           
           <div className="flex justify-end">
              <button 
                onClick={saveGlobalUPI}
                disabled={isSavingGlobal}
                className="h-12 px-10 bg-text-dark text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-accent-gold transition-all shadow-md flex items-center gap-3"
              >
                {isSavingGlobal ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                SAVE MERCHANT CONFIG
              </button>
           </div>
        </div>

        {/* Info Card */}
        <div className="bg-accent-gold/5 border border-accent-gold/20 p-8 rounded-[2.5rem] flex items-start gap-6">
          <div className="w-12 h-12 bg-accent-gold text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
            <ShieldCheck size={24} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-black text-text-dark uppercase tracking-widest">Smart Rotation pool</h3>
            <p className="text-xs text-text-muted font-medium leading-relaxed italic">
              When a customer pays via UPI, the system will prioritize a <span className="text-accent-gold font-bold">random active account</span> from the pool below. If the pool is empty or disabled, it will default to your <span className="text-blue-600 font-bold">Primary Merchant Config</span> above.
            </p>
          </div>
        </div>

        {/* Accounts List */}
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode='popLayout'>
            {loading ? (
              <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-accent-gold" size={40} /></div>
            ) : accounts.length > 0 ? (
              accounts.map((account) => (
                <motion.div 
                  key={account.skin_id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white p-8 rounded-[2.5rem] border transition-all flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm hover:shadow-md ${account.skin_is_active ? 'border-secondary-ivory' : 'border-red-100 opacity-60'}`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-inner ${account.skin_is_active ? 'bg-secondary-ivory text-text-dark' : 'bg-red-50 text-red-300'}`}>
                      <Smartphone size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-text-dark tracking-tight uppercase">{account.skin_vpa}</h3>
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">{account.skin_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleStatus(account.skin_id, account.skin_is_active)}
                      className={`px-6 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${account.skin_is_active ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                    >
                      {account.skin_is_active ? <><CheckCircle2 size={14} /> ACTIVE</> : <><XCircle size={14} /> INACTIVE</>}
                    </button>
                    <button 
                      onClick={() => deleteAccount(account.skin_id)}
                      className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-secondary-ivory">
                <AlertCircle className="mx-auto text-text-muted mb-6 opacity-20" size={64} />
                <h3 className="text-xl font-black text-text-dark uppercase tracking-tighter mb-2">No UPI Accounts Found</h3>
                <p className="text-xs font-medium text-text-muted italic">Add at least one UPI ID to enable customer payments.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-secondary-ivory p-10"
            >
              <h2 className="text-2xl font-black tracking-tighter text-text-dark mb-8 uppercase">Add UPI Account</h2>
              <form onSubmit={handleAddAccount} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4">Account Holder Name</label>
                  <input 
                    type="text" 
                    required 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. COSRX OFFICIAL"
                    className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl px-6 text-xs font-bold focus:ring-2 focus:ring-accent-gold outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4">UPI VPA ID</label>
                  <input 
                    type="text" 
                    required 
                    value={newVpa}
                    onChange={(e) => setNewVpa(e.target.value)}
                    placeholder="e.g. merchant@upi"
                    className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl px-6 text-xs font-bold focus:ring-2 focus:ring-accent-gold outline-none"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsAdding(false)}
                    className="flex-1 h-14 bg-secondary-ivory text-text-dark rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 h-14 bg-text-dark text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-accent-gold transition-all shadow-lg flex items-center justify-center"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'SAVE ACCOUNT'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
