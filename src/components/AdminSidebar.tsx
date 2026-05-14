"use client";

import React, { useMemo } from 'react';
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
  BrainCircuit
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export const AdminSidebar = React.memo(() => {
  const pathname = usePathname();
  const router = useRouter();

  const [notifications, setNotifications] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling for admin
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    const { createClient } = await import('@/lib/supabase');
    const supabase = createClient();
    const { data } = await supabase
      .from('skin_marketer_notifications')
      .select('*')
      .eq('skin_user_id', '00000000-0000-0000-0000-000000000000') // Placeholder for admin
      .eq('skin_is_read', false);
    
    // In a real app, admin notifications might have a different user_id or system flag.
    // For now, let's also check for pending withdrawals and open tickets directly.
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
        { name: 'Payout Requests', href: '/admin/withdrawals', icon: <Wallet size={16} />, badge: getCount('withdrawal') },
        { name: 'Network Rules', href: '/admin/marketer-settings', icon: <Settings size={16} /> },
      ]
    },
    {
      title: "Catalog",
      items: [
        { name: 'Products', href: '/admin/products', icon: <Tag size={16} /> },
        { name: 'Collections', href: '/admin/collections', icon: <Layers size={16} /> },
        { name: 'Navigation Pins', href: '/admin/navigation', icon: <Compass size={16} /> },
      ]
    },
    {
      title: "Logistics",
      items: [
        { name: 'Orders', href: '/admin/orders', icon: <ShoppingBag size={16} /> },
        { name: 'Customers', href: '/admin/customers', icon: <Users size={16} /> },
      ]
    },
    {
      title: "Site Configuration",
      items: [
        { name: 'Store Settings', href: '/admin/settings', icon: <Settings size={16} /> },
        { name: 'System Health', href: '/admin/diagnostics', icon: <Sparkles size={16} /> },
      ]
    }
  ], [notifications]);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    router.push('/admin/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-secondary-ivory h-screen sticky top-0 flex flex-col transition-all duration-300 shadow-[20px_0_40px_rgba(0,0,0,0.01)]">
      <div className="p-8 border-b border-secondary-ivory bg-white">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-text-dark rounded-xl flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform duration-500">
             <span className="font-black text-lg">C</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tighter text-text-dark uppercase">COSRX India</span>
            <span className="text-[8px] font-black text-accent-gold uppercase tracking-[0.3em]">Management Suite</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {groups.map((group, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="px-4 text-[9px] font-black uppercase tracking-[0.3em] text-text-muted/60">{group.title}</h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
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
                    {isActive && !item.badge && (
                      <motion.div layoutId="active-indicator" className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
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

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f1f1; border-radius: 10px; }
      `}</style>
    </aside>
  );
});

AdminSidebar.displayName = 'AdminSidebar';
