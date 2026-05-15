"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, User, Menu, X, ChevronDown, Package, Truck, Zap, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import dynamic from 'next/dynamic';

const CartDrawer = dynamic(() => import('./CartDrawer').then(mod => mod.CartDrawer), {
  ssr: false,
});
const SearchOverlay = dynamic(() => import('./SearchOverlay').then(mod => mod.SearchOverlay), {
  ssr: false,
});
import { createClient } from '@/lib/supabase';

export const Navbar = React.memo(() => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [announcementText, setAnnouncementText] = useState('FREE SHIPPING ON ORDERS OVER ₹1000');
  const [pinnedCollections, setPinnedCollections] = useState<any[]>([]);
  
  const { items } = useCartStore();
  const { user } = useAuthStore();
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('skin_settings')
        .select('*')
        .eq('skin_key', 'announcement_text')
        .single();
      if (data) setAnnouncementText(data.skin_value);
    };

    const fetchCollections = async () => {
      const { data } = await supabase
        .from('skin_collections')
        .select('skin_name, skin_slug')
        .neq('skin_slug', 'dermskincare-guide') // Filter out the guide
        .order('skin_name');
      if (data) setCollections(data);
    };

    const fetchPinnedCollections = async () => {
      const { data: pinned } = await supabase
        .from('skin_collections')
        .select('skin_name, skin_slug')
        .eq('skin_is_pinned', true)
        .order('skin_name');
      if (pinned) setPinnedCollections(pinned);
    };

    // Sync cart with user session
    useCartStore.getState().syncUser(user?.id || null);

    fetchSettings();
    fetchCollections();
    fetchPinnedCollections();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Hardcoded Top Bar Menus as requested
  const topNavLinks = [
    { name: 'Shop All', href: '/collections/all' },
    { name: 'Best Seller', href: '/collections/best' },
    { name: 'Snail Mucin', href: '/collections/snail-mucin' },
    { name: 'Sun Protection', href: '/collections/sun-protection' },
  ];

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[60] bg-white text-[10px] font-black tracking-[0.2em] uppercase py-2 text-center border-b border-secondary-ivory">
        {announcementText}
      </div>
      <nav 
        className={`fixed top-8 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'bg-white/90 backdrop-blur-md py-3 shadow-sm border-b border-gray-100' : 'bg-transparent py-6'
        }`}
      >
        <div className="container flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-3xl font-black tracking-tighter text-text-dark">COSRX</span>
          </Link>

          {/* Desktop Nav - Dynamic Menus */}
          <div className="hidden lg:flex items-center space-x-10">
            <Link 
              href="/collections/all"
              className="text-[11px] font-black text-text-dark hover:text-accent-gold transition-colors tracking-[0.2em] uppercase"
            >
              Shop All
            </Link>

            <Link 
              href="/best-sellers"
              className="text-[11px] font-black text-accent-gold hover:text-text-dark transition-colors tracking-[0.2em] uppercase flex items-center gap-1.5"
            >
              <Star size={12} fill="currentColor" /> Best Sellers
            </Link>
            
            {pinnedCollections
              .filter(col => col.skin_slug !== 'best-sellers') // Avoid duplicate with the hardcoded link above
              .map((col) => (
                <Link 
                  key={col.skin_slug} 
                  href={`/collections/${col.skin_slug}`}
                  className="text-[11px] font-black text-text-dark hover:text-accent-gold transition-colors tracking-[0.2em] uppercase"
                >
                  {col.skin_name}
                </Link>
              ))}


            
            {/* Mega Menu Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 text-[11px] font-black text-text-dark hover:text-accent-gold transition-colors tracking-[0.2em] uppercase">
                All Collections <ChevronDown size={14} />
              </button>
              
              <div className="absolute top-full -right-20 mt-4 w-[800px] bg-white border border-gray-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl p-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 z-50 transform translate-y-2 group-hover:translate-y-0">
                <div className="grid grid-cols-4 gap-12">
                  <div className="col-span-1">
                    <p className="text-[10px] font-black text-accent-gold uppercase tracking-[0.3em] mb-6">Discovery</p>
                    <ul className="space-y-4">
                      <li><Link href="/collections/all" className="text-xs font-bold text-text-dark hover:text-accent-gold transition-colors uppercase">View All Products</Link></li>
                      <li><Link href="/collections/best" className="text-xs font-bold text-text-dark hover:text-accent-gold transition-colors uppercase">Best Sellers</Link></li>
                      <li><Link href="/collections/new" className="text-xs font-bold text-text-dark hover:text-accent-gold transition-colors uppercase">New Arrivals</Link></li>
                    </ul>
                  </div>
                  <div className="col-span-3 grid grid-cols-3 gap-x-8 gap-y-4 pt-1 border-l border-gray-100 pl-12 overflow-y-auto max-h-[400px]">
                    {collections.map((col) => (
                      <Link 
                        key={col.skin_slug} 
                        href={`/collections/${col.skin_slug}`}
                        className="text-[11px] font-bold text-text-muted hover:text-text-dark transition-colors uppercase tracking-widest truncate"
                      >
                        {col.skin_name}
                      </Link>
                    ))}
                  </div>
                </div>


              </div>
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-5 lg:space-x-8">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-1 hover:text-accent-gold transition-colors"
            >
              <Search size={22} />
            </button>
            <Link href="/account/orders" className="p-1 hover:text-accent-gold transition-colors" title="My Orders">
              <Package size={22} />
            </Link>
            <Link href={user ? "/account" : "/auth"} className="p-1 hover:text-accent-gold transition-colors" title="My Account">
              <User size={22} />
            </Link>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-1 hover:text-accent-gold transition-colors group"
            >
              <ShoppingBag size={22} />
              {isMounted && items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-text-dark text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {items.length}
                </span>
              )}
            </button>
            
            <button 
              className="lg:hidden p-2 text-text-dark"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-white lg:hidden overflow-y-auto"
          >
            <div className="p-8 flex flex-col h-full">
              <div className="flex items-center justify-between mb-12">
                <span className="text-xl font-black tracking-tighter">COSRX</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                  <X size={24} />
                </button>
              </div>
              <div className="flex flex-col space-y-8">
                 <button 
                  onClick={() => { setIsMobileMenuOpen(false); setIsSearchOpen(true); }}
                  className="flex items-center gap-4 text-2xl font-black border-b border-gray-100 pb-4 uppercase tracking-tighter text-left"
                >
                  <Search size={24} /> SEARCH
                </button>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-accent-gold uppercase tracking-[0.4em]">Quick Access</p>
                    <Link href="/collections/all" className="block text-xl font-bold uppercase tracking-tight" onClick={() => setIsMobileMenuOpen(false)}>
                      Shop All
                    </Link>
                    {pinnedCollections.map((col) => (
                      <Link key={col.skin_slug} href={`/collections/${col.skin_slug}`} className="block text-xl font-bold uppercase tracking-tight" onClick={() => setIsMobileMenuOpen(false)}>
                        {col.skin_name}
                      </Link>
                    ))}
                  </div>
                <div className="pt-8 border-t border-gray-100">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] mb-6">Explore Collections</p>
                  <div className="grid grid-cols-1 gap-4">
                    {collections.map((col) => (
                      <Link key={col.skin_slug} href={`/collections/${col.skin_slug}`} className="text-sm font-bold text-text-muted hover:text-black uppercase" onClick={() => setIsMobileMenuOpen(false)}>
                        {col.skin_name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
});
