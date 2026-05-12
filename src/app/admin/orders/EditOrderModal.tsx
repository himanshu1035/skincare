"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, MapPin, Save, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase';

interface EditOrderModalProps {
  order: any;
  onClose: () => void;
  onUpdate: (updatedOrder: any) => void;
}

export const EditOrderModal = ({ order, onClose, onUpdate }: EditOrderModalProps) => {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    skin_first_name: order.skin_first_name || '',
    skin_last_name: order.skin_last_name || '',
    skin_customer_mobile: order.skin_customer_mobile || '',
    skin_customer_address: order.skin_customer_address || '',
    skin_billing_address: order.skin_billing_address || '',
    skin_utr: order.skin_utr || '',
    skin_payment_status: order.skin_payment_status || 'unpaid',
    skin_estimated_delivery: order.skin_estimated_delivery || ''
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await supabase
      .from('skin_orders')
      .update(formData)
      .eq('skin_id', order.skin_id)
      .select()
      .single();

    if (!error && data) {
      onUpdate(data);
      onClose();
    } else {
      alert('Error updating order: ' + error?.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-secondary-ivory"
      >
        <div className="p-8 md:p-12">
          <header className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-text-dark">Modify Order Details</h2>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">ID: #{order.skin_id.slice(0,8)}</p>
            </div>
            <button onClick={onClose} className="p-3 rounded-full hover:bg-secondary-ivory transition-colors">
              <X size={24} />
            </button>
          </header>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">First Name</label>
                <input value={formData.skin_first_name} onChange={e => setFormData({...formData, skin_first_name: e.target.value})} className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Last Name</label>
                <input value={formData.skin_last_name} onChange={e => setFormData({...formData, skin_last_name: e.target.value})} className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input type="tel" value={formData.skin_customer_mobile} onChange={e => setFormData({...formData, skin_customer_mobile: e.target.value})} className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Shipping Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-text-muted" size={16} />
                <textarea value={formData.skin_customer_address} onChange={e => setFormData({...formData, skin_customer_address: e.target.value})} className="w-full h-24 bg-secondary-ivory/50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none resize-none" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Payment Status</label>
                <select value={formData.skin_payment_status} onChange={e => setFormData({...formData, skin_payment_status: e.target.value})} className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none cursor-pointer appearance-none">
                   <option value="unpaid">UNPAID</option>
                   <option value="verified">VERIFIED</option>
                   <option value="failed">FAILED</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">UTR Number</label>
                <input value={formData.skin_utr} onChange={e => setFormData({...formData, skin_utr: e.target.value})} className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none" placeholder="12-digit UTR" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Estimated Delivery Date</label>
              <div className="relative">
                <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input 
                  value={formData.skin_estimated_delivery} 
                  onChange={e => setFormData({...formData, skin_estimated_delivery: e.target.value})} 
                  className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none" 
                  placeholder="e.g., Arriving by Oct 12" 
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full h-16 rounded-full font-black tracking-widest text-xs shadow-xl mt-4" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} className="mr-2" /> UPDATE ORDER DETAILS</>}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
