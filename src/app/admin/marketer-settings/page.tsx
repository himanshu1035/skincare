"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Settings, 
  Save, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Percent, 
  Ticket, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Info,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminMarketerSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('skin_marketer_settings')
      .select('*')
      .eq('skin_id', 1)
      .single();
    
    if (data) {
      setSettings(data);
      if (data.skin_tiered_rules) {
        setTieredRules(data.skin_tiered_rules);
      }
    }
    setLoading(false);
  };

  const [tieredRules, setTieredRules] = useState([
    { level: 'Bronze', sales: 0, commission: 5, discount: 5 },
    { level: 'Silver', sales: 50, commission: 7, discount: 10 },
    { level: 'Gold', sales: 200, commission: 10, discount: 10 },
    { level: 'Platinum', sales: 500, commission: 12, discount: 15 },
    { level: 'Diamond', sales: 1000, commission: 15, discount: 15 }
  ]);

  const handleSave = async () => {
    setSaving(true);
    
    // 1. Save global settings
    const { error: settingsError } = await supabase
      .from('skin_marketer_settings')
      .update({
        skin_is_one_time_use: settings.skin_is_one_time_use,
        skin_code_length: settings.skin_code_length,
        skin_coupon_duration_days: settings.skin_coupon_duration_days || 30,
        skin_default_commission: settings.skin_default_commission || 5,
        skin_default_discount: settings.skin_default_discount || 10,
        skin_min_checkout_value: settings.skin_min_checkout_value || 0,
        skin_min_withdrawal: settings.skin_min_withdrawal || 500,
        skin_tiered_rules: tieredRules,
        skin_updated_at: new Date().toISOString()
      })
      .eq('skin_id', 1);

    if (settingsError) {
      setMessage({ type: 'error', text: 'Failed to update global settings.' });
      setSaving(false);
      return;
    }

    // 2. Propagate rules to all marketers by level
    try {
      await Promise.all(tieredRules.map(rule => 
        supabase
          .from('skin_marketers')
          .update({
            skin_commission_percent: rule.commission,
            skin_default_discount: rule.discount
          })
          .eq('skin_level', rule.level)
      ));
      
      setMessage({ type: 'success', text: 'Rules updated and propagated to all partners.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Global rules saved, but failed to propagate to some partners.' });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-accent-gold" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Synchronizing Global Rules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 max-w-4xl">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-dark tracking-tighter uppercase italic">Network Governance</h1>
          <p className="text-text-muted text-xs mt-2 font-medium italic">Define the global operating principles for your marketing partner network.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="h-14 px-10 rounded-full bg-text-dark text-white font-black text-xs tracking-widest uppercase flex items-center gap-3 hover:bg-accent-gold transition-all shadow-xl disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save All Rules
        </button>
      </header>

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-6 rounded-[2rem] border flex items-center gap-4 ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}
          >
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="text-xs font-black uppercase tracking-widest">{message.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-8">
        {/* Global Network Primaries */}
        <section className="bg-white rounded-[3rem] border border-secondary-ivory shadow-sm overflow-hidden">
           <header className="p-8 border-b border-secondary-ivory bg-secondary-ivory/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-accent-gold"><Zap size={24} /></div>
                <div>
                  <h2 className="text-lg font-black text-text-dark uppercase italic">Global Network Primaries</h2>
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Define universal baseline rules for all partners.</p>
                </div>
              </div>
              <button 
                onClick={handleSave}
                className="h-10 px-6 bg-text-dark text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-accent-gold transition-all"
              >
                 Apply Global Protocol
              </button>
           </header>
           <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Default Commission (%)</label>
                 <input 
                   type="number" 
                   value={settings?.skin_default_commission || 5}
                   onChange={(e) => setSettings({...settings, skin_default_commission: e.target.value})}
                   className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl px-6 text-sm font-bold text-text-dark outline-none focus:ring-2 focus:ring-accent-gold transition-all"
                 />
              </div>
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Default Customer Discount (%)</label>
                 <input 
                   type="number" 
                   value={settings?.skin_default_discount || 10}
                   onChange={(e) => setSettings({...settings, skin_default_discount: e.target.value})}
                   className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl px-6 text-sm font-bold text-text-dark outline-none focus:ring-2 focus:ring-accent-gold transition-all"
                 />
              </div>
           </div>
        </section>

        {/* Network Guardrails */}
        <section className="bg-white rounded-[3rem] border border-secondary-ivory shadow-sm overflow-hidden">
           <header className="p-8 border-b border-secondary-ivory bg-secondary-ivory/10 flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-text-dark"><ShieldCheck size={24} /></div>
              <div>
                <h2 className="text-lg font-black text-text-dark uppercase italic">Network Guardrails</h2>
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Define technical constraints for all affiliate coupons.</p>
              </div>
           </header>
           <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Coupon Code Length</label>
                 <div className="relative">
                    <input 
                      type="number" 
                      value={settings?.skin_code_length || 8}
                      onChange={(e) => setSettings({...settings, skin_code_length: e.target.value})}
                      className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl px-6 text-sm font-bold text-text-dark outline-none focus:ring-2 focus:ring-accent-gold transition-all"
                    />
                 </div>
              </div>
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Min. Checkout Value (₹)</label>
                 <input 
                   type="number" 
                   value={settings?.skin_min_checkout_value || 0}
                   onChange={(e) => setSettings({...settings, skin_min_checkout_value: e.target.value})}
                   className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl px-6 text-sm font-bold text-text-dark outline-none focus:ring-2 focus:ring-accent-gold transition-all"
                 />
              </div>
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Usage Scarcity</label>
                 <button 
                   onClick={() => setSettings({...settings, skin_is_one_time_use: !settings?.skin_is_one_time_use})}
                   className={`w-full h-14 rounded-2xl px-6 flex items-center justify-between transition-all ${
                     settings?.skin_is_one_time_use ? 'bg-text-dark text-white' : 'bg-secondary-ivory/50 text-text-dark'
                   }`}
                 >
                    <span className="text-[10px] font-black uppercase tracking-widest">One-Time Use Only</span>
                    {settings?.skin_is_one_time_use ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                 </button>
              </div>
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Coupon Validity (Days)</label>
                 <div className="relative">
                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input 
                      type="number" 
                      value={settings?.skin_coupon_duration_days || 30}
                      onChange={(e) => setSettings({...settings, skin_coupon_duration_days: e.target.value})}
                      className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl pl-16 pr-8 text-sm font-bold text-text-dark outline-none focus:ring-2 focus:ring-accent-gold transition-all"
                    />
                 </div>
              </div>
           </div>
        </section>

        {/* Financial Payout Policy */}
        <section className="bg-white rounded-[3rem] border border-secondary-ivory shadow-sm overflow-hidden">
           <header className="p-8 border-b border-secondary-ivory bg-secondary-ivory/10 flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-green-600"><Percent size={24} /></div>
              <div>
                <h2 className="text-lg font-black text-text-dark uppercase italic">Financial Payout Policy</h2>
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Define the thresholds for partner settlements.</p>
              </div>
           </header>
           <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Min. Payout Threshold (₹)</label>
                 <div className="relative">
                    <Info className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input 
                      type="number" 
                      value={settings?.skin_min_withdrawal || 500}
                      onChange={(e) => setSettings({...settings, skin_min_withdrawal: e.target.value})}
                      className="w-full h-16 bg-secondary-ivory/50 border-none rounded-[1.5rem] pl-16 pr-8 text-lg font-black text-text-dark focus:ring-2 focus:ring-accent-gold transition-all"
                    />
                 </div>
                 <p className="text-[8px] font-medium text-text-muted italic ml-4">Marketers cannot request withdrawals below this verified balance amount.</p>
              </div>
           </div>
        </section>

        {/* Tiered Progression */}
        <section className="bg-white rounded-[3rem] border border-secondary-ivory shadow-sm overflow-hidden">
           <header className="p-8 border-b border-secondary-ivory bg-secondary-ivory/10 flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-accent-gold"><BarChart3 size={24} /></div>
              <div>
                <h2 className="text-lg font-black text-text-dark uppercase italic">Tiered Progression</h2>
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Define performance-based levels and rewards.</p>
              </div>
           </header>
           <div className="p-10 overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b border-secondary-ivory">
                       <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Tier Level</th>
                       <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Sales Threshold</th>
                       <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Commission (%)</th>
                       <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Discount (%)</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-secondary-ivory">
                    {tieredRules.map((rule, idx) => (
                       <tr key={idx} className="group">
                          <td className="py-6 font-black text-text-dark uppercase tracking-tight">{rule.level}</td>
                          <td className="py-6">
                             <input 
                               type="number" 
                               value={rule.sales} 
                               onChange={(e) => {
                                 const newRules = [...tieredRules];
                                 newRules[idx].sales = parseInt(e.target.value);
                                 setTieredRules(newRules);
                               }}
                               className="w-24 h-10 bg-secondary-ivory/50 border-none rounded-xl px-3 text-xs font-bold outline-none"
                             />
                          </td>
                          <td className="py-6">
                             <input 
                               type="number" 
                               value={rule.commission} 
                               onChange={(e) => {
                                 const newRules = [...tieredRules];
                                 newRules[idx].commission = parseInt(e.target.value);
                                 setTieredRules(newRules);
                               }}
                               className="w-24 h-10 bg-secondary-ivory/50 border-none rounded-xl px-3 text-xs font-bold outline-none"
                             />
                          </td>
                          <td className="py-6">
                             <input 
                               type="number" 
                               value={rule.discount} 
                               onChange={(e) => {
                                 const newRules = [...tieredRules];
                                 newRules[idx].discount = parseInt(e.target.value);
                                 setTieredRules(newRules);
                               }}
                               className="w-24 h-10 bg-secondary-ivory/50 border-none rounded-xl px-3 text-xs font-bold outline-none"
                             />
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </section>

      </div>
    </div>
  );
}
