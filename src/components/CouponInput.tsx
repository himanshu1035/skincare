"use client";

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Ticket, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CouponInput = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { getTotal, applyCoupon, appliedCoupon, removeCoupon } = useCartStore();
  const { user } = useAuthStore();
  const supabase = createClient();

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Fetch Coupon
      const { data: coupon, error: fetchError } = await supabase
        .from('skin_coupons')
        .select('*')
        .eq('skin_code', code.toUpperCase().trim())
        .eq('skin_is_active', true)
        .single();

      if (fetchError || !coupon) {
        throw new Error('Invalid coupon code.');
      }

      // 2. Validate Expiry
      if (coupon.skin_expiry_date && new Date(coupon.skin_expiry_date) < new Date()) {
        throw new Error('This coupon has expired.');
      }

      // 3. Validate Minimum Order
      const subtotal = getTotal();
      if (subtotal < coupon.skin_min_order_amount) {
        throw new Error(`Minimum order of ₹${coupon.skin_min_order_amount} required.`);
      }

      // 4. Validate Usage Limit
      if (coupon.skin_usage_limit) {
        const { count } = await supabase
          .from('skin_coupon_usage')
          .select('*', { count: 'exact', head: true })
          .eq('skin_coupon_id', coupon.skin_id);
        
        if (count && count >= coupon.skin_usage_limit) {
          throw new Error('This coupon has reached its total usage limit.');
        }
      }

      // 5. Validate Per-User Usage Limit
      if (user && coupon.skin_user_usage_limit) {
        const { count: userCount } = await supabase
          .from('skin_coupon_usage')
          .select('*', { count: 'exact', head: true })
          .eq('skin_coupon_id', coupon.skin_id)
          .eq('skin_user_id', user.id);
        
        if (userCount && userCount >= coupon.skin_user_usage_limit) {
          throw new Error(`You have already used this coupon ${coupon.skin_user_usage_limit} time(s).`);
        }
      }

      // 6. Calculate Discount
      let discount = 0;
      if (coupon.skin_type === 'percentage') {
        discount = (subtotal * coupon.skin_value) / 100;
        if (coupon.skin_max_discount_amount) {
          discount = Math.min(discount, coupon.skin_max_discount_amount);
        }
      } else if (coupon.skin_type === 'fixed') {
        discount = Math.min(coupon.skin_value, subtotal);
      }

      applyCoupon(coupon, discount);
      setSuccess(true);
      setCode('');
      
      // Auto-clear success message after 3s
      setTimeout(() => setSuccess(false), 3000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Promo Code</p>
        <AnimatePresence>
          {appliedCoupon && (
            <motion.button 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={removeCoupon}
              className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1 hover:underline"
            >
              <X size={12} /> Remove
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {!appliedCoupon ? (
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-gold transition-colors">
            <Ticket size={18} />
          </div>
          <input 
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="ENTER COUPON CODE"
            className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl pl-12 pr-32 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-accent-gold outline-none transition-all"
          />
          <button 
            onClick={handleApply}
            disabled={loading || !code.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 bg-text-dark text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent-gold transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : 'Apply'}
          </button>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white">
              <Check size={16} />
            </div>
            <div>
              <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">{appliedCoupon.skin_code}</p>
              <p className="text-[9px] font-bold text-green-600 uppercase">Coupon Applied Successfully</p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-xs font-black text-green-700">SAVED ₹{useCartStore.getState().discountAmount}</p>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-[9px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5 px-2"
          >
            <AlertCircle size={12} /> {error}
          </motion.p>
        )}
        {success && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-[9px] font-bold text-green-600 uppercase tracking-widest flex items-center gap-1.5 px-2"
          >
            <Check size={12} /> Discount applied to your cart!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};
