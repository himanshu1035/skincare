"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { 
  ShoppingBag, 
  Search, 
  User, 
  Clock, 
  ChevronRight, 
  Loader2, 
  X, 
  Package, 
  Calendar,
  Filter,
  Ticket,
  Truck,
  CheckCircle2
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_MAP: any = {
  'under_review': { label: 'Reviewing', color: 'text-orange-600', bg: 'bg-orange-50' },
  'pending': { label: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  'processing': { label: 'Packed', color: 'text-blue-600', bg: 'bg-blue-50' },
  'shipped': { label: 'Shipped', color: 'text-purple-600', bg: 'bg-purple-50' },
  'out_for_delivery': { label: 'Out for Delivery', color: 'text-orange-600', bg: 'bg-orange-50' },
  'delivered': { label: 'Delivered', color: 'text-green-600', bg: 'bg-green-50' },
  'cancelled': { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50' },
};

function OrdersContent() {
  const searchParams = useSearchParams();
  const couponFilter = searchParams.get('coupon');
  
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    fetchOrders();
  }, [couponFilter]);

  const fetchOrders = async () => {
    // Parallelize session check and data fetch if possible, but we need session for filter
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('skin_marketer_commissions')
      .select(`
        *, 
        skin_orders(
          skin_id, 
          skin_first_name, 
          skin_last_name, 
          skin_customer_email, 
          skin_items, 
          skin_coupon_code, 
          skin_created_at,
          skin_status
        )
      `)
      .eq('skin_marketer_id', session.user.id)
      .order('skin_created_at', { ascending: false });

    if (data) {
      let filteredData = data;
      if (couponFilter) {
        filteredData = data.filter(c => (c.skin_orders?.skin_coupon_code || '').toLowerCase().includes(couponFilter.toLowerCase()));
      }
      setCommissions(filteredData);
    }
    setLoading(false);
  };

  const filteredCommissions = commissions.filter(c => 
    (c.skin_orders?.skin_first_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.skin_orders?.skin_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.skin_orders?.skin_coupon_code || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-accent-gold" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Analyzing Sales Pipeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-text-dark uppercase italic">Sales Tracking</h1>
          <p className="text-text-muted mt-2 font-medium italic">Deep-dive into every conversion attributed to your campaigns.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search Order ID or Code..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 bg-white border border-secondary-ivory rounded-full pl-12 pr-6 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-accent-gold outline-none transition-all shadow-sm"
          />
        </div>
      </header>

      {couponFilter && (
        <div className="flex items-center gap-4 bg-accent-gold/5 p-4 rounded-2xl border border-accent-gold/20">
           <Filter className="text-accent-gold" size={18} />
           <p className="text-[10px] font-black text-text-dark uppercase tracking-widest">
             Filtering by Campaign: <span className="text-accent-gold">{couponFilter}</span>
           </p>
           <button 
             onClick={() => window.location.href = '/marketer/orders'}
             className="ml-auto text-[9px] font-black text-text-muted uppercase tracking-widest hover:text-red-500 transition-colors"
           >
             Clear Filter
           </button>
        </div>
      )}

      <div className="bg-white rounded-[3rem] border border-secondary-ivory shadow-sm overflow-hidden">
        <div className="p-8 border-b border-secondary-ivory bg-secondary-ivory/5 flex items-center justify-between">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Attributed Transactions ({filteredCommissions.length})</p>
          <ShoppingBag className="text-text-muted" size={20} />
        </div>
        <div className="divide-y divide-secondary-ivory">
          {filteredCommissions.length > 0 ? filteredCommissions.map((c) => (
            <div 
              key={c.skin_id} 
              className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-secondary-ivory/10 transition-all cursor-pointer group gap-6 md:gap-0"
              onClick={() => setSelectedSale(c)}
            >
              <div className="flex items-start md:items-center gap-4 md:gap-6">
                <div className="hidden sm:flex w-16 h-16 rounded-[1.5rem] bg-secondary-ivory flex-col items-center justify-center text-text-dark group-hover:bg-accent-gold group-hover:text-white transition-all duration-500 shrink-0">
                  <p className="text-lg font-black leading-none">{new Date(c.skin_created_at).getDate()}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest mt-1">
                    {new Date(c.skin_created_at).toLocaleString('default', { month: 'short' }).toUpperCase()}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <p className="text-base md:text-lg font-black text-text-dark uppercase tracking-tight">Order #{(c.skin_orders?.skin_id || '').slice(0, 8)}</p>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[8px] font-black uppercase tracking-widest">
                      <Ticket size={10} /> {c.skin_orders?.skin_coupon_code}
                    </div>
                    {c.skin_orders?.skin_status && (
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${STATUS_MAP[c.skin_orders.skin_status]?.bg || 'bg-gray-50'} ${STATUS_MAP[c.skin_orders.skin_status]?.color || 'text-gray-600'}`}>
                        {STATUS_MAP[c.skin_orders.skin_status]?.label || c.skin_orders.skin_status}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-2">
                      <User size={12} /> {c.skin_orders?.skin_first_name} {c.skin_orders?.skin_last_name?.[0]}.
                    </p>
                    <p className="text-[9px] text-text-muted/60 font-bold uppercase tracking-widest break-all">
                      {c.skin_orders?.skin_customer_email.split('@')[0].slice(0,3)}***@{c.skin_orders?.skin_customer_email.split('@')[1]}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-none pt-4 md:pt-0 border-secondary-ivory/50">
                <div className="md:text-right">
                  <p className="text-lg md:text-xl font-black text-text-dark">{formatPrice(c.skin_order_amount)}</p>
                  <p className="text-[10px] font-black text-accent-gold uppercase tracking-widest mt-1">Earned: +{formatPrice(Number(c.skin_commission_earned) + Number(c.skin_bonus_earned))}</p>
                </div>
                <ChevronRight size={20} className="text-secondary-ivory group-hover:text-accent-gold group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          )) : (
            <div className="py-32 text-center">
              <div className="w-20 h-20 bg-secondary-ivory/30 rounded-full flex items-center justify-center mx-auto mb-6">
                 <ShoppingBag className="text-secondary-ivory" size={40} />
              </div>
              <h3 className="text-xl font-black text-text-dark uppercase italic">Pipeline Empty</h3>
              <p className="text-text-muted mt-2 font-medium italic">No attributed sales matching your criteria were found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Sale Details Modal */}
      <AnimatePresence>
        {selectedSale && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSale(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 border border-secondary-ivory overflow-hidden">
               <header className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter text-text-dark uppercase italic">Transaction Audit</h2>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Full transparency for Order #{(selectedSale.skin_orders?.skin_id || '').slice(0, 8)}</p>
                  </div>
                  <button onClick={() => setSelectedSale(null)} className="w-10 h-10 rounded-full bg-secondary-ivory flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><X size={20}/></button>
               </header>

               <div className="space-y-6">
                  <div className="bg-secondary-ivory/30 p-8 rounded-[2.5rem] border border-secondary-ivory text-center">
                     <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-secondary-ivory">
                        <Package size={24} className="text-text-dark" />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Order Volume</p>
                     <p className="text-2xl font-black text-text-dark uppercase italic">
                        {selectedSale.skin_orders?.skin_items?.reduce((acc: number, item: any) => acc + (item.skin_quantity || 1), 0)} Items Purchased
                     </p>
                     <p className="text-[9px] text-text-muted/60 font-bold uppercase tracking-widest mt-2 italic">Detailed manifest is restricted to administration.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100">
                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Gross Total</p>
                        <p className="text-xl font-black text-blue-700">{formatPrice(selectedSale.skin_order_amount)}</p>
                     </div>
                     <div className="bg-green-50/50 p-6 rounded-[2rem] border border-green-100">
                        <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Your Earned</p>
                        <p className="text-xl font-black text-green-700">{formatPrice(Number(selectedSale.skin_commission_earned) + Number(selectedSale.skin_bonus_earned))}</p>
                     </div>
                  </div>
                  
                  <div className="p-4 bg-secondary-ivory/20 rounded-2xl flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-text-muted">
                     <span>Campaign Used:</span>
                     <span className="text-accent-gold">{selectedSale.skin_orders?.skin_coupon_code}</span>
                  </div>

                  {selectedSale.skin_orders?.skin_status && (
                    <div className={`p-4 rounded-2xl flex items-center justify-between text-[10px] font-black uppercase tracking-widest ${STATUS_MAP[selectedSale.skin_orders.skin_status]?.bg || 'bg-gray-50'} ${STATUS_MAP[selectedSale.skin_orders.skin_status]?.color || 'text-gray-600'}`}>
                       <span className="flex items-center gap-2 italic">
                         <Truck size={14} /> Fulfillment State:
                       </span>
                       <span>{STATUS_MAP[selectedSale.skin_orders.skin_status]?.label || selectedSale.skin_orders.skin_status}</span>
                    </div>
                  )}
               </div>

               <button onClick={() => setSelectedSale(null)} className="w-full h-14 bg-text-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent-gold transition-all mt-8">Close Audit</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MarketerOrdersPage() {
  return (
    <Suspense fallback={<div className="py-20 flex justify-center"><Loader2 className="animate-spin text-accent-gold" size={40} /></div>}>
      <OrdersContent />
    </Suspense>
  );
}
