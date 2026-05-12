"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Clock, CheckCircle2, XCircle, User, IndianRupee, CreditCard, ExternalLink, ShieldCheck, Search, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('skin_orders')
      .select('*')
      .eq('skin_status', 'under_review')
      .order('skin_created_at', { ascending: false });
    
    if (data) setOrders(data);
    setLoading(false);
  };

  const handleAction = async (orderId: string, status: 'processing' | 'cancelled') => {
    setProcessingId(orderId);
    const { error } = await supabase
      .from('skin_orders')
      .update({ skin_status: status })
      .eq('skin_id', orderId);
    
    if (!error) {
      setOrders(orders.filter(o => o.skin_id !== orderId));
    }
    setProcessingId(null);
  };

  return (
    <div className="space-y-10 pb-24">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-gray-900">Payment Verification</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Verify UPI transactions and approve pending orders for fulfillment.</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-orange-50 rounded-2xl border border-orange-100">
           <Clock className="text-orange-600" size={18} />
           <span className="text-[11px] font-black uppercase tracking-widest text-orange-600">{orders.length} Awaiting Review</span>
        </div>
      </header>

      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center text-gray-400 gap-4">
           <Loader2 className="animate-spin text-accent-gold" size={40} />
           <p className="text-[10px] font-black uppercase tracking-[0.3em]">Loading Transactions...</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {orders.map((order) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={order.skin_id}
              className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                         <CreditCard size={20} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Amount</p>
                         <p className="text-2xl font-black text-gray-900">{formatPrice(order.skin_total_amount || order.skin_total)}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction ID</p>
                      <p className="text-sm font-black text-accent-gold uppercase tracking-tighter">{order.skin_utr || 'NO UTR'}</p>
                   </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-3xl space-y-4 mb-8">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <User size={16} className="text-gray-400" />
                         <span className="text-xs font-bold text-gray-900">{order.skin_first_name} {order.skin_last_name}</span>
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{order.skin_customer_email}</span>
                   </div>
                   <div className="pt-4 border-t border-gray-200">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer Mobile</p>
                      <p className="text-sm font-bold text-gray-900">{order.skin_customer_mobile}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <button 
                     disabled={processingId === order.skin_id}
                     onClick={() => handleAction(order.skin_id, 'processing')}
                     className="flex items-center justify-center gap-2 bg-green-600 text-white h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50"
                   >
                     {processingId === order.skin_id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={18} />}
                     Verify & Approve
                   </button>
                   <button 
                     disabled={processingId === order.skin_id}
                     onClick={() => handleAction(order.skin_id, 'cancelled')}
                     className="flex items-center justify-center gap-2 bg-red-50 text-red-600 h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-red-100 transition-all disabled:opacity-50"
                   >
                     <XCircle size={18} />
                     Reject Payment
                   </button>
                </div>
              </div>
              <div className="bg-orange-50/50 px-8 py-3 border-t border-orange-100/50">
                 <p className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em] text-center italic">
                   Check your bank statement for UTR {order.skin_utr} before approving.
                 </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-gray-100">
           <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShieldCheck size={40} />
           </div>
           <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Everything Cleared!</h2>
           <p className="text-gray-500 max-w-sm mx-auto text-sm font-medium">There are no pending payments awaiting verification. You're all caught up!</p>
        </div>
      )}
    </div>
  );
}
