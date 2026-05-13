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
  Shield
} from 'lucide-react';
import Link from 'next/link';

export default function MarketerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [marketer, setMarketer] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    if (pathname === '/marketer/login') {
      setLoading(false);
      return;
    }
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace('/marketer/login');
      return;
    }

    const { data: profile } = await supabase
      .from('skin_marketers')
      .select('*')
      .eq('skin_id', session.user.id)
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
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/marketer/dashboard' },
    { label: 'Coupons', icon: <Ticket size={18} />, path: '/marketer/dashboard' }, // Same for now
    { label: 'Earnings', icon: <TrendingUp size={18} />, path: '/marketer/dashboard' }, // Same for now
  ];

  return (
    <div className="flex min-h-screen bg-secondary-ivory/20 text-text-dark font-sans selection:bg-accent-gold/20">
      {/* Sidebar - Admin Style */}
      <aside className="w-72 bg-white border-r border-secondary-ivory flex flex-col fixed inset-y-0 z-50">
        <div className="p-10">
          <Link href="/" className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter uppercase italic leading-none">COSRX</span>
            <span className="text-[10px] font-black text-accent-gold uppercase tracking-[0.3em] mt-1 ml-0.5">Affiliate</span>
          </Link>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          <p className="px-4 text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Workspace</p>
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.path}
              className={`
                flex items-center gap-4 px-4 h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all
                ${pathname === item.path ? 'bg-text-dark text-white shadow-xl shadow-text-dark/10' : 'text-text-muted hover:bg-secondary-ivory/50'}
              `}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 overflow-x-hidden p-6 md:p-10 scroll-smooth">
        <div className="max-w-6xl mx-auto">
          <Suspense fallback={<Loader2 className="animate-spin text-accent-gold" />}>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
