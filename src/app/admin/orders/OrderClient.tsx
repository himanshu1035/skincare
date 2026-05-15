"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { ShoppingBag, Truck, Package, CheckCircle2, Clock, Search, ChevronDown, User, Eye, X, IndianRupee, CreditCard, Ban, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const EditOrderModal = dynamic(() => import('./EditOrderModal').then(mod => mod.EditOrderModal), {
  ssr: false,
});

const STATUS_CONFIG = {
  'under_review': { color: 'text-orange-600 bg-orange-50', icon: <Clock size={14} /> },
  'pending': { color: 'text-yellow-600 bg-yellow-50', icon: <Clock size={14} /> },
  'processing': { color: 'text-blue-600 bg-blue-50', icon: <Package size={14} /> },
  'shipped': { color: 'text-purple-600 bg-purple-50', icon: <Truck size={14} /> },
  'out_for_delivery': { color: 'text-orange-600 bg-orange-50', icon: <Truck size={14} /> },
  'delivered': { color: 'text-green-600 bg-green-50', icon: <CheckCircle2 size={14} /> },
  'cancelled': { color: 'text-red-600 bg-red-50', icon: <Ban size={14} /> },
};

interface OrderClientProps {
  title: string;
  subtitle: string;
  defaultFilter?: 'all' | 'prepaid' | 'cod';
}

