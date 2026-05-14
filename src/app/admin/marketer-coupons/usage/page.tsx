"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Ticket, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  TrendingUp, 
  Loader2,
  ArrowLeft,
  ShoppingBag,
  User,
  Clock,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MarketerCouponsUsagePage() {
  const [usage, setUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    setLoading(true);
    
    // Fetch detailed usage with order, user and marketer details
    const { data } = await supabase
      .from('skin_marketer_commissions')
      .select(`
        *,
        skin_marketers(skin_name, skin_email),
        skin_marketer_coupons(skin_code),
        skin_orders(
          skin_id,
          skin_total_amount,
          skin_created_at,
          skin_status,
          skin_first_name,
          skin_last_name,
          skin_customer_email
        )
      `)
      .order('skin_created_at', { ascending: false });

    setUsage(data || []);
    setLoading(false);
  };

  const filteredUsage = usage.filter(u => {
    const searchStr = searchTerm.toLowerCase();
    return (
        (u.skin_marketers?.skin_name || '').toLowerCase().includes(searchStr) ||
        (u.skin_marketer_coupons?.skin_code || '').toLowerCase().includes(searchStr) ||
        (u.skin_orders?.skin_customer_email || '').toLowerCase().includes(searchStr) ||
        (u.skin_orders?.skin_first_name || '').toLowerCase().includes(searchStr)
    );
  });

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[10px] font-black text-accent-gold uppercase tracking-widest mb-4 hover:underline"
          >
            <ArrowLeft size={14} /> Back to Coupons
          </button>
          <h1 className="text-4xl font-black text-text-dark tracking-tighter uppercase italic">Conversion Tracking</h1>
          <p className="text-text-muted text-xs mt-2 font-medium italic">Detailed log of which user used which affiliate code for which order.</p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="relative bg-white p-4 rounded-[2rem] border border-secondary-ivory shadow-sm">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <input 
          type="text" 
          placeholder="Search by partner, coupon code, customer email or name..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-14 bg-secondary-ivory/50 border-none rounded-xl pl-14 pr-4 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-accent-gold outline-none"
        />
      </div>

      {/* Usage List */}
      <div className="bg-white border border-secondary-ivory rounded-[3.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-secondary-ivory bg-secondary-ivory/30">
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-text-muted">Conversion Date</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-text-muted">Coupon & Partner</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-text-muted">Customer Detail</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-text-muted">Order Value</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-text-muted">Commission</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Order Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-ivory">
              {loading ? (
                <tr><td colSpan={7} className="py-32 text-center"><Loader2 className="animate-spin inline-block text-accent-gold" size={40} /></td></tr>
              ) : filteredUsage.length > 0 ? (
                filteredUsage.map((u) => (
                  <tr key={u.skin_id} className="hover:bg-secondary-ivory/5 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3 text-xs font-bold text-text-dark">
                        <Clock size={14} className="text-accent-gold" />
                        {new Date(u.skin_created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div>
                        <p className="font-black text-text-dark uppercase tracking-widest">{u.skin_marketer_coupons?.skin_code}</p>
                        <p className="text-[9px] text-accent-gold font-black uppercase mt-1 italic">{u.skin_marketers?.skin_name}</p>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary-ivory flex items-center justify-center text-text-muted">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-text-dark uppercase tracking-tight">
                            {u.skin_orders?.skin_first_name} {u.skin_orders?.skin_last_name}
                          </p>
                          <p className="text-[9px] text-text-muted font-bold lowercase">{u.skin_orders?.skin_customer_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <p className="font-black text-text-dark">{formatPrice(u.skin_order_amount)}</p>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <p className="font-black text-green-600">{formatPrice(u.skin_commission_earned)}</p>
                        <p className="text-[8px] font-bold text-text-muted uppercase">Earnings Recorded</p>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        u.skin_orders?.skin_status === 'delivered' ? 'bg-green-50 text-green-600' : 
                        u.skin_orders?.skin_status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'
                      }`}>
                        {u.skin_orders?.skin_status || 'Processing'}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <Link 
                        href={`/admin/orders/${u.skin_order_id}`}
                        className="p-3 bg-secondary-ivory rounded-xl text-text-muted hover:text-text-dark hover:bg-white hover:shadow-lg transition-all inline-block"
                      >
                        <ExternalLink size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-32 text-center text-text-muted italic text-xs">
                    No conversion logs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
