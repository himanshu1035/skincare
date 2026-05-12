"use client";

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { Package, Truck, CheckCircle2, Clock, MapPin, IndianRupee, ArrowRight, Loader2, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const STATUS_MAP = {
  'under_review': { label: 'Payment Under Review', icon: <Clock size={18} />, color: 'text-orange-600', bg: 'bg-orange-50', step: 0 },
  'pending': { label: 'Pending Confirmation', icon: <Clock size={18} />, color: 'text-yellow-600', bg: 'bg-yellow-50', step: 1 },
  'processing': { label: 'Processing Order', icon: <Package size={18} />, color: 'text-blue-600', bg: 'bg-blue-50', step: 2 },
  'shipped': { label: 'In Transit', icon: <Truck size={18} />, color: 'text-purple-600', bg: 'bg-purple-50', step: 3 },
  'out_for_delivery': { label: 'Out for Delivery', icon: <Truck size={18} />, color: 'text-orange-600', bg: 'bg-orange-50', step: 4 },
  'delivered': { label: 'Delivered', icon: <CheckCircle2 size={18} />, color: 'text-green-600', bg: 'bg-green-50', step: 5 },
  'cancelled': { label: 'Order Cancelled', icon: <CheckCircle2 size={18} />, color: 'text-red-600', bg: 'bg-red-50', step: -1 },
};

const TRACKING_STEPS = [
  { id: 'pending', label: 'Ordered', step: 1 },
  { id: 'processing', label: 'Packed', step: 2 },
  { id: 'shipped', label: 'Shipped', step: 3 },
  { id: 'delivered', label: 'Delivered', step: 5 },
];

export default function UserOrdersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session && !user) {
        router.push('/auth');
        return;
      }
      
      setIsCheckingAuth(false);
      
      if (session?.user?.id || user?.id) {
         fetchUserOrders(session?.user?.id || user?.id);
      }
    };
    
    checkUser();
  }, [user, router]);

  const fetchUserOrders = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('skin_orders')
      .select('*')
      .eq('skin_user_id', userId)
      .order('skin_created_at', { ascending: false });
    
    if (data) setOrders(data);
    setLoading(false);
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (isCheckingAuth) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-accent-gold" size={40} /></div>;

  return (
    <main className="min-h-screen bg-secondary-ivory/20">
      <Navbar />
      <div className="pt-40 pb-24">
        <div className="container max-w-5xl">
          <header className="mb-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
              <Link href="/account" className="text-[10px] font-black text-accent-gold uppercase tracking-[0.3em] mb-4 flex items-center gap-2 hover:translate-x-1 transition-transform">
                <ArrowRight className="rotate-180" size={14} /> Back to Profile
              </Link>
              <h1 className="text-5xl font-black tracking-tighter text-text-dark">Order History</h1>
              <p className="text-text-muted mt-4 font-medium italic">Track your premium COSRX shipments in real-time.</p>
            </div>
            <div className="px-6 py-3 bg-white rounded-2xl shadow-sm border border-gray-100">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Total Orders</p>
              <p className="text-2xl font-black text-text-dark">{orders.length}</p>
            </div>
          </header>

          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <Loader2 className="animate-spin text-accent-gold" size={40} />
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => {
                const status = (STATUS_MAP as any)[order.skin_status] || STATUS_MAP.pending;
                const isExpanded = expandedOrder === order.skin_id;
                const currentStep = status.step;

                return (
                  <div key={order.skin_id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500">
                    <div className="p-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-gray-50">
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl ${status.bg} ${status.color} flex items-center justify-center`}>
                            {status.icon}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Order Status</p>
                            <h3 className={`text-xl font-black uppercase tracking-tight ${status.color}`}>{status.label}</h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="hidden md:flex flex-col items-end text-right">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Total Amount</p>
                            <p className="text-lg font-black text-text-dark">{formatPrice(order.skin_total_amount || order.skin_total)}</p>
                          </div>
                          <button 
                            onClick={() => toggleOrder(order.skin_id)}
                            className="w-12 h-12 rounded-full bg-secondary-ivory flex items-center justify-center text-text-dark hover:bg-accent-gold hover:text-white transition-all shadow-sm"
                          >
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-4">
                        <div className="md:col-span-1">
                           <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2"><MapPin size={12} /> Ship To</p>
                           <p className="text-xs font-bold text-text-dark leading-relaxed truncate">{order.skin_shipping_address}</p>
                        </div>
                        <div className="md:col-span-1">
                           <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2"><IndianRupee size={12} /> Payment</p>
                           <p className="text-xs font-bold text-text-dark uppercase">{order.skin_payment_method} - {order.skin_payment_status || 'UNPAID'}</p>
                        </div>
                        <div className="lg:col-span-2">
                           <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Order Date</p>
                           <p className="text-xs font-bold text-text-dark">{new Date(order.skin_created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                      </div>

                      {/* Expandable Tracking Section */}
                      {isExpanded && (
                        <div className="mt-8 pt-8 border-t border-gray-50 animate-in fade-in slide-in-from-top-4 duration-500">
                          <p className="text-[10px] font-black text-accent-gold uppercase tracking-[0.4em] mb-10 text-center">Transportation Status</p>
                          
                          <div className="relative px-4 max-w-2xl mx-auto mb-10">
                            {/* Line Container */}
                            <div className="absolute top-5 left-8 right-8 h-1 bg-gray-100 rounded-full overflow-hidden">
                               <div 
                                 className="h-full bg-accent-gold transition-all duration-1000" 
                                 style={{ width: `${Math.max(0, (currentStep - 1) / 4 * 100)}%` }}
                               />
                            </div>
                            
                            {/* Steps Container */}
                            <div className="relative flex justify-between">
                              {TRACKING_STEPS.map((step) => {
                                const isActive = currentStep >= step.step;
                                const isCurrent = currentStep === step.step;
                                return (
                                  <div key={step.id} className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-500 border-4 ${
                                      isActive ? 'bg-accent-gold border-accent-gold text-white shadow-lg' : 'bg-white border-gray-100 text-gray-300'
                                    } ${isCurrent ? 'scale-125 ring-8 ring-accent-gold/10' : ''}`}>
                                      {isActive ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 bg-current rounded-full" />}
                                    </div>
                                    <p className={`text-[9px] font-black uppercase tracking-widest mt-4 ${isActive ? 'text-text-dark' : 'text-gray-300'}`}>
                                      {step.label}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="bg-secondary-ivory/30 p-8 rounded-[2rem] border border-secondary-ivory/50">
                             <div className="flex items-center gap-4 mb-4">
                                <Truck size={20} className="text-accent-gold" />
                                <h4 className="text-sm font-black uppercase tracking-widest text-text-dark">Tracking Update</h4>
                             </div>
                             <p className="text-xs text-text-muted font-medium leading-relaxed italic">
                               {currentStep === 5 ? 'Your package has been delivered. We hope you enjoy your premium skincare!' : 
                                currentStep === 3 ? 'Your package is currently in transit. Use the Order ID to track with our courier partner.' :
                                currentStep === 1 ? 'Your order has been received and is waiting for payment verification.' :
                                'Our team is preparing your package for shipment. You will receive an update soon.'}
                             </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-secondary-ivory rounded-full flex items-center justify-center text-text-muted mx-auto mb-8">
                <ShoppingBag size={40} />
              </div>
              <h2 className="text-3xl font-black text-text-dark mb-4">No Orders Yet</h2>
              <p className="text-text-muted max-w-md mx-auto font-medium mb-10">You haven't placed any orders yet. Explore our collections to start your skincare journey.</p>
              <Link href="/collections/all">
                <button className="px-10 py-4 bg-text-dark text-white rounded-full font-black text-xs tracking-widest uppercase hover:bg-accent-gold transition-all shadow-xl">
                  Start Shopping
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
