import React from 'react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="bg-text-dark text-white pt-24 pb-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          {/* Brand Info */}
          <div className="space-y-8">
            <h3 className="text-3xl font-black tracking-tighter">COSRX</h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Dermatologically tested skincare for all skin types. We believe in providing solutions for your skin concerns.
            </p>
            <div className="flex space-x-6">
              {/* Social links placeholder */}
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-8">
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-accent-gold">Shop</h4>
            <ul className="space-y-4">
              <li><Link href="/collections/all" className="text-white/60 hover:text-white transition-colors text-sm font-medium">Shop All</Link></li>
              <li><Link href="/collections/best-sellers" className="text-white/60 hover:text-white transition-colors text-sm font-medium">Best Sellers</Link></li>
              <li><Link href="/collections/new-arrivals" className="text-white/60 hover:text-white transition-colors text-sm font-medium">New Arrivals</Link></li>
              <li><Link href="/collections/snail-mucin" className="text-white/60 hover:text-white transition-colors text-sm font-medium">Snail Mucin</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-8">
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-accent-gold">Account</h4>
              <ul className="space-y-4">
                <li><Link href="/account" className="text-white/60 hover:text-white transition-colors text-sm font-medium">My Profile</Link></li>
                <li><Link href="/account" className="text-white/60 hover:text-white transition-colors text-sm font-medium">My Orders</Link></li>
                <li><Link href="/shipping" className="text-white/60 hover:text-white transition-colors text-sm font-medium">Shipping Info</Link></li>
                <li><Link href="/returns" className="text-white/60 hover:text-white transition-colors text-sm font-medium">Returns Policy</Link></li>
              </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-8">
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-accent-gold">Stay Connected</h4>
            <p className="text-white/60 text-sm leading-relaxed">
              Join our newsletter to receive the latest updates and exclusive offers.
            </p>
            <form className="relative group">
              <input 
                type="email" 
                placeholder="YOUR EMAIL" 
                className="w-full bg-white/5 border-b border-white/20 px-0 py-4 text-xs font-bold tracking-widest focus:outline-none focus:border-accent-gold transition-colors"
              />
              <button className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-bold tracking-widest hover:text-accent-gold transition-colors">
                JOIN
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-white/10 text-[10px] font-bold tracking-[0.2em] text-white/40 space-y-4 md:space-y-0">
          <p>© {new Date().getFullYear()} COSRX OFFICIAL. POWERED BY NEXT.JS</p>
          <div className="flex space-x-8">
            <Link href="/privacy" className="hover:text-white transition-colors">PRIVACY POLICY</Link>
            <Link href="/terms" className="hover:text-white transition-colors">TERMS OF SERVICE</Link>
            <Link href="/contact" className="hover:text-white transition-colors">CONTACT US</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
