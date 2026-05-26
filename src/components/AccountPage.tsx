"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Phone, ShoppingBag, Truck, MapPin, LogOut, ChevronRight, Package, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from './ui/Button';
import { formatPrice } from '@/lib/utils';

export const AccountPage = () => {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const [isChecking, setIsChecking] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Check if we already have a user in the store
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        setIsChecking(false);
        fetchProfile(currentUser.id, currentUser.email);
        return;
      }

      // 2. Fallback: verify with Supabase directly
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data.user) {
        // Account is optional. Show a soft "sign in" empty state instead of
        // hard-redirecting guests away.
        setIsGuest(true);
        setIsChecking(false);
        setLoading(false);
      } else {
        const { data: profileData } = await supabase
          .from('skin_user_profiles')
          .select('*')
          .eq('skin_id', data.user.id)
          .single();
        
        if (profileData) {
          useAuthStore.getState().setUser({
            id: data.user.id,
            email: data.user.email!,
            firstName: profileData.skin_first_name,
            lastName: profileData.skin_last_name,
            username: profileData.skin_username,
            phone: profileData.skin_phone,
          });
        }
        
        setIsChecking(false);
        fetchProfile(data.user.id, data.user.email!);
      }
    };

    checkAuth();
  }, [router]);

  const fetchProfile = async (targetId?: string, targetEmail?: string) => {
    try {
      const currentUserId = targetId || user?.id;
      const currentUserEmail = targetEmail || user?.email;

      if (!currentUserId) return;

      // 1. Fetch Profile
      let { data: profileData, error: profileError } = await supabase
        .from('skin_user_profiles')
        .select('*')
        .eq('skin_id', currentUserId)
        .maybeSingle();

      if (!profileData && !profileError) {
        handleLogout();
        return;
      }

      // 2. Fetch Orders
      const { data: ordersData } = await supabase
        .from('skin_orders')
        .select('*')
        .or(`skin_user_id.eq.${currentUserId},skin_customer_email.eq.${currentUserEmail}`)
        .order('skin_created_at', { ascending: false });

      if (profileData) {
        setProfile({
          ...profileData,
          skin_orders: ordersData || []
        });
      }

    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    router.push('/');
  };

  if (isChecking || loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-gold"></div>
    </div>
  );

  // Guest view — account is optional. Shopper can sign in or look up an order.
  if (isGuest) {
    return (
      <div className="container max-w-3xl py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] p-12 md:p-16 shadow-sm border border-secondary-ivory text-center"
        >
          <div className="w-20 h-20 rounded-[2rem] bg-secondary-ivory flex items-center justify-center text-text-dark mx-auto mb-8">
            <User size={36} />
          </div>
          <p className="text-[10px] font-black text-accent-gold uppercase tracking-[0.4em] mb-4">Optional Account</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-text-dark mb-6">Sign in (or skip it)</h1>
          <p className="text-text-muted text-base font-medium italic max-w-md mx-auto leading-relaxed mb-10">
            You can shop and track orders without an account. Sign in only if you want to save your details for next time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth"
              className="inline-flex h-14 px-10 rounded-full bg-text-dark text-white font-black text-[10px] tracking-[0.2em] uppercase items-center justify-center gap-2 hover:bg-accent-gold transition-all shadow-xl"
            >
              Sign In / Sign Up <ChevronRight size={14} />
            </Link>
            <Link
              href="/account/orders"
              className="inline-flex h-14 px-10 rounded-full bg-secondary-ivory text-text-dark font-black text-[10px] tracking-[0.2em] uppercase items-center justify-center gap-2 hover:bg-accent-gold hover:text-white transition-all"
            >
              <Package size={14} /> Track an Order
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-12 px-4">
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-secondary-ivory mb-12 flex flex-col md:flex-row items-center gap-10"
      >
        <div className="w-32 h-32 rounded-[2.5rem] bg-accent-gold/10 flex items-center justify-center text-accent-gold shadow-inner border-4 border-white">
          <User size={64} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <p className="text-[10px] font-black text-accent-gold uppercase tracking-[0.4em] mb-2">Authenticated Account</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-text-dark mb-4">
            Hey, {profile?.skin_username || user?.username || profile?.skin_first_name || user?.firstName || 'User'}!
          </h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm font-medium text-text-muted">
            <div className="flex items-center gap-2"><Mail size={16} /> {profile?.skin_email || user?.email}</div>
            <div className="flex items-center gap-2"><Phone size={16} /> {profile?.skin_phone || user?.phone || 'No phone set'}</div>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="px-8 py-4 bg-red-50 text-red-600 rounded-full font-black text-[10px] tracking-widest uppercase hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
        >
          <LogOut size={16} /> Logout
        </button>
      </motion.div>

      {/* Account Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Orders Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-secondary-ivory shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500"
        >
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary-ivory flex items-center justify-center text-text-dark group-hover:bg-accent-gold group-hover:text-white transition-colors">
                <ShoppingBag size={24} />
              </div>
              <h2 className="text-2xl font-black tracking-tight uppercase">Recent Orders</h2>
            </div>
            <button onClick={() => router.push('/account/orders')} className="text-[10px] font-black text-accent-gold uppercase tracking-widest hover:underline flex items-center gap-2">
              View All History <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="space-y-6">
            {profile?.skin_orders?.length > 0 ? (
              <div className="space-y-4 mb-8">
                {profile.skin_orders.slice(0, 2).map((order: any) => (
                  <div key={order.skin_id} className="flex items-center justify-between p-4 bg-secondary-ivory/30 rounded-2xl border border-secondary-ivory">
                    <div>
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Order #{order.skin_id.slice(0,8)}</p>
                      <p className="text-xs font-bold text-text-dark uppercase">{order.skin_status.replace(/_/g, ' ')}</p>
                    </div>
                    <span className="text-sm font-black text-text-dark">{formatPrice(order.skin_total_amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted font-medium italic mb-8">Track your premium COSRX shipments in real-time.</p>
            )}
            <Button 
              onClick={() => router.push('/account/orders')}
              variant="secondary"
              className="w-full h-16 rounded-[1.5rem] bg-secondary-ivory text-text-dark border-none font-black tracking-widest text-xs hover:bg-accent-gold hover:text-white"
            >
              <Truck size={18} className="mr-3" /> TRACK SHIPMENTS
            </Button>
          </div>
        </motion.div>

        {/* Info Cards */}
        <div className="space-y-8">
          {/* Security Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-text-dark rounded-[3rem] p-10 text-white shadow-xl relative overflow-hidden"
          >
            <ShieldCheck className="absolute -right-8 -top-8 w-32 h-32 text-white/10" />
            <h3 className="text-xl font-black uppercase tracking-widest mb-4">Security</h3>
            <p className="text-white/70 text-sm font-medium mb-8 leading-relaxed">Your account is secured with instant authentication. Keep your password safe.</p>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold">
               <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> 
               Active Session
            </div>
          </motion.div>

          {/* Support Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-accent-gold/10 rounded-[3rem] p-10 border border-accent-gold/20 shadow-sm"
          >
            <h3 className="text-xl font-black uppercase tracking-widest mb-4 text-text-dark">Support Center</h3>
            <p className="text-text-muted text-sm font-medium mb-8 leading-relaxed">Have questions about your order or products? Raise a ticket and track resolutions here.</p>
            <Button 
              onClick={() => router.push('/support')}
              className="w-full h-12 rounded-2xl bg-white text-text-dark border-none shadow-sm font-black tracking-widest text-[10px]"
            >
              MY TICKETS
            </Button>
          </motion.div>
        </div>

      </div>
    </div>
  );
};
