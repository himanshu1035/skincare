"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  X, 
  Save, 
  Zap, 
  Calendar, 
  Gift, 
  Target, 
  ShieldAlert, 
  Plus, 
  Trash2,
  Package,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreatePromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotion?: any;
  onSave: () => void;
}

export const CreatePromotionModal: React.FC<CreatePromotionModalProps> = ({ 
  isOpen, 
  onClose, 
  promotion, 
  onSave 
}) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    skin_title: '',
    skin_description: '',
    skin_type: 'free_gift',
    skin_priority: 0,
    skin_is_active: true,
    skin_start_date: '',
    skin_end_date: '',
    skin_min_cart_value: 0,
    skin_min_quantity: 0,
    skin_buy_quantity: 1,
    skin_get_quantity: 1,
    skin_discount_percent: '',
    skin_discount_amount: '',
    skin_free_product_id: '',
  });

  const [targets, setTargets] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchMetadata();
    if (promotion) {
      setFormData({
        skin_title: promotion.skin_title || '',
        skin_description: promotion.skin_description || '',
        skin_type: promotion.skin_type || 'free_gift',
        skin_priority: promotion.skin_priority || 0,
        skin_is_active: promotion.skin_is_active,
        skin_start_date: promotion.skin_start_date?.split('T')[0] || '',
        skin_end_date: promotion.skin_end_date?.split('T')[0] || '',
        skin_min_cart_value: promotion.skin_min_cart_value || 0,
        skin_min_quantity: promotion.skin_min_quantity || 0,
        skin_buy_quantity: promotion.skin_buy_quantity || 1,
        skin_get_quantity: promotion.skin_get_quantity || 1,
        skin_discount_percent: promotion.skin_discount_percent || '',
        skin_discount_amount: promotion.skin_discount_amount || '',
        skin_free_product_id: promotion.skin_free_product_id || '',
      });
      fetchTargets(promotion.skin_id);
    }
  }, [promotion]);

  const fetchMetadata = async () => {
    const { data: p } = await supabase.from('skin_products').select('skin_id, skin_name');
    const { data: c } = await supabase.from('skin_categories').select('skin_id, skin_name');
    if (p) setProducts(p);
    if (c) setCategories(c);
  };

  const fetchTargets = async (id: string) => {
    const { data } = await supabase
      .from('skin_promotion_targets')
      .select('*')
      .eq('skin_promotion_id', id);
    if (data) setTargets(data);
  };

  const handleSave = async () => {
    setLoading(true);
    const payload = {
      ...formData,
      skin_min_cart_value: Number(formData.skin_min_cart_value),
      skin_min_quantity: Number(formData.skin_min_quantity),
      skin_buy_quantity: Number(formData.skin_buy_quantity),
      skin_get_quantity: Number(formData.skin_get_quantity),
      skin_discount_percent: formData.skin_discount_percent ? Number(formData.skin_discount_percent) : null,
      skin_discount_amount: formData.skin_discount_amount ? Number(formData.skin_discount_amount) : null,
      skin_free_product_id: formData.skin_free_product_id || null,
      skin_start_date: formData.skin_start_date || null,
      skin_end_date: formData.skin_end_date || null,
    };

    let promoId = promotion?.skin_id;

    if (promotion) {
      const { error } = await supabase.from('skin_promotions').update(payload).eq('skin_id', promotion.skin_id);
      if (error) alert(error.message);
    } else {
      const { data, error } = await supabase.from('skin_promotions').insert(payload).select().single();
      if (error) alert(error.message);
      else promoId = data.skin_id;
    }

    // Save Targets
    if (promoId) {
      await supabase.from('skin_promotion_targets').delete().eq('skin_promotion_id', promoId);
      if (targets.length > 0) {
        await supabase.from('skin_promotion_targets').insert(
          targets.map(t => ({
            skin_promotion_id: promoId,
            skin_target_type: t.skin_target_type,
            skin_target_id: t.skin_target_id,
            skin_is_exclusion: t.skin_is_exclusion
          }))
        );
      }
    }

    setLoading(false);
    onSave();
    onClose();
  };

  const addTarget = (type: 'product' | 'category', id: string, isExclusion = false) => {
    if (targets.some(t => t.skin_target_id === id && t.skin_is_exclusion === isExclusion)) return;
    setTargets([...targets, { skin_target_type: type, skin_target_id: id, skin_is_exclusion: isExclusion }]);
  };

  const removeTarget = (id: string) => {
    setTargets(targets.filter(t => t.skin_target_id !== id));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 md:p-6 bg-text-dark/40 backdrop-blur-sm">
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="w-full max-w-2xl h-full bg-white rounded-[3rem] shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 border-b border-secondary-ivory flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-text-dark flex items-center justify-center text-white">
                <Zap size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-text-dark tracking-tight uppercase">
                  {promotion ? 'Edit Promotion' : 'New Promotion'}
                </h2>
                <p className="text-[10px] font-black text-accent-gold uppercase tracking-[0.2em] mt-1">Configure Offer Logic</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-secondary-ivory rounded-full transition-all">
              <X size={24} />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
            {/* Basic Info */}
            <section className="space-y-6">
               <div className="flex items-center gap-2 mb-4">
                 <Info size={16} className="text-text-muted" />
                 <h3 className="text-[11px] font-black uppercase tracking-widest text-text-muted">General Information</h3>
               </div>
               <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1">Offer Title</label>
                    <input 
                      type="text" 
                      value={formData.skin_title}
                      onChange={e => setFormData({...formData, skin_title: e.target.value})}
                      placeholder="e.g. BUY 1 GET 1 ON MOISTURIZERS"
                      className="w-full h-14 bg-secondary-ivory/50 rounded-2xl px-6 text-sm font-bold border-2 border-transparent focus:border-accent-gold outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1">Description (Internal)</label>
                    <textarea 
                      value={formData.skin_description}
                      onChange={e => setFormData({...formData, skin_description: e.target.value})}
                      placeholder="Describe the promotion goals..."
                      className="w-full h-32 bg-secondary-ivory/50 rounded-2xl p-6 text-sm font-bold border-2 border-transparent focus:border-accent-gold outline-none transition-all resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest ml-1">Priority (Higher = Sooner)</label>
                      <input 
                        type="number" 
                        value={formData.skin_priority}
                        onChange={e => setFormData({...formData, skin_priority: parseInt(e.target.value)})}
                        className="w-full h-14 bg-secondary-ivory/50 rounded-2xl px-6 text-sm font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest ml-1">Offer Type</label>
                      <select 
                        value={formData.skin_type}
                        onChange={e => setFormData({...formData, skin_type: e.target.value as any})}
                        className="w-full h-14 bg-secondary-ivory/50 rounded-2xl px-6 text-sm font-bold outline-none cursor-pointer"
                      >
                        <option value="free_gift">FREE GIFT</option>
                        <option value="bogo">BOGO (BUY X GET Y)</option>
                        <option value="cart_value">CART VALUE THRESHOLD</option>
                        <option value="quantity">QUANTITY DISCOUNTS</option>
                      </select>
                    </div>
                  </div>
               </div>
            </section>

            {/* Logic Configuration */}
            <section className="space-y-6">
               <div className="flex items-center gap-2 mb-4">
                 <ShieldAlert size={16} className="text-text-muted" />
                 <h3 className="text-[11px] font-black uppercase tracking-widest text-text-muted">Offer Logic & Rules</h3>
               </div>
               
               <div className="bg-secondary-ivory/30 p-8 rounded-[2.5rem] space-y-8">
                  {formData.skin_type === 'bogo' && (
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-text-muted">Buy Quantity</label>
                         <input type="number" value={formData.skin_buy_quantity} onChange={e => setFormData({...formData, skin_buy_quantity: parseInt(e.target.value)})} className="w-full h-12 bg-white rounded-xl px-4 text-sm font-bold shadow-sm" />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-text-muted">Get Quantity (Free)</label>
                         <input type="number" value={formData.skin_get_quantity} onChange={e => setFormData({...formData, skin_get_quantity: parseInt(e.target.value)})} className="w-full h-12 bg-white rounded-xl px-4 text-sm font-bold shadow-sm" />
                       </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-text-muted">Min Cart Value (₹)</label>
                       <input type="number" value={formData.skin_min_cart_value} onChange={e => setFormData({...formData, skin_min_cart_value: parseInt(e.target.value)})} className="w-full h-12 bg-white rounded-xl px-4 text-sm font-bold shadow-sm" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-text-muted">Free Product ID (Optional)</label>
                       <select 
                         value={formData.skin_free_product_id} 
                         onChange={e => setFormData({...formData, skin_free_product_id: e.target.value})}
                         className="w-full h-12 bg-white rounded-xl px-4 text-sm font-bold shadow-sm outline-none"
                       >
                         <option value="">SELECT FREE ITEM</option>
                         {products.map(p => <option key={p.skin_id} value={p.skin_id}>{p.skin_name}</option>)}
                       </select>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-secondary-ivory/50">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-text-muted">Start Date</label>
                       <input type="date" value={formData.skin_start_date} onChange={e => setFormData({...formData, skin_start_date: e.target.value})} className="w-full h-12 bg-white rounded-xl px-4 text-sm font-bold shadow-sm" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-text-muted">End Date</label>
                       <input type="date" value={formData.skin_end_date} onChange={e => setFormData({...formData, skin_end_date: e.target.value})} className="w-full h-12 bg-white rounded-xl px-4 text-sm font-bold shadow-sm" />
                    </div>
                  </div>
               </div>
            </section>

            {/* Targeting */}
            <section className="space-y-6">
               <div className="flex items-center gap-2 mb-4">
                 <Target size={16} className="text-text-muted" />
                 <h3 className="text-[11px] font-black uppercase tracking-widest text-text-muted">Offer Targeting (Whitelist/Blacklist)</h3>
               </div>

               <div className="space-y-4">
                  <div className="flex gap-4">
                     <select 
                       onChange={(e) => {
                         if (!e.target.value) return;
                         addTarget('product', e.target.value);
                         e.target.value = '';
                       }}
                       className="flex-1 h-12 bg-secondary-ivory rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none"
                     >
                       <option value="">+ ADD TARGET PRODUCT</option>
                       {products.map(p => <option key={p.skin_id} value={p.skin_id}>{p.skin_name}</option>)}
                     </select>
                     <select 
                       onChange={(e) => {
                         if (!e.target.value) return;
                         addTarget('category', e.target.value);
                         e.target.value = '';
                       }}
                       className="flex-1 h-12 bg-secondary-ivory rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none"
                     >
                       <option value="">+ ADD TARGET CATEGORY</option>
                       {categories.map(c => <option key={c.skin_id} value={c.skin_id}>{c.skin_name}</option>)}
                     </select>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {targets.map((t, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-text-dark text-white rounded-full text-[9px] font-black uppercase tracking-widest group">
                         {t.skin_target_type === 'product' ? <Package size={10} /> : <Layers size={10} />}
                         {t.skin_target_type === 'product' ? products.find(p => p.skin_id === t.skin_target_id)?.skin_name : categories.find(c => c.skin_id === t.skin_target_id)?.skin_name}
                         <button onClick={() => removeTarget(t.skin_target_id)} className="ml-1 hover:text-red-400">
                           <X size={10} />
                         </button>
                      </div>
                    ))}
                    {targets.length === 0 && <p className="text-[10px] text-text-muted italic px-2">Storewide Offer (All items included)</p>}
                  </div>
               </div>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="p-8 border-t border-secondary-ivory bg-white">
            <button 
              onClick={handleSave}
              disabled={loading || !formData.skin_title}
              className="w-full h-16 bg-text-dark text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-accent-gold transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> SAVE PROMOTION ENGINE RULE</>}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