export const OrderClient: React.FC<OrderClientProps> = ({ title, subtitle, defaultFilter = 'all' }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const supabase = createClient();

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    
    // AUTO-CLEANUP: Mark any UPI orders without UTR as cancelled in the DB
    await supabase
      .from('skin_orders')
      .update({ skin_status: 'cancelled', skin_payment_status: 'unpaid' })
      .eq('skin_payment_method', 'UPI')
      .is('skin_utr', null)
      .not('skin_status', 'eq', 'cancelled');

    let query = supabase.from('skin_orders').select(`*`, { count: 'exact' });
    
    if (defaultFilter === 'prepaid') {
      query = query.eq('skin_payment_method', 'UPI');
    } else if (defaultFilter === 'cod') {
      query = query.eq('skin_payment_method', 'COD');
    }

    if (statusFilter !== 'all') {
      query = query.eq('skin_status', statusFilter);
    }

    const { data, count } = await query
      .order('skin_created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);
    
    if (data) {
      setOrders(data);
      if (count !== null) setHasMore(count > (page + 1) * pageSize);
    }
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

  const handleOrderUpdate = (updatedOrder: any) => {
    setOrders(orders.map(o => o.skin_id === updatedOrder.skin_id ? updatedOrder : o));
  };

  const filteredOrders = orders.filter(o => {
    const fullName = `${o.skin_first_name || ''} ${o.skin_last_name || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || o.skin_id.toLowerCase().includes(searchTerm.toLowerCase()) || (o.skin_utr && o.skin_utr.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const isUnpaidUPI = o.skin_payment_method === 'UPI' && (o.skin_payment_status === 'unpaid' || !o.skin_payment_status);
    
    // If filtering by 'cancelled', include unpaid UPI
    if (statusFilter === 'cancelled') {
      return (o.skin_status === 'cancelled' || isUnpaidUPI) && matchesSearch;
    }
    
    // For other status filters, if it's an unpaid UPI, it should be excluded (as it's logically 'cancelled')
    if (statusFilter !== 'all' && isUnpaidUPI) {
      return false;
    }

    // In 'all' view, it shows normally unless we want to hide it
    const matchesStatus = statusFilter === 'all' || o.skin_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-dark tracking-tighter uppercase">{title}</h1>
          <p className="text-text-muted text-xs mt-2 font-medium italic">{subtitle}</p>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Reviewing', 
            count: orders.filter(o => 
              o.skin_status === 'under_review' && 
              !(o.skin_payment_method === 'UPI' && (o.skin_payment_status === 'unpaid' || !o.skin_payment_status))
            ).length, 
            color: 'text-orange-600' 
          },
          { label: 'Active', count: orders.filter(o => ['processing', 'shipped'].includes(o.skin_status)).length, color: 'text-blue-600' },
          { label: 'Total', count: orders.length, color: 'text-text-dark' },
          { label: 'Revenue', count: formatPrice(orders.reduce((acc, o) => acc + (Number(o.skin_total_amount) || Number(o.skin_total) || 0), 0)), color: 'text-accent-gold' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-secondary-ivory shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-[2.5rem] border border-secondary-ivory shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search by customer name, order ID, or UTR..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-secondary-ivory/50 border-none rounded-xl pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-accent-gold outline-none"
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Filter:</span>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-12 bg-secondary-ivory/50 border-none rounded-xl px-6 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-accent-gold outline-none cursor-pointer"
          >
            <option value="all">ALL STATUSES</option>
            {Object.keys(STATUS_CONFIG).map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <select 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 bg-secondary-ivory/50 border-none rounded-xl px-6 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-accent-gold outline-none cursor-pointer"
          >
            <option value="">ALL ACCOUNTS</option>
            {[...new Set(orders.map(o => o.skin_assigned_upi).filter(Boolean))].map(upi => (
              <option key={upi as string} value={upi as string}>{upi as string}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-secondary-ivory rounded-[3rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-secondary-ivory bg-secondary-ivory/30">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Order & Client</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Payment Detail</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Total</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Lifecycle Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-ivory">
              {filteredOrders.map((order) => {
                const status = (STATUS_CONFIG as any)[order.skin_status] || STATUS_CONFIG.pending;
                return (
                  <tr key={order.skin_id} className="hover:bg-secondary-ivory/10 transition-colors group text-sm">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-text-dark flex items-center justify-center text-white shadow-lg">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="font-black text-text-dark tracking-tight">#{order.skin_id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-[10px] text-text-muted font-black uppercase mt-0.5">{order.skin_first_name} {order.skin_last_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                         <span className="text-[10px] font-black uppercase tracking-widest text-text-dark">{order.skin_payment_method || 'COD'}</span>
                         {order.skin_assigned_upi && (
                           <span className="text-[8px] font-bold text-text-muted uppercase tracking-tighter -mt-1 mb-1">Via: {order.skin_assigned_upi}</span>
                         )}
                         <div className="flex items-center gap-2">
                           <span className={`text-[9px] font-bold px-2 py-0.5 rounded w-fit uppercase ${order.skin_payment_status === 'verified' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                             {order.skin_payment_status || 'UNPAID'}
                           </span>
                           {order.skin_utr && (
                             <span className="text-[9px] font-black text-accent-gold border border-accent-gold/20 px-2 py-0.5 rounded uppercase">
                               UTR: {order.skin_utr}
                             </span>
                           )}
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-text-dark">{formatPrice(order.skin_total_amount || order.skin_total)}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="relative inline-block text-left">
                        <select 
                          value={order.skin_status}
                          disabled={order.skin_payment_method === 'UPI' && !order.skin_utr}
                          onChange={(e) => updateStatus(order.skin_id, e.target.value)}
                          className={`
                            appearance-none pl-4 pr-10 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-none outline-none transition-all
                            ${status.color} ${status.bg}
                            ${(order.skin_payment_method === 'UPI' && !order.skin_utr) ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:shadow-md'}
                          `}
                        >
                          {(order.skin_payment_method === 'UPI' && !order.skin_utr) ? (
                            <option value="cancelled">CANCELLED (UNVERIFIED)</option>
                          ) : (
                            Object.keys(STATUS_CONFIG).map((s) => (
                              <option key={s} value={s} className="bg-white text-text-dark font-bold">{s.replace(/_/g, ' ')}</option>
                            ))
                          )}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                          <ChevronDown size={12} />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setEditingOrder(order)}
                          className="p-2.5 rounded-xl bg-secondary-ivory text-text-dark hover:bg-accent-gold hover:text-white transition-all shadow-sm"
                          title="Edit Details"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2.5 rounded-xl bg-secondary-ivory text-text-dark hover:bg-text-dark hover:text-white transition-all shadow-sm"
                          title="Quick View"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={async () => {
                            if (window.confirm('CRITICAL: Delete this order permanently?')) {
                              const { error } = await supabase.from('skin_orders').delete().eq('skin_id', order.skin_id);
                              if (!error) setOrders(orders.filter(o => o.skin_id !== order.skin_id));
                            }
                          }}
                          className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          title="Delete Order"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-8 py-6 bg-white border border-secondary-ivory rounded-[2rem] shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
          Showing Page {page + 1}
        </p>
        <div className="flex items-center gap-4">
          <button 
            disabled={page === 0 || loading}
            onClick={() => {
              setPage(p => p - 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-6 h-12 bg-secondary-ivory rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-text-dark hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            PREVIOUS
          </button>
          <button 
            disabled={!hasMore || loading}
            onClick={() => {
              setPage(p => p + 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-6 h-12 bg-text-dark text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent-gold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            NEXT PAGE
          </button>
        </div>
      </div>

      {/* Order Details Modal (View Only) */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-secondary-ivory"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-10 pb-8 border-b border-secondary-ivory">
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter text-text-dark">Quick View</h2>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Order ID: {selectedOrder.skin_id}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-3 rounded-full hover:bg-secondary-ivory transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-8 overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar">
                  <section>
                    <h3 className="text-[10px] font-black text-accent-gold uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                      <ShoppingBag size={14} /> Purchased Items
                    </h3>
                    <div className="space-y-4">
                      {selectedOrder.skin_items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-secondary-ivory/30 border border-secondary-ivory">
                           <div className="w-14 h-14 rounded-xl bg-white overflow-hidden border border-secondary-ivory shrink-0">
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                           </div>
                           <div className="flex-1">
                              <p className="text-sm font-bold text-text-dark line-clamp-1">{item.name}</p>
                              <p className="text-[10px] text-text-muted font-bold uppercase mt-1">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                           </div>
                           <p className="font-black text-sm text-text-dark">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="grid grid-cols-2 gap-8">
                    <section>
                      <h3 className="text-[10px] font-black text-accent-gold uppercase tracking-[0.3em] mb-4">Client Contact</h3>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-text-dark">{selectedOrder.skin_first_name} {selectedOrder.skin_last_name}</p>
                        <p className="text-xs text-text-muted font-medium">{selectedOrder.skin_customer_email}</p>
                        <p className="text-xs text-text-muted font-medium">{selectedOrder.skin_customer_mobile}</p>
                      </div>
                    </section>
                    <section>
                      <h3 className="text-[10px] font-black text-accent-gold uppercase tracking-[0.3em] mb-4">Destination</h3>
                      <p className="text-xs text-text-muted leading-relaxed font-bold mb-6">
                        {selectedOrder.skin_customer_address}
                      </p>
                      
                      {selectedOrder.skin_coupon_code && (
                        <div>
                          <h3 className="text-[10px] font-black text-accent-gold uppercase tracking-[0.3em] mb-2">Applied Coupons</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedOrder.skin_coupon_code.split(',').map((code: string) => (
                              <span key={code} className="px-3 py-1 bg-accent-gold/10 text-accent-gold text-[10px] font-black rounded-lg border border-accent-gold/20 uppercase tracking-widest">
                                {code.trim()}
                              </span>
                            ))}
                          </div>
                          <p className="text-[9px] text-text-muted font-bold mt-2 uppercase tracking-tight">
                            Total Discount: {formatPrice(selectedOrder.skin_discount_amount)}
                          </p>
                        </div>
                      )}
                    </section>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Order Modal */}
      {editingOrder && (
        <EditOrderModal 
          order={editingOrder} 
          onClose={() => setEditingOrder(null)} 
          onUpdate={handleOrderUpdate}
        />
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};
