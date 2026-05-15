"use client";

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Tag, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight,
  Layers,
  ShieldCheck,
  Compass,
  MessageSquare,
  Ticket,
  Zap,
  Image as ImageIcon,
  Sparkles,
  Wallet,
  BrainCircuit,
  TrendingUp,
  Package,
  CreditCard
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminSidebar = React.memo(() => {
  const pathname = usePathname();
  const router = useRouter();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); 
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    const { createClient } = await import('@/lib/supabase');
    const supabase = createClient();
    
    const [{ count: withdrawals }, { count: openTickets }, { count: payments }] = await Promise.all([
      supabase.from('skin_marketer_withdrawals').select('*', { count: 'exact', head: true }).eq('skin_status', 'pending'),
      supabase.from('skin_tickets').select('*', { count: 'exact', head: true }).eq('skin_status', 'Open'),
      supabase.from('skin_orders').select('*', { count: 'exact', head: true }).eq('skin_status', 'under_review').not('skin_utr', 'is', null)
    ]);

    setNotifications([
      ...(withdrawals ? new Array(withdrawals).fill({ type: 'withdrawal' }) : []),
      ...(openTickets ? new Array(openTickets).fill({ type: 'ticket' }) : []),
      ...(payments ? new Array(payments).fill({ type: 'payment' }) : [])
    ]);
  };

  const getCount = (type: string) => {
    return notifications.filter(n => n.type === type).length;
  };

  const groups = useMemo(() => [
    {
      title: "Store Overview",
      items: [
        { name: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={16} /> },
        { name: 'Payments Review', href: '/admin/payments', icon: <ShieldCheck size={16} />, badge: getCount('payment') },
        { name: 'Support Tickets', href: '/admin/tickets', icon: <MessageSquare size={16} />, badge: getCount('ticket') },
      ]
    },
    {
      title: "Marketing & Growth",
      items: [
        { name: 'Store Coupons', href: '/admin/coupons', icon: <Ticket size={16} /> },
      ]
    },
    {
      title: "Affiliate Network",
      items: [
        { name: 'Partner List', href: '/admin/marketers', icon: <Users size={16} /> },
        { name: 'Conversion Logs', href: '/admin/marketer-coupons/usage', icon: <TrendingUp size={16} /> },
        { name: 'Payout Requests', href: '/admin/withdrawals', icon: <Wallet size={16} />, badge: getCount('withdrawal') },
        { name: 'Network Rules', href: '/admin/marketer-settings', icon: <Settings size={16} /> },
      ]
    },
    {
      title: "Catalog",
      items: [
        { name: 'Collection List', href: '/admin/collections', icon: <Layers size={16} /> },
        { name: 'Product Inventory', href: '/admin/products', icon: <Tag size={16} /> },
      ]
    },
    {
      title: "Logistics",
      items: [
        { name: 'All Orders', href: '/admin/orders', icon: <ShoppingBag size={16} /> },
        { name: 'Prepaid Orders', href: '/admin/orders/prepaid', icon: <CreditCard size={16} /> },
        { name: 'COD Orders', href: '/admin/orders/cod', icon: <Package size={16} /> },
        { name: 'Customers', href: '/admin/customers', icon: <Users size={16} /> },
      ]
    },
    {
      title: "Site Configuration",
      items: [
        { name: 'Store Settings', href: '/admin/settings', icon: <Settings size={16} /> },
        { name: 'Payment Setup', href: '/admin/settings/upi', icon: <CreditCard size={16} /> },
        { name: 'System Health', href: '/admin/diagnostics', icon: <Sparkles size={16} /> },
      ]
    }
  ], [notifications]);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    router.push('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-8 border-b border-secondary-ivory">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-text-dark rounded-xl flex items-center justify-center text-white shadow-xl">
             <span className="font-black text-lg">C</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-black tracking-tighter text-text-dark uppercase">COSRX India</span>
            <span className="text-[8px] font-black text-accent-gold uppercase tracking-[0.3em]">Management Suite</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {groups.map((group, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="px-4 text-[9px] font-black uppercase tracking-[0.3em] text-text-muted/60 text-left">{group.title}</h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group text-[11px] font-black uppercase tracking-widest",
                      isActive 
                        ? "bg-text-dark text-white shadow-lg shadow-text-dark/20 translate-x-1" 
                        : "text-text-muted hover:bg-secondary-ivory hover:text-text-dark"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(isActive ? "text-accent-gold" : "text-text-muted group-hover:text-text-dark transition-colors")}>
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center px-1 shadow-lg shadow-red-500/20">
                         {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-6 border-t border-secondary-ivory bg-secondary-ivory/10">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-text-muted hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300 text-[10px] font-black uppercase tracking-widest"
        >
          <LogOut size={16} />
          <span>Terminate Session</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-secondary-ivory z-[60] px-6 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-text-dark rounded-xl flex items-center justify-center text-white shadow-md">
             <span className="font-black">C</span>
          </div>
          <span className="text-[10px] font-black tracking-[0.2em] text-text-dark uppercase">Admin Suite</span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="w-12 h-12 rounded-2xl bg-secondary-ivory flex items-center justify-center text-text-dark hover:bg-text-dark hover:text-white transition-all shadow-sm"
        >
          <Compass size={20} />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-secondary-ivory h-screen sticky top-0 flex-col transition-all duration-300 shadow-[20px_0_40px_rgba(0,0,0,0.01)]">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-xs bg-white z-[110] shadow-2xl flex flex-col lg:hidden"
            >
              <div className="absolute top-6 right-6 z-[120]">
                <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 rounded-full bg-secondary-ivory flex items-center justify-center shadow-md">
                  <ChevronRight size={20} className="rotate-180" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
});

AdminSidebar.displayName = 'AdminSidebar';
