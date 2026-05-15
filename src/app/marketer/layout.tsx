"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  Ticket, 
  TrendingUp, 
  LogOut, 
  Loader2,
  User,
  Shield,
  ShoppingBag,
  Menu,
  X,
  LifeBuoy
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarketerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [marketer, setMarketer] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    setIsSidebarOpen(false); // Close sidebar on route change
    if (pathname === '/marketer/login') {
      setLoading(false);
      return;
    }
    checkAuth();
  }, [pathname]);

  useEffect(() => {
    if (marketer) {
      fetchNotifications();
    }
  }, [marketer, pathname]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('skin_marketer_notifications')
      .select('*')
      .eq('skin_user_id', marketer.skin_id)
      .eq('skin_is_read', false);
    if (data) setNotifications(data);
  };
  const checkAuth = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      router.replace('/marketer/login');
      return;
    }

    const { data: profile } = await supabase
      .from('skin_marketers')
      .select('*')
      .eq('skin_id', user.id)
      .single();

    if (!profile || !profile.skin_is_active) {
      await supabase.auth.signOut();
      router.replace('/marketer/login');
      return;
    }

    setMarketer(profile);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/marketer/login');
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-accent-gold" size={40} />
      </div>
    );
  }

  if (pathname === '/marketer/login') return <>{children}</>;

  const menuItems = [
    { label: 'Overview', icon: <LayoutDashboard size={18} />, path: '/marketer/dashboard', type: 'workspace' },
    { label: 'Campaigns', icon: <Ticket size={18} />, path: '/marketer/coupons', type: 'workspace' },
    { label: 'Financials', icon: <TrendingUp size={18} />, path: '/marketer/earnings', type: 'workspace' },
    { label: 'Sales Tracking', icon: <ShoppingBag size={18} />, path: '/marketer/orders', type: 'workspace' },
    { label: 'Withdrawals', icon: <Shield size={18} />, path: '/marketer/withdraw', type: 'financial' },
    { label: 'Support', icon: <LifeBuoy size={18} />, path: '/marketer/support', type: 'help' }, 
    { label: 'Settings', icon: <User size={18} />, path: '/marketer/settings', type: 'account' },
  ];

  // Updated menuItems with custom icons
  const workspaceItems = [
    { label: 'Overview', icon: <LayoutDashboard size={18} />, path: '/marketer/dashboard', type: 'dashboard' },
    { label: 'Campaigns', icon: <Ticket size={18} />, path: '/marketer/coupons', type: 'campaign' },
    { label: 'Sales Tracking', icon: <ShoppingBag size={18} />, path: '/marketer/orders', type: 'sales' },
    { label: 'Financials', icon: <TrendingUp size={18} />, path: '/marketer/earnings', type: 'financial' },
  ];

  const accountItems = [
    { label: 'Withdrawals', icon: <Shield size={18} />, path: '/marketer/withdraw', type: 'withdrawal' },
    { label: 'Platform Rules', icon: <Shield size={18} />, path: '/marketer/rules', type: 'rules' },
    { label: 'Support Tickets', icon: <LifeBuoy size={18} />, path: '/marketer/support', type: 'support' }, 
    { label: 'Settlement Settings', icon: <User size={18} />, path: '/marketer/settings', type: 'settings' },
  ];

  const getUnreadCount = (type: string) => {
    return notifications.filter(n => n.skin_type === type).length;
  };

  const SidebarContent = () => (
    <>
      <div className="p-10">
        <Link href="/" className="flex flex-col">
          <span className="text-2xl font-black tracking-tighter uppercase italic leading-none text-text-dark">COSRX</span>
          <span className="text-[10px] font-black text-accent-gold uppercase tracking-[0.3em] mt-1 ml-0.5">Affiliate</span>
        </Link>
      </div>

      <nav className="flex-1 px-6 space-y-8">
        <div className="space-y-2">
          <p className="px-4 text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Workspace</p>
          {workspaceItems.map((item) => (
            <Link
              key={item.label}
              href={item.path}
              className={`
                flex items-center justify-between px-4 h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all
                ${pathname === item.path ? 'bg-text-dark text-white shadow-xl shadow-text-dark/10' : 'text-text-muted hover:bg-secondary-ivory/50'}
              `}
            >
              <div className="flex items-center gap-4">
                {item.icon}
                {item.label}
              </div>
              {getUnreadCount(item.type) > 0 && (
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/40" />
              )}
            </Link>
          ))}
        </div>

        <div className="space-y-2">
          <p className="px-4 text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Security & Settlement</p>
          {accountItems.map((item) => (
            <Link
              key={item.label}
              href={item.path}
              className={`
                flex items-center justify-between px-4 h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all
                ${pathname === item.path ? 'bg-text-dark text-white shadow-xl shadow-text-dark/10' : 'text-text-muted hover:bg-secondary-ivory/50'}
              `}
            >
              <div className="flex items-center gap-4">
                {item.icon}
                {item.label}
              </div>
              {getUnreadCount(item.type) > 0 && (
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/40" />
              )}
            </Link>
          ))}
        </div>
      </nav>

      <div className="p-6">
        <div className="bg-secondary-ivory/30 rounded-3xl p-6 border border-secondary-ivory">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-text-dark text-white flex items-center justify-center font-black text-xs">
              {marketer?.skin_name?.[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-black text-text-dark truncate uppercase">{marketer?.skin_name}</p>
              <p className="text-[9px] font-bold text-text-muted truncate uppercase">{marketer?.skin_email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full h-12 rounded-xl bg-white text-red-500 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-50 transition-all border border-red-100"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] text-text-dark font-sans selection:bg-accent-gold/20">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-secondary-ivory flex-col fixed inset-y-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-secondary-ivory z-[60] px-6 flex items-center justify-between">
        <Link href="/" className="flex flex-col">
          <span className="text-xl font-black tracking-tighter uppercase italic leading-none">COSRX</span>
          <span className="text-[8px] font-black text-accent-gold uppercase tracking-[0.2em]">Affiliate</span>
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="w-12 h-12 rounded-2xl bg-secondary-ivory/50 flex items-center justify-center text-text-dark hover:bg-text-dark hover:text-white transition-all"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-xs bg-white z-[80] shadow-2xl flex flex-col lg:hidden"
            >
              <div className="absolute top-6 right-6">
                <button onClick={() => setIsSidebarOpen(false)} className="w-10 h-10 rounded-full bg-secondary-ivory flex items-center justify-center">
                  <X size={20} />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 overflow-x-hidden p-6 md:p-10 pt-28 lg:pt-10 scroll-smooth">
        <div className="max-w-6xl mx-auto">
          <Suspense fallback={<div className="py-20 flex justify-center"><Loader2 className="animate-spin text-accent-gold" /></div>}>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
