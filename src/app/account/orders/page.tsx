"use client";

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabase, createClient } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { Package, Truck, CheckCircle2, Clock, MapPin, IndianRupee, ArrowRight, Loader2, ChevronDown, ChevronUp, ShoppingBag, CreditCard, ShieldCheck, XCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_MAP = {
  'under_review': { label: 'Payment Under Review', icon: <ShieldCheck size={18} />, color: 'text-orange-600', bg: 'bg-orange-50', step: 0 },
  'pending': { label: 'Pending Confirmation', icon: <Clock size={18} />, color: 'text-yellow-600', bg: 'bg-yellow-50', step: 1 },
  'processing': { label: 'Processing Order', icon: <Package size={18} />, color: 'text-blue-600', bg: 'bg-blue-50', step: 2 },
  'shipped': { label: 'In Transit', icon: <Truck size={18} />, color: 'text-purple-600', bg: 'bg-purple-50', step: 3 },
  'out_for_delivery': { label: 'Out for Delivery', icon: <Truck size={18} />, color: 'text-orange-600', bg: 'bg-orange-50', step: 4 },
  'delivered': { label: 'Delivered', icon: <CheckCircle2 size={18} />, color: 'text-green-600', bg: 'bg-green-50', step: 5 },
  'cancelled': { label: 'Order Cancelled', icon: <XCircle size={18} />, color: 'text-red-600', bg: 'bg-red-50', step: -1 },
};

const TRACKING_STEPS = [
  { id: 'pending', label: 'Ordered', step: 1 },
  { id: 'processing', label: 'Packed', step: 2 },
  { id: 'shipped', label: 'Shipped', step: 3 },
  { id: 'out_for_delivery', label: 'Out for Delivery', step: 4 },
  { id: 'delivered', label: 'Delivered', step: 5 },
];

export default function UserOrdersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Guest lookup state
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupOrderId, setLookupOrderId] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupSubmitting, setLookupSubmitting] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      // Use createClient to ensure fresh session state
      const supabaseInstance = createClient();
      const { data: { session } } = await supabaseInstance.auth.getSession();

      // Guests can still look up orders here without an account.
      if (!session) {
        setIsCheckingAuth(false);
        setIsGuest(true);
        setLoading(false);
        return;
      }

      setIsCheckingAuth(false);
      setIsGuest(false);
      const userId = session.user.id;
      const userEmail = session.user.email;
      fetchUserOrders(userId, userEmail);
    };
    checkUser();
  }, [router]);

  const fetchUserOrders = async (userId: string, email?: string) => {
    setLoading(true);
    try {
      const supabaseInstance = createClient();
      
      // Attempt 1: Fetch by User ID
      let { data, error } = await supabaseInstance
        .from('skin_orders')
        .select('*')
        .or(`skin_user_id.eq.${userId}${email ? `,skin_customer_email.eq.${email}` : ''}`)
        .order('skin_created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching orders:', error.message);
        setOrders([]);
      } else {
        setOrders(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Guest order lookup: matches by email + order id prefix or full id.
  const handleGuestLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    setLookupSubmitting(true);
    try {
      const supabaseInstance = createClient();
      const idQuery = lookupOrderId.trim();
      const emailQuery = lookupEmail.trim().toLowerCase();

      if (!idQuery || !emailQuery) {
        setLookupError('Please enter both your email and order ID.');
        return;
      }

      // Match by full id or by short id prefix (the UI shows the first 8 chars uppercase).
      let query = supabaseInstance
        .from('skin_orders')
        .select('*')
        .ilike('skin_customer_email', emailQuery);

      if (idQuery.length >= 32) {
        query = query.eq('skin_id', idQuery);
      } else {
        query = query.ilike('skin_id', `${idQuery.toLowerCase()}%`);
      }

      const { data, error } = await query.order('skin_created_at', { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) {
        setLookupError('No order found with that email and order ID.');
        setOrders([]);
        return;
      }
      setOrders(data);
    } catch (err: any) {
      setLookupError(err.message || 'Could not look up that order.');
    } finally {
      setLookupSubmitting(false);
    }
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (isCheckingAuth) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-accent-gold" size={40} /></div>;

  return (
    <main className="min-h-screen bg-secondary-ivory/20">
      <Navbar />
      <div className="pt-40 pb-24">
        <div className="container max-w-5xl px-4">
          <header className="mb-12">
            <Link href="/account" className="text-[10px] font-black text-accent-gold uppercase tracking-[0.3em] mb-4 flex items-center gap-2 hover:translate-x-1 transition-transform">
              <ArrowRight className="rotate-180" size={14} /> My Profile
            </Link>
            <h1 className="text-5xl font-black tracking-tighter text-text-dark">Order History</h1>
            <p className="text-text-muted mt-2 font-medium italic">Track your premium COSRX shipments.</p>
          </header>

          {isGuest && (
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-secondary-ivory shadow-sm mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                <div>
                  <p className="text-[10px] font-black text-accent-gold uppercase tracking-[0.3em] mb-2">Guest Order Lookup</p>
                  <h2 className="text-2xl font-black text-text-dark uppercase tracking-tight">Track an Order</h2>
                  <p className="text-sm text-text-muted font-medium italic mt-1">No account needed — just your order email and order ID.</p>
                </div>
                <Link href="/auth" className="text-[10px] font-black text-text-dark uppercase tracking-widest hover:text-accent-gold transition-colors whitespace-nowrap">
                  Have an account? Sign in →
                </Link>
              </div>
              <form onSubmit={handleGuestLookup} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="email"
                  required
                  placeholder="Order email"
                  value={lookupEmail}
                  onChange={(e) => setLookupEmail(e.target.value)}
                  className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium"
                />
                <input
                  type="text"
                  required
                  placeholder="Order ID (first 8 characters or full)"
                  value={lookupOrderId}
                  onChange={(e) => setLookupOrderId(e.target.value)}
                  className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium"
                />
                <button
                  type="submit"
                  disabled={lookupSubmitting}
                  className="h-14 rounded-xl bg-text-dark text-white font-black text-xs tracking-[0.2em] uppercase hover:bg-accent-gold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {lookupSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Find My Order'}
                </button>
              </form>
              {lookupError && (
                <p className="text-xs font-bold text-red-500 mt-4">{lookupError}</p>
              )}
            </div>
          )}

          {loading ? (
            <div className="py-20 flex items-center justify-center"><Loader2 className="animate-spin text-accent-gold" size={40} /></div>
          ) : orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => {
                const status = (STATUS_MAP as any)[order.skin_status] || STATUS_MAP.pending;
                const isExpanded = expandedOrder === order.skin_id;
                const currentStep = status.step;
                const totalAmount = Number(order.skin_total_amount || order.skin_total || 0);
                const handlingPaid = (order.skin_payment_status === 'verified' && order.skin_payment_method === 'COD') 
                    ? (Number(order.skin_shipping_charge) + Number(order.skin_cod_charge)) 
                    : 0;

                return (
                  <div key={order.skin_id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-secondary-ivory hover:shadow-xl transition-all duration-500">
                    <div className="p-8 md:p-10">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-secondary-ivory/50">
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl ${status.bg} ${status.color} flex items-center justify-center shadow-inner`}>
                            {status.icon}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1">
                               <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Order Status</p>
                               {order.skin_estimated_delivery && (
                                 <span className="text-[8px] font-black bg-accent-gold/10 text-accent-gold px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                                   Est. Delivery: {order.skin_estimated_delivery}
                                 </span>
                               )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xl font-black text-text-dark uppercase tracking-tight">{status.label}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="flex flex-col md:items-end md:text-right">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Grand Total</p>
                            <p className="text-xl font-black text-text-dark">{formatPrice(totalAmount)}</p>
                          </div>
                          <button 
                            onClick={() => toggleOrder(order.skin_id)}
                            className="w-12 h-12 rounded-full bg-secondary-ivory flex items-center justify-center text-text-dark hover:bg-accent-gold hover:text-white transition-all"
                          >
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-4 items-start">
                        {/* 1. Products Preview (New Always-Visible) */}
                        <div className="space-y-3">
                           <p className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2"><ShoppingBag size={12} /> Items Preview</p>
                           <div className="flex -space-x-4 overflow-hidden py-1">
                              {order.skin_items?.slice(0, 4).map((item: any, idx: number) => (
                                <div key={idx} className="relative w-12 h-12 rounded-xl bg-white border-2 border-white shadow-md overflow-hidden shrink-0 transition-transform hover:scale-110 hover:z-20 group">
                                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" title={item.name} />
                                </div>
                              ))}
                              {(order.skin_items?.length || 0) > 4 && (
                                <div className="w-12 h-12 rounded-xl bg-secondary-ivory border-2 border-white shadow-md flex items-center justify-center text-[10px] font-black text-text-muted z-10">
                                  +{order.skin_items.length - 4}
                                </div>
                              )}
                           </div>
                           <p className="text-[9px] font-bold text-text-muted uppercase tracking-tight italic line-clamp-1">
                             {order.skin_items?.[0]?.name} {(order.skin_items?.length || 0) > 1 ? `& ${order.skin_items.length - 1} more...` : ''}
                           </p>
                        </div>

                        {/* 2. Destination */}
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2"><MapPin size={12} /> Destination</p>
                           <p className="text-xs font-bold text-text-dark leading-relaxed line-clamp-2">
                             {order.skin_customer_address || order.skin_shipping_address}
                           </p>
                        </div>

                        {/* 3. Payment Details (Enhanced) */}
                        <div className="space-y-2">
                           <p className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2"><CreditCard size={12} /> Payment Account</p>
                           <div className="text-xs font-bold text-text-dark uppercase flex flex-col gap-1">
                             <div className="flex items-center gap-2">
                               <span className="px-2 py-0.5 bg-secondary-ivory rounded text-[9px] font-black">{order.skin_payment_method}</span>
                               <span className={`px-2 py-0.5 rounded text-[9px] font-black ${order.skin_payment_status === 'verified' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                 {order.skin_payment_status || 'UNPAID'}
                               </span>
                             </div>
                             {order.skin_utr && (
                               <span className="text-[9px] font-black text-accent-gold border border-accent-gold/20 px-2 py-1 rounded-lg w-fit">
                                 UTR: {order.skin_utr}
                               </span>
                             )}
                             {handlingPaid > 0 && <span className="text-accent-gold mt-1 font-black text-[9px]">₹{totalAmount - handlingPaid} DUE ON DELIVERY</span>}
                           </div>
                        </div>

                        {/* 4. Order Reference & Coupon */}
                        <div className="space-y-2">
                           <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Order Summary</p>
                           <div className="flex flex-col gap-1">
                             <p className="text-xs font-black text-text-dark">#{order.skin_id.slice(0, 8).toUpperCase()}</p>
                             <p className="text-[9px] text-text-muted font-bold italic">{new Date(order.skin_created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                             {order.skin_coupon_code && (
                               <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-1 bg-accent-gold/5 border border-accent-gold/20 rounded-lg w-fit">
                                 <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse" />
                                 <p className="text-[9px] font-black text-accent-gold uppercase tracking-tighter">Code: {order.skin_coupon_code}</p>
                               </div>
                             )}
                           </div>
                        </div>
                      </div>

                      <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="mt-10 pt-10 border-t border-secondary-ivory/50 space-y-12">
                            
                            {/* Tracking Progress */}
                            <div>
                                <p className="text-[10px] font-black text-accent-gold uppercase tracking-[0.4em] mb-10 text-center">Current Position</p>
                                <div className="relative px-4 max-w-2xl mx-auto mb-10">
                                  <div className="absolute top-5 left-8 right-8 h-1 bg-secondary-ivory rounded-full overflow-hidden">
                                     <div className="h-full bg-accent-gold transition-all duration-1000" style={{ width: `${Math.max(0, (currentStep - 1) / 4 * 100)}%` }} />
                                  </div>
                                  <div className="relative flex justify-between">
                                    {TRACKING_STEPS.map((step) => {
                                      const isActive = currentStep >= step.step;
                                      const isCurrent = currentStep === step.step;
                                      return (
                                        <div key={step.id} className="flex flex-col items-center">
                                          <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-500 border-4 ${
                                            isActive ? 'bg-accent-gold border-accent-gold text-white shadow-lg' : 'bg-white border-secondary-ivory text-gray-300'
                                          } ${isCurrent ? 'scale-125 ring-8 ring-accent-gold/10' : ''}`}>
                                            {isActive ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 bg-current rounded-full" />}
                                          </div>
                                          <p className={`text-[9px] font-black uppercase tracking-widest mt-4 ${isActive ? 'text-text-dark' : 'text-gray-300'}`}>{step.label}</p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="bg-secondary-ivory/20 p-8 md:p-10 rounded-[2.5rem] border border-secondary-ivory">
                              <h4 className="text-[10px] font-black text-text-dark uppercase tracking-widest mb-8">Purchased Items</h4>
                              <div className="space-y-6">
                                {order.skin_items?.map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-6">
                                    <div className="relative w-20 h-20 bg-white rounded-2xl overflow-hidden border border-secondary-ivory shadow-sm flex-shrink-0">
                                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                      <div className="absolute top-1 right-1 bg-text-dark text-white w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black border-2 border-white">{item.quantity}</div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-black text-text-dark truncate uppercase tracking-tight">{item.name}</p>
                                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">{formatPrice(item.price)} each</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-black text-text-dark">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-10 pt-8 border-t border-secondary-ivory flex justify-between items-center font-black">
                                <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Total Paid</span>
                                <span className="text-xl text-text-dark">{formatPrice(totalAmount)}</span>
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-secondary-ivory">
              <div className="w-20 h-20 bg-secondary-ivory rounded-full flex items-center justify-center text-text-muted mx-auto mb-8"><ShoppingBag size={40} /></div>
              <h2 className="text-3xl font-black text-text-dark mb-4">No Orders Found</h2>
              <p className="text-text-muted max-w-md mx-auto font-medium mb-10">
                {isGuest
                  ? 'Use the lookup above with your order email and order ID, or start a new order from our collections.'
                  : 'Start your skincare journey by exploring our premium collections.'}
              </p>
              <Link href="/collections/all"><button className="px-10 py-4 bg-text-dark text-white rounded-full font-black text-xs tracking-widest uppercase hover:bg-accent-gold transition-all shadow-xl">Start Shopping</button></Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
