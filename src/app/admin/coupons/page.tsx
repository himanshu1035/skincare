"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Ticket, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  Users, 
  TrendingUp, 
  Trash2, 
  Edit2, 
  ToggleLeft, 
  ToggleRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '@/lib/utils';
import { CreateCouponModal } from './CreateCouponModal';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  const supabase = createClient();

  const [statsData, setStatsData] = useState({ usage: 0, savings: 0 });

  useEffect(() => {
    fetchCoupons();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: orders } = await supabase
      .from('skin_orders')
      .select('skin_discount_amount')
      .not('skin_coupon_code', 'is', null);
    
    if (orders) {
      const usage = orders.length;
      const savings = orders.reduce((acc, o) => acc + (Number(o.skin_discount_amount) || 0), 0);
      setStatsData({ usage, savings });
    }
  };

  const fetchCoupons = async () => {
    setLoading(true);
    
    // 1. Fetch Admin Coupons
    const { data: adminCoupons } = await supabase
      .from('skin_coupons')
      .select('*')
      .order('skin_created_at', { ascending: false });

    // 2. Fetch Usage Counts from orders
    const { data: orderUsage } = await supabase
      .from('skin_orders')
      .select('skin_coupon_code');
    
    const usageMap: Record<string, number> = {};
    (orderUsage || []).forEach(o => {
      if (o.skin_coupon_code) {
        usageMap[o.skin_coupon_code] = (usageMap[o.skin_coupon_code] || 0) + 1;
      }
    });

    const enriched = (adminCoupons || []).map(c => ({
      ...c,
      source: 'admin',
      usageCount: usageMap[c.skin_code] || 0
    }));

    setCoupons(enriched);
    setLoading(false);
  };

  const toggleCouponStatus = async (id: string, currentStatus: boolean, source: string) => {
    const table = source === 'admin' ? 'skin_coupons' : 'skin_marketer_coupons';
    const { error } = await supabase
      .from(table)
      .update({ skin_is_active: !currentStatus })
      .eq('skin_id', id);
    
    if (!error) {
      setCoupons(coupons.map(c => c.skin_id === id ? { ...c, skin_is_active: !currentStatus } : c));
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) return;
    
    const { error } = await supabase
      .from('skin_coupons')
      .delete()
      .eq('skin_id', id);
    
    if (!error) {
      setCoupons(coupons.filter(c => c.skin_id !== id));
    }
  };

  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.skin_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'active' ? c.skin_is_active : !c.skin_is_active);
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: 'Active Campaigns', value: coupons.filter(c => c.skin_is_active).length, icon: <Ticket className="text-green-600" />, bg: 'bg-green-50' },
    { label: 'Total Usage', value: statsData.usage.toLocaleString(), icon: <Users className="text-blue-600" />, bg: 'bg-blue-50' },
    { label: 'Total Savings', value: formatPrice(statsData.savings), icon: <TrendingUp className="text-accent-gold" />, bg: 'bg-accent-gold/10' },
    { label: 'Expiring Soon', value: coupons.filter(c => c.skin_expiry_date && new Date(c.skin_expiry_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length, icon: <Calendar className="text-red-600" />, bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-dark tracking-tighter uppercase">Coupon Engine</h1>
          <p className="text-text-muted text-xs mt-2 font-medium italic">Create and manage dynamic discount strategies for your store.</p>
        </div>
        <button 
          onClick={() => { setSelectedCoupon(null); setIsModalOpen(true); }}
          className="px-8 py-4 bg-text-dark text-white rounded-full font-black text-xs tracking-widest uppercase hover:bg-accent-gold transition-all shadow-xl flex items-center gap-2"
        >
          <Plus size={18} /> Create New Coupon
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
            placeholder="Search by coupon code..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-secondary-ivory/50 border-none rounded-xl pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-accent-gold outline-none"
          />
        </div>
        <div className="flex items-center gap-4">
          <Filter size={18} className="text-text-muted" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-12 bg-secondary-ivory/50 border-none rounded-xl px-6 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-accent-gold outline-none cursor-pointer"
          >
            <option value="all">ALL STATUS</option>
            <option value="active">ACTIVE ONLY</option>
            <option value="inactive">INACTIVE ONLY</option>
          </select>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white border border-secondary-ivory rounded-[3rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-secondary-ivory bg-secondary-ivory/30">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Code & Type</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Usage Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Discount</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Conditions</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Expiry</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-ivory">
              {loading ? (
                <tr><td colSpan={7} className="py-20 text-center"><Loader2 className="animate-spin inline-block text-accent-gold" /></td></tr>
              ) : filteredCoupons.length > 0 ? (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon.skin_id} className="hover:bg-secondary-ivory/10 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-text-dark flex items-center justify-center text-white shadow-lg">
                          <Ticket size={18} />
                        </div>
                        <div>
                          <p className="font-black text-text-dark tracking-tight uppercase">{coupon.skin_code}</p>
                          <p className="text-[10px] text-text-muted font-black uppercase mt-0.5">{coupon.skin_type.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`flex flex-col gap-1 px-3 py-1.5 rounded-2xl w-fit ${coupon.usageCount > 0 ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                        <span className="text-[9px] font-black uppercase tracking-widest">{coupon.usageCount > 0 ? 'Used' : 'Never Used'}</span>
                        <span className="text-[8px] font-bold italic">{coupon.usageCount} Conversions</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-text-dark text-lg">
                        {coupon.skin_type === 'percentage' ? `${coupon.skin_value}% OFF` : `₹${coupon.skin_value} OFF`}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-text-muted uppercase">Min Order: ₹{coupon.skin_min_order_amount}</span>
                        {coupon.skin_usage_limit && (
                          <span className="text-[10px] font-bold text-text-muted uppercase">Limit: {coupon.skin_usage_limit} Uses</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-[10px] font-black text-text-dark uppercase tracking-widest">
                        {coupon.skin_expiry_date ? new Date(coupon.skin_expiry_date).toLocaleDateString() : 'NO EXPIRY'}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                       <button 
                         onClick={() => toggleCouponStatus(coupon.skin_id, coupon.skin_is_active, coupon.source)}
                         className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                           coupon.skin_is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                         }`}
                       >
                         {coupon.skin_is_active ? <><ToggleRight size={14} /> Active</> : <><ToggleLeft size={14} /> Paused</>}
                       </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {coupon.source === 'admin' && (
                          <button 
                            onClick={() => { setSelectedCoupon(coupon); setIsModalOpen(true); }}
                            className="p-2.5 bg-secondary-ivory/50 rounded-xl text-text-muted hover:text-accent-gold hover:bg-white hover:shadow-md transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            if (coupon.source === 'admin') deleteCoupon(coupon.skin_id);
                            // Optionally handle marketer coupon deletion if allowed
                          }}
                          className={`p-2.5 bg-secondary-ivory/50 rounded-xl text-text-muted hover:bg-white hover:shadow-md transition-all ${coupon.source === 'admin' ? 'hover:text-red-500' : 'opacity-30 cursor-not-allowed'}`}
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
                    <p className="text-text-muted font-bold italic">No coupons found. Create your first campaign above.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <CreateCouponModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          coupon={selectedCoupon}
          onSave={fetchCoupons}
        />
      )}
    </div>
  );
}
