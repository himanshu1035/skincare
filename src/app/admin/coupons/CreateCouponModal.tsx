"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, Ticket, Percent, Banknote, Calendar, ShieldAlert, ShoppingBag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase';

interface CreateCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon?: any;
  onSave: () => void;
}

export const CreateCouponModal = ({ isOpen, onClose, coupon, onSave }: CreateCouponModalProps) => {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    skin_code: coupon?.skin_code || '',
    skin_type: coupon?.skin_type || 'percentage',
    skin_value: coupon?.skin_value || '',
    skin_min_order_amount: coupon?.skin_min_order_amount || '0',
    skin_max_discount_amount: coupon?.skin_max_discount_amount || '',
    skin_usage_limit: coupon?.skin_usage_limit || '',
    skin_user_usage_limit: coupon?.skin_user_usage_limit || '1',
    skin_expiry_date: coupon?.skin_expiry_date ? new Date(coupon.skin_expiry_date).toISOString().split('T')[0] : '',
    skin_is_active: coupon ? coupon.skin_is_active : true,
    skin_is_first_order_only: coupon?.skin_is_first_order_only || false,
    skin_is_stackable: coupon?.skin_is_stackable || false,
    skin_is_prepaid_only: coupon?.skin_is_prepaid_only || false,
    skin_is_suggested: coupon?.skin_is_suggested || false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      ...formData,
      skin_code: formData.skin_code.toUpperCase().trim(),
      skin_value: Number(formData.skin_value),
      skin_min_order_amount: Number(formData.skin_min_order_amount),
      skin_max_discount_amount: formData.skin_max_discount_amount ? Number(formData.skin_max_discount_amount) : null,
      skin_usage_limit: formData.skin_usage_limit ? Number(formData.skin_usage_limit) : null,
      skin_user_usage_limit: Number(formData.skin_user_usage_limit),
      skin_expiry_date: formData.skin_expiry_date ? new Date(formData.skin_expiry_date).toISOString() : null,
    };

    let error;
    if (coupon) {
      const { error: updateError } = await supabase
        .from('skin_coupons')
        .update(payload)
        .eq('skin_id', coupon.skin_id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('skin_coupons')
        .insert(payload);
      error = insertError;
    }

    if (!error) {
      onSave();
      onClose();
    } else {
      alert('Error saving coupon: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-secondary-ivory max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8 md:p-12">
          <header className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-text-dark uppercase">{coupon ? 'Modify Campaign' : 'Launch New Campaign'}</h2>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Configure your discount architecture.</p>
            </div>
            <button onClick={onClose} className="p-3 rounded-full hover:bg-secondary-ivory transition-colors">
              <X size={24} />
            </button>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Core Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-2">Coupon Code</label>
                <div className="relative">
                  <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                  <input 
                    required
                    value={formData.skin_code}
                    onChange={e => setFormData({...formData, skin_code: e.target.value})}
                    placeholder="e.g., WELCOME20"
                    className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl pl-12 pr-4 text-sm font-black focus:ring-2 focus:ring-accent-gold outline-none uppercase"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-2">Discount Type</label>
                <select 
                  value={formData.skin_type}
                  onChange={e => setFormData({...formData, skin_type: e.target.value})}
                  className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl px-6 text-sm font-black focus:ring-2 focus:ring-accent-gold outline-none cursor-pointer appearance-none uppercase"
                >
                  <option value="percentage">PERCENTAGE (%)</option>
                  <option value="fixed">FIXED AMOUNT (₹)</option>
                  <option value="free_shipping">FREE SHIPPING</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-2">Discount Value</label>
                <div className="relative">
                  {formData.skin_type === 'percentage' ? <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} /> : <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />}
                  <input 
                    required
                    type="number"
                    value={formData.skin_value}
                    onChange={e => setFormData({...formData, skin_value: e.target.value})}
                    placeholder="e.g., 20"
                    className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl pl-12 pr-4 text-sm font-black focus:ring-2 focus:ring-accent-gold outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-2">Expiry Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                  <input 
                    type="date"
                    value={formData.skin_expiry_date}
                    onChange={e => setFormData({...formData, skin_expiry_date: e.target.value})}
                    className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl pl-12 pr-4 text-sm font-black focus:ring-2 focus:ring-accent-gold outline-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Threshold Settings */}
            <div className="pt-6 border-t border-secondary-ivory">
              <h3 className="text-xs font-black uppercase tracking-widest text-text-dark mb-6 flex items-center gap-2">
                <ShieldAlert size={16} className="text-accent-gold" /> Usage Restrictions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-2">Min. Order Amount (₹)</label>
                  <input 
                    type="number"
                    value={formData.skin_min_order_amount}
                    onChange={e => setFormData({...formData, skin_min_order_amount: e.target.value})}
                    className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl px-6 text-sm font-black focus:ring-2 focus:ring-accent-gold outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-2">Max. Discount (₹)</label>
                  <input 
                    type="number"
                    value={formData.skin_max_discount_amount}
                    onChange={e => setFormData({...formData, skin_max_discount_amount: e.target.value})}
                    placeholder="Unlimited if empty"
                    className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl px-6 text-sm font-black focus:ring-2 focus:ring-accent-gold outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Limit Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-2">Total Usage Limit</label>
                <input 
                  type="number"
                  value={formData.skin_usage_limit}
                  onChange={e => setFormData({...formData, skin_usage_limit: e.target.value})}
                  placeholder="Unlimited if empty"
                  className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl px-6 text-sm font-black focus:ring-2 focus:ring-accent-gold outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-2">Limit Per User</label>
                <input 
                  type="number"
                  value={formData.skin_user_usage_limit}
                  onChange={e => setFormData({...formData, skin_user_usage_limit: e.target.value})}
                  className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl px-6 text-sm font-black focus:ring-2 focus:ring-accent-gold outline-none"
                />
              </div>
            </div>

            {/* Toggle Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              <label className="flex items-center gap-3 p-4 bg-secondary-ivory/30 rounded-2xl cursor-pointer hover:bg-secondary-ivory/50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={formData.skin_is_first_order_only}
                  onChange={e => setFormData({...formData, skin_is_first_order_only: e.target.checked})}
                  className="w-5 h-5 accent-accent-gold rounded-lg"
                />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-dark">First Order</p>
                  <p className="text-[8px] font-bold text-text-muted uppercase text-xs">New users</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 bg-secondary-ivory/30 rounded-2xl cursor-pointer hover:bg-secondary-ivory/50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={formData.skin_is_stackable}
                  onChange={e => setFormData({...formData, skin_is_stackable: e.target.checked})}
                  className="w-5 h-5 accent-accent-gold rounded-lg"
                />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-dark">Stackable</p>
                  <p className="text-[8px] font-bold text-text-muted uppercase text-xs">Combo deals</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 bg-secondary-ivory/30 rounded-2xl cursor-pointer hover:bg-secondary-ivory/50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={formData.skin_is_prepaid_only}
                  onChange={e => setFormData({...formData, skin_is_prepaid_only: e.target.checked})}
                  className="w-5 h-5 accent-accent-gold rounded-lg"
                />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-dark">Prepaid Only</p>
                  <p className="text-[8px] font-bold text-text-muted uppercase text-xs">UPI Required</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 bg-accent-gold/10 border border-accent-gold/20 rounded-2xl cursor-pointer hover:bg-accent-gold/20 transition-colors">
                <input 
                  type="checkbox" 
                  checked={formData.skin_is_suggested}
                  onChange={e => setFormData({...formData, skin_is_suggested: e.target.checked})}
                  className="w-5 h-5 accent-accent-gold rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-dark flex items-center gap-1.5">
                    <Sparkles size={10} className="text-accent-gold" /> Suggested
                  </p>
                  <p className="text-[8px] font-bold text-accent-gold/70 uppercase text-xs">Checkout Menu</p>
                </div>
              </label>
            </div>

            <Button type="submit" size="lg" className="w-full h-16 rounded-full font-black tracking-widest text-xs shadow-xl mt-6" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} className="mr-2" /> {coupon ? 'UPDATE CAMPAIGN' : 'LAUNCH CAMPAIGN'}</>}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
