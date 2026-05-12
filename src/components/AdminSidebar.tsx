"use client";

import React from 'react';
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
  ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';

export const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'Payments Review', href: '/admin/payments', icon: <ShieldCheck size={18} /> },
    { name: 'Orders', href: '/admin/orders', icon: <ShoppingBag size={18} /> },
    { name: 'Products', href: '/admin/products', icon: <Tag size={18} /> },
    { name: 'Collections', href: '/admin/collections', icon: <Layers size={18} /> },
    { name: 'Navigation', href: '/admin/navigation', icon: <Layers size={18} /> },
    { name: 'Store Settings', href: '/admin/settings', icon: <Settings size={18} /> },
    { name: 'Customers', href: '/admin/customers', icon: <Users size={18} /> },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    router.push('/admin/login');
  };

  return (
    <aside className="w-60 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-gray-200 bg-gray-50/50">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-black">COSRX</span>
          <span className="bg-black text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-colors group text-sm",
                isActive 
                  ? "bg-black text-white font-bold" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-black"
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn(isActive ? "text-white" : "text-gray-400 group-hover:text-black")}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </div>
              <ChevronRight size={14} className={cn("opacity-50", isActive ? "opacity-100" : "hidden group-hover:block")} />
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 w-full text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
