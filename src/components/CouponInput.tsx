"use client";

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Ticket, X, Check, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CouponInput = ({ paymentMethod, settings }: { paymentMethod: string, settings: any }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const { getTotal, applyCoupon, appliedCoupons, removeCoupon } = useCartStore();
  const { user } = useAuthStore();
  const supabase = createClient();

  React.useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    const { data } = await supabase
      .from('skin_coupons')
      .select('*')
      .eq('skin_is_active', true)
      .eq('skin_is_suggested', true)
      .limit(5);
    if (data) setSuggestions(data);
  };

  const handleApply = async (targetCode?: string) => {
    const finalCode = targetCode || code;
    if (!finalCode.trim()) return;
    
    // Check if already applied
    if (appliedCoupons.find(c => c.skin_code === finalCode.toUpperCase().trim())) {
      setError('This coupon is already applied.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Search in standard coupons
      let { data: coupon, error: fetchError } = await supabase
        .from('skin_coupons')
        .select('*')
        .eq('skin_code', finalCode.toUpperCase().trim())
        .eq('skin_is_active', true)
        .single();

      let isMarketerCoupon = false;

      // 2. If not found, search in marketer coupons
      if (!coupon) {
        const { data: mCoupon, error: mError } = await supabase
          .from('skin_marketer_coupons')
          .select('*, skin_marketers(*)')
          .eq('skin_code', finalCode.toUpperCase().trim())
          .eq('skin_is_active', true)
          .single();
        
        if (mCoupon) {
          if (mCoupon.skin_expiry_date && new Date(mCoupon.skin_expiry_date) < new Date()) {
            throw new Error('This marketer coupon has expired.');
          }
          
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
            skin_is_stackable: true // Marketer coupons assumed stackable if global rule ON
          };
          isMarketerCoupon = true;
        }
      }

      if (!coupon) {
        throw new Error('Invalid coupon code.');
      }

      // --- STACKING VALIDATION ---
      const hasMarketerCoupon = appliedCoupons.some(c => c.skin_marketer_id);
      const allowMarketerStacking = settings?.marketer_coupon_stacking === 'yes';

      // Rule 1: Only ONE marketer coupon allowed per order, ever.
      if (isMarketerCoupon && hasMarketerCoupon) {
        throw new Error('Only one affiliate coupon can be used per order.');
      }

      // Rule 2: Unstackable coupon restrictions
      // If adding a non-stackable coupon but cart already has coupons
      if (!coupon.skin_is_stackable && appliedCoupons.length > 0) {
        throw new Error('This coupon cannot be stacked with existing coupons.');
      }
      
      // If cart already has a non-stackable coupon
      if (appliedCoupons.some(c => !c.skin_is_stackable)) {
        throw new Error('An exclusive non-stackable coupon is already applied.');
      }

      // Rule 3: Marketer Stacking Rule (Admin Toggle)
      // This toggle decides if a marketer coupon can stack with Store coupons
      if (appliedCoupons.length > 0) {
        if (isMarketerCoupon && !allowMarketerStacking) {
          throw new Error('Affiliate coupons cannot be combined with store coupons.');
        }
        if (!isMarketerCoupon && hasMarketerCoupon && !allowMarketerStacking) {
          throw new Error('Store coupons cannot be combined with your applied affiliate coupon.');
        }
      }

      // 3. Validate Expiry (Standard only)
      if (!isMarketerCoupon && coupon.skin_expiry_date && new Date(coupon.skin_expiry_date) < new Date()) {
        throw new Error('This coupon has expired.');
      }

      // 3. Validate Minimum Order
      const subtotal = getTotal();
      if (subtotal < coupon.skin_min_order_amount) {
        throw new Error(`Minimum order of ₹${coupon.skin_min_order_amount} required.`);
      }

      // 4. Validate Prepaid Only
      if (coupon.skin_is_prepaid_only && paymentMethod !== 'UPI') {
        throw new Error('This coupon is exclusively for UPI/Prepaid payments.');
      }

      // 6. Calculate Discount
      let discount = 0;
      if (coupon.skin_type === 'percentage' || coupon.skin_type === 'percent') {
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
      </div>

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
          type="button"
          onClick={() => handleApply()}
          disabled={loading || !code.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 bg-text-dark text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent-gold transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : 'Apply'}
        </button>
      </div>

      {/* Applied Coupons List */}
      <AnimatePresence>
        {appliedCoupons.length > 0 && (
          <div className="space-y-2 mt-4">
            {appliedCoupons.map((coupon) => (
              <motion.div 
                key={coupon.skin_code}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white">
                    <Check size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">{coupon.skin_code}</p>
                    <p className="text-[9px] font-bold text-green-600 uppercase">Stacked Discount Active</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeCoupon(coupon.skin_code)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

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
      </AnimatePresence>
    </div>
  );
};
