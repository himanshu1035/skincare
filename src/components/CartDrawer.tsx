"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShoppingCart, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { Button } from './ui/Button';
import { formatPrice, SHIPPING_THRESHOLD } from '@/lib/utils';
import { CouponInput } from './CouponInput';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, promoItems, removeItem, updateQuantity, getTotal, discountAmount, promoSavings, getGrandTotal } = useCartStore();
  const [threshold, setThreshold] = React.useState(1000);
  
  React.useEffect(() => {
    const fetchSettings = async () => {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      const { data } = await supabase
        .from('skin_settings')
        .select('*')
        .eq('skin_key', 'free_shipping_threshold')
        .single();
      if (data) setThreshold(parseInt(data.skin_value));
    };
    fetchSettings();
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const total = getTotal();
  const progress = Math.min((total / threshold) * 100, 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay - High Z-Index & Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-text-dark/40 backdrop-blur-sm z-[9998]"
          />

          {/* Drawer - Premium Styling */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-screen w-full max-w-[480px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.15)] z-[9999] flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-secondary-ivory flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary-ivory flex items-center justify-center text-text-dark">
                  <ShoppingCart size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight text-text-dark">Your Cart</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-gold mt-1">
                    {items.length} {items.length === 1 ? 'Item' : 'Items'}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center hover:bg-secondary-ivory rounded-full transition-all text-text-dark"
              >
                <X size={24} />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="px-8 py-6 bg-secondary-ivory/30 border-b border-secondary-ivory shrink-0">
              <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-text-dark">
                {total >= threshold 
                  ? "🎉 You qualify for FREE SHIPPING!" 
                  : `Spend ${formatPrice(threshold - total)} more for FREE SHIPPING`}
              </p>
              <div className="h-1.5 w-full bg-white rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="absolute left-0 top-0 h-full bg-accent-gold"
                />
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
              {(items.length + promoItems.length) > 0 ? (
                [...items, ...promoItems].map((item) => (
                  <div key={item.is_free ? `promo-${item.id}` : item.id} className="flex gap-6 group animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="relative w-32 h-32 bg-secondary-ivory rounded-3xl overflow-hidden flex-shrink-0 shadow-sm">
                      {item.is_free && (
                         <div className="absolute top-2 left-2 z-10 bg-accent-gold text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-lg">GIFT</div>
                      )}
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover p-4 mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-4">
                          <Link href={`/products/${item.handle}`} onClick={onClose}>
                            <h3 className="text-sm font-black text-text-dark leading-tight hover:text-accent-gold transition-colors">
                              {item.name}
                            </h3>
                          </Link>
                          {!item.is_free && (
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="text-text-muted hover:text-red-500 transition-colors flex-shrink-0"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">{item.is_free ? 'Promotional Gift' : 'COSRX Official'}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        {!item.is_free ? (
                          <div className="flex items-center border-2 border-secondary-ivory rounded-xl h-10 bg-white">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-3 hover:bg-secondary-ivory transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-4 text-xs font-black w-10 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-3 hover:bg-secondary-ivory transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-[10px] font-black text-accent-gold uppercase tracking-widest">
                            <Sparkles size={12} /> Auto-Applied
                          </div>
                        )}
                        <span className={`text-base font-black ${item.is_free ? 'text-accent-gold' : 'text-text-dark'}`}>
                          {item.is_free ? 'FREE' : formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-1000">
                  <div className="w-32 h-32 bg-secondary-ivory rounded-full flex items-center justify-center text-text-muted/30">
                    <ShoppingBag size={64} />
                  </div>
                  <div className="space-y-4">
                    <p className="text-2xl font-black tracking-tight">Your cart is empty</p>
                    <p className="text-sm text-text-muted max-w-[200px] mx-auto leading-relaxed">
                      Start your journey to glowing skin by adding our bestsellers.
                    </p>
                  </div>
                  <Button onClick={onClose} size="lg" className="rounded-none px-12">
                    START SHOPPING
                  </Button>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-8 bg-white border-t border-secondary-ivory shadow-[0_-20px_50px_rgba(0,0,0,0.05)] shrink-0">
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-green-600">
                      <span>Coupon Discount</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  {promoSavings > 0 && (
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-accent-gold">
                      <span>Promotional Savings</span>
                      <span>-{formatPrice(promoSavings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end pt-2 border-t border-secondary-ivory">
                    <div className="space-y-1">
                      <p className="text-[10px] text-text-muted uppercase font-black tracking-[0.2em]">Final Total</p>
                      <p className="text-3xl font-black text-text-dark">{formatPrice(getGrandTotal())}</p>
                    </div>
                    {(discountAmount + promoSavings) > 0 && (
                      <div className="bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                        <p className="text-[9px] font-black text-green-700 uppercase">Total Saved {formatPrice(discountAmount + promoSavings)}!</p>
                      </div>
                    )}
                  </div>
                </div>

                <Link href="/checkout" onClick={onClose} className="block">
                  <Button className="w-full h-16 text-sm font-black tracking-[0.2em] group rounded-none bg-text-dark hover:bg-accent-gold border-none text-white transition-all shadow-xl">
                    PROCEED TO CHECKOUT 
                    <ArrowRight size={18} className="ml-3 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
                <button 
                  onClick={onClose}
                  className="w-full mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-text-dark transition-colors"
                >
                  CONTINUE SHOPPING
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
