"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  DollarSign, 
  Search, 
  MoreVertical, 
  Edit2, 
  Ban, 
  CheckCircle2, 
  ChevronRight,
  Target,
  BarChart3,
  Loader2,
  Phone,
  Mail,
  ShieldCheck,
  X,
  Settings2,
  Globe,
  AlertTriangle,
  Zap,
  Trash2,
  Ticket,
  ExternalLink,
  ShoppingBag
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminMarketersPage() {
  const [marketers, setMarketers] = useState<any[]>([]);
  const [globalSettings, setGlobalSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingMarketer, setEditingMarketer] = useState<any>(null);
  const [selectedMarketer, setSelectedMarketer] = useState<any>(null);
  const [marketerCoupons, setMarketerCoupons] = useState<any[]>([]);
  const [marketerSales, setMarketerSales] = useState<any[]>([]);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    commission: 5,
    bonus: 0,
    defaultDiscount: 10,
    validityDays: 30,
    isOneTimeUse: false,
    codeLength: 10
  });

  const [globalFormData, setGlobalFormData] = useState({
    defaultDiscount: 10,
    validityDays: 30,
    isOneTimeUse: false,
    codeLength: 10,
    defaultCommission: 5
  });

  useEffect(() => {
    fetchMarketers();
    fetchGlobalSettings();
  }, []);

  const fetchGlobalSettings = async () => {
    const { data } = await supabase.from('skin_marketer_settings').select('*').eq('skin_id', 1).single();
    if (data) {
      setGlobalSettings(data);
      setGlobalFormData({
        defaultDiscount: data.skin_default_discount,
        validityDays: data.skin_coupon_duration_days,
        isOneTimeUse: data.skin_is_one_time_use,
        codeLength: data.skin_code_length,
        defaultCommission: data.skin_default_commission
      });
      if (!editingMarketer) {
        setFormData(prev => ({
          ...prev,
          commission: data.skin_default_commission,
          defaultDiscount: data.skin_default_discount,
          validityDays: data.skin_coupon_duration_days,
          isOneTimeUse: data.skin_is_one_time_use,
          codeLength: data.skin_code_length
        }));
      }
    }
  };

  useEffect(() => {
    if (editingMarketer) {
      setFormData({
        name: editingMarketer.skin_name,
        email: editingMarketer.skin_email,
        phone: editingMarketer.skin_phone || '',
        password: '',
        commission: editingMarketer.skin_commission_percent,
        bonus: editingMarketer.skin_fixed_bonus,
        defaultDiscount: editingMarketer.skin_default_discount || 10,
        validityDays: editingMarketer.skin_coupon_duration_days || 30,
        isOneTimeUse: editingMarketer.skin_is_one_time_use || false,
        codeLength: editingMarketer.skin_code_length || 10
      });
      setIsModalOpen(true);
    }
  }, [editingMarketer]);

  const fetchMarketers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('skin_marketers')
      .select(`
        *,
        skin_marketer_commissions (skin_commission_earned, skin_bonus_earned, skin_order_amount)
      `)
      .order('skin_created_at', { ascending: false });

    if (data) {
      const processed = data.map(m => ({
        ...m,
        totalEarnings: m.skin_marketer_commissions?.reduce((acc: number, c: any) => acc + Number(c.skin_commission_earned) + Number(c.skin_bonus_earned), 0) || 0,
        totalRevenue: m.skin_marketer_commissions?.reduce((acc: number, c: any) => acc + Number(c.skin_order_amount), 0) || 0,
        saleCount: m.skin_marketer_commissions?.length || 0
      }));
      setMarketers(processed);
    }
    setLoading(false);
  };

  const handleSaveGlobalSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from('skin_marketer_settings')
      .update({
        skin_default_discount: globalFormData.defaultDiscount,
        skin_coupon_duration_days: globalFormData.validityDays,
        skin_is_one_time_use: globalFormData.isOneTimeUse,
        skin_code_length: globalFormData.codeLength,
        skin_default_commission: globalFormData.defaultCommission
      })
      .eq('skin_id', 1);

    if (!error) {
      alert("Global settings saved! New marketers will inherit these values.");
      fetchGlobalSettings();
      setIsGlobalModalOpen(false);
    }
    setLoading(false);
  };

  const handleApplyGlobalToAll = async () => {
    if (!confirm("This will overwrite individual settings for ALL active marketers. Are you sure?")) return;
    setLoading(true);
    const { error } = await supabase
      .from('skin_marketers')
      .update({
        skin_commission_percent: globalFormData.defaultCommission,
        skin_default_discount: globalFormData.defaultDiscount,
        skin_coupon_duration_days: globalFormData.validityDays,
        skin_is_one_time_use: globalFormData.isOneTimeUse,
        skin_code_length: globalFormData.codeLength
      });
    if (!error) {
      alert("Applied global settings to all marketers successfully!");
      fetchMarketers();
    }
    setLoading(false);
  };

  const handleSaveMarketer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingMarketer) {
        const { error } = await supabase
          .from('skin_marketers')
          .update({
            skin_name: formData.name,
            skin_phone: formData.phone,
            skin_commission_percent: formData.commission,
            skin_fixed_bonus: formData.bonus,
            skin_default_discount: formData.defaultDiscount,
            skin_coupon_duration_days: formData.validityDays,
            skin_is_one_time_use: formData.isOneTimeUse,
            skin_code_length: formData.codeLength
          })
          .eq('skin_id', editingMarketer.skin_id);
        if (error) throw error;
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { data: { role: 'marketer' } }
        });
        if (authError) throw authError;
        const { error: profileError } = await supabase
          .from('skin_marketers')
          .insert({
            skin_id: authData.user!.id,
            skin_name: formData.name,
            skin_email: formData.email,
            skin_phone: formData.phone,
            skin_commission_percent: formData.commission,
            skin_fixed_bonus: formData.bonus,
            skin_default_discount: formData.defaultDiscount,
            skin_coupon_duration_days: formData.validityDays,
            skin_is_one_time_use: formData.isOneTimeUse,
            skin_code_length: formData.codeLength,
            skin_is_active: true
          });
        if (profileError) throw profileError;
      }
      setIsModalOpen(false);
      setEditingMarketer(null);
      fetchMarketers();
    } catch (err: any) {
      alert("Action Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('skin_marketers')
      .update({ skin_is_active: !currentStatus })
      .eq('skin_id', id);
    if (!error) fetchMarketers();
  };

  const handleDeleteMarketer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this marketer account? This cannot be undone.")) return;
    setLoading(true);
    const { error } = await supabase.from('skin_marketers').delete().eq('skin_id', id);
    if (!error) fetchMarketers();
    setLoading(false);
  };

  const openMarketerDetails = async (marketer: any) => {
    setSelectedMarketer(marketer);
    setIsDetailsOpen(true);
    setLoading(true);
    const [couponsRes, salesRes] = await Promise.all([
      supabase.from('skin_marketer_coupons').select('*').eq('skin_marketer_id', marketer.skin_id),
      supabase.from('skin_marketer_commissions').select('*, skin_orders(*)').eq('skin_marketer_id', marketer.skin_id)
    ]);
    if (couponsRes.data) setMarketerCoupons(couponsRes.data);
    if (salesRes.data) setMarketerSales(salesRes.data);
    setLoading(false);
  };

  const filteredMarketers = marketers.filter(m => 
    m.skin_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.skin_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-24">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-text-dark uppercase italic">Affiliate Network</h1>
          <p className="text-text-muted mt-2 font-medium italic">Manage assigned marketers and universal promotional policies.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsGlobalModalOpen(true)}
            className="h-14 px-8 rounded-full bg-secondary-ivory text-text-dark font-black text-xs tracking-widest uppercase flex items-center gap-3 hover:bg-text-dark hover:text-white transition-all shadow-sm"
          >
            <Globe size={18} /> Global Rules
          </button>
          <button 
            onClick={() => { setEditingMarketer(null); setIsModalOpen(true); }}
            className="h-14 px-10 rounded-full bg-text-dark text-white font-black text-xs tracking-widest uppercase flex items-center gap-3 hover:bg-accent-gold transition-all shadow-xl shadow-text-dark/10"
          >
            <UserPlus size={18} /> Add New
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Marketers', value: marketers.length, icon: <Users size={20} />, color: 'bg-blue-50 text-blue-600' },
          { label: 'Network Revenue', value: formatPrice(marketers.reduce((acc, m) => acc + m.totalRevenue, 0)), icon: <TrendingUp size={20} />, color: 'bg-green-50 text-green-600' },
          { label: 'Total Payouts', value: formatPrice(marketers.reduce((acc, m) => acc + m.totalEarnings, 0)), icon: <DollarSign size={20} />, color: 'bg-accent-gold/10 text-accent-gold' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-secondary-ivory shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-text-muted border border-secondary-ivory px-2 py-1 rounded-full">30 Days</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-text-dark tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Marketers Table */}
      <div className="bg-white rounded-[3rem] border border-secondary-ivory shadow-sm overflow-hidden">
        <div className="p-8 border-b border-secondary-ivory flex flex-col md:flex-row items-center gap-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input 
                type="text" 
                placeholder="Search marketers..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-14 bg-secondary-ivory/30 border-none rounded-2xl pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none"
              />
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-secondary-ivory bg-secondary-ivory/30">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Profile</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Earnings</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Active Policy</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-ivory">
              {loading ? (
                <tr><td colSpan={4} className="px-8 py-20 text-center"><Loader2 className="animate-spin text-accent-gold mx-auto" /></td></tr>
              ) : filteredMarketers.map((m) => (
                <tr key={m.skin_id} className="hover:bg-secondary-ivory/10 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-text-dark flex items-center justify-center text-white font-black text-xs uppercase">{m.skin_name[0]}</div>
                      <div>
                        <p className="text-sm font-black text-text-dark uppercase">{m.skin_name}</p>
                        <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest">{m.skin_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-sm font-black text-text-dark">{formatPrice(m.totalEarnings)}</p>
                      <p className="text-[9px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1"><Target size={10}/> {m.saleCount} Conversions</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[8px] font-black uppercase">C: {m.skin_commission_percent}%</span>
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-[8px] font-black uppercase">D: {m.skin_default_discount}%</span>
                      </div>
                      <p className="text-[9px] font-black text-text-muted uppercase italic">{m.skin_coupon_duration_days}d · {m.skin_is_one_time_use ? 'Single' : 'Multi'} · {m.skin_code_length}ch</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openMarketerDetails(m)} className="p-3 bg-secondary-ivory rounded-xl hover:bg-accent-gold hover:text-white transition-all shadow-sm" title="Detailed Analytics"><BarChart3 size={14}/></button>
                      <button onClick={() => setEditingMarketer(m)} className="p-3 bg-secondary-ivory rounded-xl hover:bg-text-dark hover:text-white transition-all shadow-sm" title="Edit Profile"><Edit2 size={14}/></button>
                      <button onClick={() => toggleStatus(m.skin_id, m.skin_is_active)} className={`p-3 rounded-xl transition-all shadow-sm ${m.skin_is_active ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`} title={m.skin_is_active ? 'Suspend' : 'Activate'}>
                        {m.skin_is_active ? <Ban size={14}/> : <CheckCircle2 size={14}/>}
                      </button>
                      <button onClick={() => handleDeleteMarketer(m.skin_id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm" title="Delete Permanent"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal (Stats & Coupons) */}
      <AnimatePresence>
        {isDetailsOpen && selectedMarketer && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDetailsOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl p-12 border border-secondary-ivory max-h-[90vh] overflow-y-auto custom-scrollbar">
              <header className="flex items-center justify-between mb-12">
                <div>
                   <h2 className="text-3xl font-black tracking-tighter text-text-dark uppercase italic">Affiliate Performance: {selectedMarketer.skin_name}</h2>
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Detailed audit of coupons and attributed sales.</p>
                </div>
                <button onClick={() => setIsDetailsOpen(false)} className="w-12 h-12 rounded-full bg-secondary-ivory flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><X size={24}/></button>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 {/* Coupons Section */}
                 <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                       <Ticket size={16} className="text-accent-gold" /> Generated Coupons
                    </h3>
                    <div className="space-y-4">
                       {marketerCoupons.map(c => (
                         <div key={c.skin_id} className="p-6 bg-secondary-ivory/30 rounded-[2rem] border border-secondary-ivory flex items-center justify-between group">
                            <div>
                               <p className="text-sm font-black text-text-dark tracking-widest uppercase">{c.skin_code}</p>
                               <p className="text-[9px] text-text-muted font-bold uppercase mt-1 italic">D: {c.skin_discount_percent}% · Exp: {new Date(c.skin_expiry_date).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${c.skin_is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                               {c.skin_is_active ? 'Live' : 'Expired'}
                            </span>
                         </div>
                       ))}
                       {marketerCoupons.length === 0 && <p className="text-[10px] text-text-muted italic uppercase">No coupons generated yet.</p>}
                    </div>
                 </div>

                 {/* Sales Section */}
                 <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                       <ShoppingBag size={16} className="text-blue-500" /> Attributed Sales
                    </h3>
                    <div className="space-y-4">
                       {marketerSales.map(s => (
                         <div key={s.skin_id} className="p-6 bg-white rounded-[2rem] border border-secondary-ivory shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><Users size={14}/></div>
                               <div>
                                  <p className="text-[11px] font-black text-text-dark uppercase">Sale #{(s.skin_order_id || '').slice(0,8)}</p>
                                  <p className="text-[9px] text-text-muted font-bold uppercase">{new Date(s.skin_created_at).toLocaleDateString()}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-[11px] font-black text-text-dark">{formatPrice(s.skin_order_amount)}</p>
                               <p className="text-[9px] font-black text-accent-gold uppercase mt-1">Earned: +{formatPrice(Number(s.skin_commission_earned) + Number(s.skin_bonus_earned))}</p>
                            </div>
                         </div>
                       ))}
                       {marketerSales.length === 0 && <p className="text-[10px] text-text-muted italic uppercase">No attributed sales recorded.</p>}
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Settings Modal */}
      <AnimatePresence>
        {isGlobalModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsGlobalModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 border border-secondary-ivory">
              <header className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter text-text-dark uppercase italic flex items-center gap-2">
                    <Globe size={24} className="text-accent-gold" /> Global Policies
                  </h2>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Enforce universal rules across the network.</p>
                </div>
                <button onClick={() => setIsGlobalModalOpen(false)} className="w-10 h-10 rounded-full bg-secondary-ivory flex items-center justify-center"><X size={20}/></button>
              </header>

              <form className="space-y-6" onSubmit={handleSaveGlobalSettings}>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Commission % (of Discount)</label>
                      <input type="number" value={globalFormData.defaultCommission} onChange={(e) => setGlobalFormData({...globalFormData, defaultCommission: parseInt(e.target.value)})} className="w-full h-12 bg-secondary-ivory/30 border-none rounded-xl px-4 text-xs font-bold outline-none" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Default Discount %</label>
                      <input type="number" value={globalFormData.defaultDiscount} onChange={(e) => setGlobalFormData({...globalFormData, defaultDiscount: parseInt(e.target.value)})} className="w-full h-12 bg-secondary-ivory/30 border-none rounded-xl px-4 text-xs font-bold outline-none" />
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Activation (Days)</label>
                      <input type="number" value={globalFormData.validityDays} onChange={(e) => setGlobalFormData({...globalFormData, validityDays: parseInt(e.target.value)})} className="w-full h-12 bg-secondary-ivory/30 border-none rounded-xl px-4 text-xs font-bold outline-none" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Code Length</label>
                      <input type="number" min={4} max={16} value={globalFormData.codeLength} onChange={(e) => setGlobalFormData({...globalFormData, codeLength: parseInt(e.target.value)})} className="w-full h-12 bg-secondary-ivory/30 border-none rounded-xl px-4 text-xs font-bold outline-none" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Usage Limit</label>
                      <select value={globalFormData.isOneTimeUse ? 'one-time' : 'unlimited'} onChange={(e) => setGlobalFormData({...globalFormData, isOneTimeUse: e.target.value === 'one-time'})} className="w-full h-12 bg-secondary-ivory/30 border-none rounded-xl px-4 text-xs font-bold outline-none">
                         <option value="unlimited">Unlimited</option>
                         <option value="one-time">Single Use</option>
                      </select>
                   </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                   <button type="submit" className="h-14 bg-text-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent-gold transition-all">Save Global Defaults</button>
                   <button 
                    type="button" 
                    onClick={handleApplyGlobalToAll}
                    className="h-14 bg-red-50 text-red-500 border border-red-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                   >
                     <Zap size={16} /> Apply Rules to ALL Marketers
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Individual/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsModalOpen(false); setEditingMarketer(null); }} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 border border-secondary-ivory overflow-hidden">
               <header className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter text-text-dark uppercase italic">{editingMarketer ? 'Update Profile' : 'New Affiliate'}</h2>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Configure profile and promotional rules.</p>
                  </div>
                  <button onClick={() => { setIsModalOpen(false); setEditingMarketer(null); }} className="w-10 h-10 rounded-full bg-secondary-ivory flex items-center justify-center"><X size={20}/></button>
               </header>
               <form className="space-y-6" onSubmit={handleSaveMarketer}>
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-12 bg-secondary-ivory/30 border-none rounded-xl px-4 text-xs font-bold outline-none" />
                    <input required placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="h-12 bg-secondary-ivory/30 border-none rounded-xl px-4 text-xs font-bold outline-none" />
                  </div>
                  {!editingMarketer && (
                    <div className="grid grid-cols-2 gap-4">
                      <input required placeholder="Email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="h-12 bg-secondary-ivory/30 border-none rounded-xl px-4 text-xs font-bold outline-none" />
                      <input required placeholder="Password" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="h-12 bg-secondary-ivory/30 border-none rounded-xl px-4 text-xs font-bold outline-none" />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[8px] font-black uppercase text-text-muted ml-1">Commission % (of Discount)</label><input type="number" value={formData.commission} onChange={(e) => setFormData({...formData, commission: parseInt(e.target.value)})} className="w-full h-12 bg-secondary-ivory/30 border-none rounded-xl px-4 text-xs font-bold outline-none" /></div>
                    <div className="space-y-1"><label className="text-[8px] font-black uppercase text-text-muted ml-1">Discount %</label><input type="number" value={formData.defaultDiscount} onChange={(e) => setFormData({...formData, defaultDiscount: parseInt(e.target.value)})} className="w-full h-12 bg-secondary-ivory/30 border-none rounded-xl px-4 text-xs font-bold outline-none" /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1"><label className="text-[8px] font-black uppercase text-text-muted ml-1">Duration (d)</label><input type="number" value={formData.validityDays} onChange={(e) => setFormData({...formData, validityDays: parseInt(e.target.value)})} className="w-full h-12 bg-secondary-ivory/30 border-none rounded-xl px-4 text-xs font-bold outline-none" /></div>
                    <div className="space-y-1"><label className="text-[8px] font-black uppercase text-text-muted ml-1">Length</label><input type="number" value={formData.codeLength} onChange={(e) => setFormData({...formData, codeLength: parseInt(e.target.value)})} className="w-full h-12 bg-secondary-ivory/30 border-none rounded-xl px-4 text-xs font-bold outline-none" /></div>
                    <div className="space-y-1"><label className="text-[8px] font-black uppercase text-text-muted ml-1">Usage</label><select value={formData.isOneTimeUse ? 'one-time' : 'unlimited'} onChange={(e) => setFormData({...formData, isOneTimeUse: e.target.value === 'one-time'})} className="w-full h-12 bg-secondary-ivory/30 border-none rounded-xl px-4 text-xs font-bold outline-none"><option value="unlimited">Unlimited</option><option value="one-time">Single</option></select></div>
                  </div>
                  <button type="submit" className="w-full h-14 bg-text-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent-gold transition-all">{editingMarketer ? 'Update Policies' : 'Onboard Marketer'}</button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
