"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Zap, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  Gift, 
  TrendingUp, 
  Trash2, 
  Edit2, 
  ToggleLeft, 
  ToggleRight,
  Loader2,
  CheckCircle2,
  Tag,
  ShoppingBag,
  Clock,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '@/lib/utils';
import { CreatePromotionModal } from './CreatePromotionModal';

export default function AdminPromotionsPage() {
  const [stats, setStats] = useState([
    { label: 'Active Offers', value: '0', icon: <Zap className="text-accent-gold" />, bg: 'bg-accent-gold/10' },
    { label: 'Free Gifts Sent', value: '0', icon: <Gift className="text-pink-600" />, bg: 'bg-pink-50' },
    { label: 'Promo Revenue', value: formatPrice(0), icon: <TrendingUp className="text-green-600" />, bg: 'bg-green-50' },
    { label: 'BOGO Claims', value: '0', icon: <Layers className="text-blue-600" />, bg: 'bg-blue-50' },
  ]);

  const supabase = createClient();

  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchPromotions();
    fetchStats();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('skin_promotions')
      .select('*')
      .order('skin_priority', { ascending: false });
    
    if (data) setPromotions(data);
    setLoading(false);
  };

  const togglePromotionStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('skin_promotions')
      .update({ skin_is_active: !currentStatus })
      .eq('skin_id', id);
    
    if (!error) {
      setPromotions(promotions.map(p => p.skin_id === id ? { ...p, skin_is_active: !currentStatus } : p));
    }
  };

  const deletePromotion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion? This action cannot be undone.')) return;
    
    const { error } = await supabase
      .from('skin_promotions')
      .delete()
      .eq('skin_id', id);
    
    if (!error) {
      setPromotions(promotions.filter(p => p.skin_id !== id));
    }
  };

  const filteredPromotions = promotions.filter(p => {
    const matchesSearch = p.skin_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = typeFilter === 'all' || p.skin_type === typeFilter;
    return matchesSearch && matchesFilter;
  });

  const fetchStats = async () => {
    // 1. Active Promotions
    const { count: activeCount } = await supabase
      .from('skin_promotions')
      .select('*', { count: 'exact', head: true })
      .eq('skin_is_active', true);

    // 2. Promo Orders & Revenue
    const { data: promoOrders } = await supabase
      .from('skin_orders')
      .select('skin_total_amount, skin_promo_savings')
      .gt('skin_promo_savings', 0);

    const promoRevenue = promoOrders?.reduce((acc, o) => acc + Number(o.skin_total_amount), 0) || 0;
    const bogoClaims = promoOrders?.length || 0;

    // 3. Free Gifts (Price = 0 items)
    // This is an estimate based on order data
    const { data: freeItems } = await supabase
      .from('skin_orders')
      .select('skin_items')
      .gt('skin_promo_savings', 0); // Orders with promo savings often have gifts
    
    let giftCount = 0;
    freeItems?.forEach(order => {
      const items = order.skin_items || [];
      giftCount += items.filter((i: any) => i.is_free || i.price === 0).length;
    });

    setStats([
      { label: 'Active Offers', value: String(activeCount || 0), icon: <Zap className="text-accent-gold" />, bg: 'bg-accent-gold/10' },
      { label: 'Free Gifts Sent', value: String(giftCount), icon: <Gift className="text-pink-600" />, bg: 'bg-pink-50' },
      { label: 'Promo Revenue', value: formatPrice(promoRevenue), icon: <TrendingUp className="text-green-600" />, bg: 'bg-green-50' },
      { label: 'BOGO Claims', value: String(bogoClaims), icon: <Layers className="text-blue-600" />, bg: 'bg-blue-50' },
    ]);
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-dark tracking-tighter uppercase">Promotion Engine</h1>
          <p className="text-text-muted text-xs mt-2 font-medium italic">Orchestrate enterprise-level offers, BOGO, and automatic free gifts.</p>
        </div>
        <button 
          onClick={() => { setSelectedPromotion(null); setIsModalOpen(true); }}
          className="px-8 py-4 bg-text-dark text-white rounded-full font-black text-xs tracking-widest uppercase hover:bg-accent-gold transition-all shadow-xl flex items-center gap-2"
        >
          <Plus size={18} /> Create New Offer
        </button>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`p-6 rounded-[2rem] border border-secondary-ivory shadow-sm hover:shadow-md transition-all ${stat.bg}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white rounded-xl shadow-sm">{stat.icon}</div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{stat.label}</p>
            </div>
            <p className="text-2xl font-black text-text-dark">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-[2.5rem] border border-secondary-ivory shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search by promotion title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-secondary-ivory/50 border-none rounded-xl pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-accent-gold outline-none"
          />
        </div>
        <div className="flex items-center gap-4">
          <Filter size={18} className="text-text-muted" />
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-12 bg-secondary-ivory/50 border-none rounded-xl px-6 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-accent-gold outline-none cursor-pointer"
          >
            <option value="all">ALL TYPES</option>
            <option value="bogo">BOGO (BUY X GET Y)</option>
            <option value="free_gift">FREE GIFT</option>
            <option value="cart_value">CART VALUE</option>
            <option value="quantity">QUANTITY BASED</option>
          </select>
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-white border border-secondary-ivory rounded-[3rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-secondary-ivory bg-secondary-ivory/30">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Promotion Details</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Type</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Configuration</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Priority</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-ivory">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center"><Loader2 className="animate-spin inline-block text-accent-gold" /></td></tr>
              ) : filteredPromotions.length > 0 ? (
                filteredPromotions.map((promo) => (
                  <tr key={promo.skin_id} className="hover:bg-secondary-ivory/10 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-text-dark flex items-center justify-center text-white shadow-lg">
                          <Zap size={18} />
                        </div>
                        <div>
                          <p className="font-black text-text-dark tracking-tight uppercase">{promo.skin_title}</p>
                          <p className="text-[10px] text-text-muted font-bold truncate max-w-xs">{promo.skin_description || 'No description provided.'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Tag size={12} className="text-accent-gold" />
                        <span className="text-[10px] font-black text-text-dark uppercase tracking-widest">{promo.skin_type.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        {promo.skin_type === 'bogo' && (
                          <p className="text-[10px] font-bold text-text-dark uppercase">Buy {promo.skin_buy_quantity} Get {promo.skin_get_quantity}</p>
                        )}
                        {promo.skin_min_cart_value > 0 && (
                          <p className="text-[10px] font-bold text-text-dark uppercase">Min Order: {formatPrice(promo.skin_min_cart_value)}</p>
                        )}
                        {promo.skin_free_product_id && (
                          <div className="flex items-center gap-1 text-[9px] text-green-600 font-black uppercase">
                            <Gift size={10} /> Free Item Included
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="w-8 h-8 rounded-lg bg-secondary-ivory flex items-center justify-center text-[10px] font-black text-text-dark border border-gray-100 shadow-sm">
                         {promo.skin_priority}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                       <button 
                         onClick={() => togglePromotionStatus(promo.skin_id, promo.skin_is_active)}
                         className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                           promo.skin_is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                         }`}
                       >
                         {promo.skin_is_active ? <><ToggleRight size={14} /> Active</> : <><ToggleLeft size={14} /> Paused</>}
                       </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedPromotion(promo); setIsModalOpen(true); }}
                          className="p-2.5 bg-secondary-ivory/50 rounded-xl text-text-muted hover:text-accent-gold hover:bg-white hover:shadow-md transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deletePromotion(promo.skin_id)}
                          className="p-2.5 bg-secondary-ivory/50 rounded-xl text-text-muted hover:text-red-500 hover:bg-white hover:shadow-md transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                       <div className="w-16 h-16 bg-secondary-ivory rounded-full flex items-center justify-center text-text-muted/30">
                         <ShoppingBag size={32} />
                       </div>
                       <p className="text-text-muted font-bold italic text-sm">No active promotions found. Start your first campaign!</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <CreatePromotionModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          promotion={selectedPromotion}
          onSave={fetchPromotions}
        />
      )}
    </div>
  );
}
