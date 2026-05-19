"use client";

import React, { useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { createClient } from '@/lib/supabase';
import { Ticket, X, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CouponPreApplier: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountValue, setDiscountValue] = useState(25); // Default to 25% as fallback
  const [isHomepage, setIsHomepage] = useState(false);

  const { applyCoupon, appliedCoupons } = useCartStore();
  const supabase = createClient();

  useEffect(() => {
    // Determine if on homepage
    setIsHomepage(window.location.pathname === '/');

    const handleCouponFromUrl = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlCoupon = params.get('coupon');

      if (!urlCoupon) return;

      const cleanCoupon = urlCoupon.trim().toUpperCase();
      setCouponCode(cleanCoupon);

      // Check if already applied to prevent double applying
      if (appliedCoupons.some(c => c.skin_code === cleanCoupon)) {
        // Fetch value for display even if already applied
        const storedCoupon = appliedCoupons.find(c => c.skin_code === cleanCoupon);
        if (storedCoupon) {
          setDiscountValue(storedCoupon.skin_value || 25);
        }
        
        // Show banner if not dismissed in this session
        const isDismissed = sessionStorage.getItem(`skin_dismiss_banner_${cleanCoupon}`);
        if (!isDismissed) {
          setShowBanner(true);
        }
        return;
      }

      try {
        // 1. Search in standard coupons
        let { data: coupon } = await supabase
          .from('skin_coupons')
          .select('*')
          .eq('skin_code', cleanCoupon)
          .eq('skin_is_active', true)
          .single();

        let isMarketerCoupon = false;

        // 2. If not found, search in marketer coupons
        if (!coupon) {
          const { data: mCoupon } = await supabase
            .from('skin_marketer_coupons')
            .select('*, skin_marketers(*)')
            .eq('skin_code', cleanCoupon)
            .eq('skin_is_active', true)
            .single();

          if (mCoupon) {
            coupon = {
              skin_id: mCoupon.skin_id,
              skin_code: mCoupon.skin_code,
              skin_type: 'percentage',
              skin_value: mCoupon.skin_discount_percent,
              skin_min_order_amount: mCoupon.skin_min_order_amount,
              skin_is_active: mCoupon.skin_is_active,
              skin_is_prepaid_only: false,
              skin_is_first_order_only: false,
              skin_usage_limit: null,
              skin_user_usage_limit: null,
              skin_marketer_id: mCoupon.skin_marketer_id,
              skin_commission_percent: mCoupon.skin_marketers?.skin_commission_percent || 0,
              skin_is_stackable: true
            };
            isMarketerCoupon = true;
          }
        }

        if (coupon) {
          // Store coupon details
          setDiscountValue(coupon.skin_value || 25);

          // Apply coupon to cart store with initial 0 discount (will recalculate on subtotal change)
          applyCoupon(coupon, 0);

          // Show banner if not dismissed
          const isDismissed = sessionStorage.getItem(`skin_dismiss_banner_${cleanCoupon}`);
          if (!isDismissed) {
            setShowBanner(true);
          }
        }
      } catch (err) {
        console.error('Error applying pre-applied coupon:', err);
      }
    };

    handleCouponFromUrl();
  }, [appliedCoupons, applyCoupon, supabase]);

  const handleDismiss = () => {
    if (couponCode) {
      sessionStorage.setItem(`skin_dismiss_banner_${couponCode}`, 'true');
    }
    setShowBanner(false);
  };

  // Only display banner on the Home page
  if (!showBanner || !isHomepage) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-24 left-1/2 -translate-x-1/2 z-[999] w-[92%] max-w-xl"
      >
        <div className="bg-text-dark/95 backdrop-blur-md text-white rounded-[2rem] border border-white/10 shadow-2xl p-6 md:p-8 relative overflow-hidden group">
          {/* Subtle glowing lights */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-gold/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent-gold/10 rounded-full blur-2xl pointer-events-none" />

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/75 hover:bg-red-500 hover:text-white hover:scale-105 transition-all duration-300"
            aria-label="Dismiss Banner"
          >
            <X size={16} />
          </button>

          <div className="flex flex-col md:flex-row items-center gap-6 pr-4">
            {/* Glowing Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-accent-gold flex flex-col items-center justify-center shrink-0 shadow-lg shadow-accent-gold/20 animate-pulse">
              <Ticket size={24} className="text-text-dark" />
              <span className="text-[9px] font-black text-text-dark uppercase mt-0.5 tracking-wider">{discountValue}% OFF</span>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Sparkles size={14} className="text-accent-gold animate-spin-slow" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-gold">Confirmed Offer Availied</span>
              </div>
              <h4 className="text-lg font-black uppercase tracking-tight italic leading-tight">
                Your {discountValue}% discount is confirmed!
              </h4>
              <p className="text-[11px] text-white/70 font-medium leading-relaxed">
                Coupon code <span className="text-accent-gold font-bold">{couponCode}</span> successfully applied. Add items to your cart to claim your exclusive discount!
              </p>
            </div>

            {/* Claim Now Call-to-Action */}
            <button
              onClick={() => {
                // Navigate to Shop All
                window.location.href = '/collections/all';
              }}
              className="w-full md:w-auto px-6 py-4 bg-accent-gold text-text-dark rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-accent-gold/10"
            >
              CLAIM NOW <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
