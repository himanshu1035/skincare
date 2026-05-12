"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { ShoppingBag, Truck, Package, CheckCircle2, Clock, Search, ExternalLink, ChevronDown, User, Eye, X, IndianRupee, CreditCard, Ban } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CONFIG = {
  'under_review': { color: 'text-orange-600 bg-orange-50', icon: <Clock size={14} /> },
  'pending': { color: 'text-yellow-600 bg-yellow-50', icon: <Clock size={14} /> },
  'processing': { color: 'text-blue-600 bg-blue-50', icon: <Package size={14} /> },
  'shipped': { color: 'text-purple-600 bg-purple-50', icon: <Truck size={14} /> },
  'out_for_delivery': { color: 'text-orange-600 bg-orange-50', icon: <Truck size={14} /> },
  'delivered': { color: 'text-green-600 bg-green-50', icon: <CheckCircle2 size={14} /> },
  'cancelled': { color: 'text-red-600 bg-red-50', icon: <Ban size={14} /> },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('skin_orders')
      .select(`*`)
      .order('skin_created_at', { ascending: false });
    
    if (data) setOrders(data);
    setLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('skin_orders')
      .update({ skin_status: newStatus })
      .eq('skin_id', orderId);
    
    if (!error) {
      setOrders(orders.map(o => o.skin_id === orderId ? { ...o, skin_status: newStatus } : o));
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Order Management</h1>
          <p className="text-gray-500 text-xs mt-1">Review products, payments, and transportation for all COSRX orders.</p>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending Review', count: orders.filter(o => o.skin_status === 'under_review').length, color: 'text-orange-600' },
          { label: 'Processing', count: orders.filter(o => ['processing', 'shipped'].includes(o.skin_status)).length, color: 'text-blue-600' },
          { label: 'Total Orders', count: orders.length, color: 'text-gray-900' },
          { label: 'Gross Revenue', count: formatPrice(orders.reduce((acc, o) => acc + (Number(o.skin_total_amount) || Number(o.skin_total) || 0), 0)), color: 'text-accent-gold' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Order & Customer</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Payment</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Total</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => {
                const status = (STATUS_CONFIG as any)[order.skin_status] || STATUS_CONFIG.pending;
                return (
                  <tr key={order.skin_id} className="hover:bg-gray-50/50 transition-colors group text-sm">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary-ivory flex items-center justify-center text-accent-gold">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 tracking-tight">#{order.skin_id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{order.skin_customer_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{order.skin_payment_method || 'COD'}</span>
                         {order.skin_utr && <span className="text-[10px] font-bold text-accent-gold bg-accent-gold/5 px-2 py-0.5 rounded w-fit">UTR: {order.skin_utr}</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-gray-900">{formatPrice(order.skin_total_amount || order.skin_total)}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="relative inline-block text-left">
                        <select 
                          value={order.skin_status}
                          onChange={(e) => updateStatus(order.skin_id, e.target.value)}
                          className={`
                            appearance-none pl-4 pr-10 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border-none cursor-pointer outline-none transition-all
                            ${status.color}
                          `}
                        >
                          {Object.keys(STATUS_CONFIG).map((s) => (
                            <option key={s} value={s} className="bg-white text-black font-medium">{s.replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                          <ChevronDown size={12} />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-text-dark hover:text-white transition-all shadow-sm"
                        title="View Full Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-10 pb-8 border-b border-gray-100">
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter">Order Details</h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">ID: {selectedOrder.skin_id}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-8 overflow-y-auto max-h-[60vh] pr-4 scrollbar-hide">
                  {/* Products Section */}
                  <section>
                    <h3 className="text-[10px] font-black text-accent-gold uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                      <ShoppingBag size={14} /> Purchased Items
                    </h3>
                    <div className="space-y-4">
                      {selectedOrder.skin_items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                           <div className="w-14 h-14 rounded-xl bg-white overflow-hidden border border-gray-100 shrink-0">
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                           </div>
                           <div className="flex-1">
                              <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                           </div>
                           <p className="font-black text-sm">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Customer & Shipping */}
                  <div className="grid grid-cols-2 gap-8">
                    <section>
                      <h3 className="text-[10px] font-black text-accent-gold uppercase tracking-[0.3em] mb-4">Customer info</h3>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-900">{selectedOrder.skin_first_name} {selectedOrder.skin_last_name}</p>
                        <p className="text-xs text-gray-500">{selectedOrder.skin_customer_email}</p>
                        <p className="text-xs text-gray-500">{selectedOrder.skin_customer_mobile}</p>
                      </div>
                    </section>
                    <section>
                      <h3 className="text-[10px] font-black text-accent-gold uppercase tracking-[0.3em] mb-4">Shipping address</h3>
                      <p className="text-xs text-gray-600 leading-relaxed font-medium">
                        {selectedOrder.skin_customer_address}<br />
                        {selectedOrder.skin_address_line2 && <>{selectedOrder.skin_address_line2}<br /></>}
                        {selectedOrder.skin_customer_city}, {selectedOrder.skin_customer_state} {selectedOrder.skin_customer_zip}<br />
                        {selectedOrder.skin_country}
                      </p>
                    </section>
                  </div>

                  {/* Payment Details */}
                  <section className="bg-secondary-ivory/30 p-8 rounded-3xl border border-secondary-ivory">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-black text-text-dark uppercase tracking-[0.3em]">Financial Summary</h3>
                        <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${(STATUS_CONFIG as any)[selectedOrder.skin_status]?.color}`}>
                           {selectedOrder.skin_status.replace(/_/g, ' ')}
                        </div>
                     </div>
                     <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                           <span className="text-text-muted">Payment Method</span>
                           <span className="font-bold uppercase">{selectedOrder.skin_payment_method || 'COD'}</span>
                        </div>
                        {selectedOrder.skin_utr && (
                          <div className="flex justify-between text-xs">
                             <span className="text-text-muted">Transaction ID (UTR)</span>
                             <span className="font-black text-accent-gold">{selectedOrder.skin_utr}</span>
                          </div>
                        )}
                        <div className="pt-4 border-t border-secondary-ivory flex justify-between items-center">
                           <span className="text-sm font-black uppercase tracking-widest">Total Paid</span>
                           <span className="text-2xl font-black text-text-dark">{formatPrice(selectedOrder.skin_total_amount || selectedOrder.skin_total)}</span>
                        </div>
                     </div>
                  </section>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
