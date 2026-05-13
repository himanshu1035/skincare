"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  X, 
  Save, 
  MousePointer2, 
  Globe, 
  Gift, 
  Calendar, 
  ImageIcon, 
  Type,
  Plus,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DynamicCollectionService } from '@/lib/DynamicCollectionService';
import { AdminImageUpload } from '@/components/AdminImageUpload';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign?: any;
  onSave: () => void;
}

export default function CreateCampaignModal({ 
  isOpen, 
  onClose, 
  campaign, 
  onSave 
}: CreateCampaignModalProps) {
  const [loading, setLoading] = useState(false);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    skin_title: '',
    skin_slug: '',
    skin_description: '',
    skin_banner_image: '',
    skin_offer_id: '',
    skin_coupon_id: '',
    skin_start_date: '',
    skin_end_date: '',
    skin_is_active: true,
  });

  const supabase = createClient();

  useEffect(() => {
    fetchMetadata();
    if (campaign) {
      setFormData({
        skin_title: campaign.skin_title || '',
        skin_slug: campaign.skin_slug || '',
        skin_description: campaign.skin_description || '',
        skin_banner_image: campaign.skin_banner_image || '',
        skin_offer_id: campaign.skin_offer_id || '',
        skin_coupon_id: campaign.skin_coupon_id || '',
        skin_start_date: campaign.skin_start_date?.split('T')[0] || '',
        skin_end_date: campaign.skin_end_date?.split('T')[0] || '',
        skin_is_active: campaign.skin_is_active,
      });
    }
  }, [campaign]);

  const fetchMetadata = async () => {
    const [p, c] = await Promise.all([
      supabase.from('skin_promotions').select('skin_id, skin_title'),
      supabase.from('skin_coupons').select('skin_id, skin_code'),
    ]);
    setPromotions(p.data || []);
    setCoupons(c.data || []);
  };

  const handleSave = async () => {
    setLoading(true);
    const payload = {
      ...formData,
      skin_offer_id: formData.skin_offer_id || null,
      skin_coupon_id: formData.skin_coupon_id || null,
      skin_start_date: formData.skin_start_date || null,
      skin_end_date: formData.skin_end_date || null,
    };

    if (campaign) {
      const { error } = await supabase.from('skin_campaigns').update(payload).eq('skin_id', campaign.skin_id);
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.from('skin_campaigns').insert(payload);
      if (error) alert(error.message);
    }

    if (formData.skin_offer_id) {
       try {
         await DynamicCollectionService.syncFromPromotion(formData.skin_offer_id);
       } catch (e) {
         console.error('Error syncing dynamic collection from campaign:', e);
       }
    }

    setLoading(false);
    onSave();
    onClose();
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
                <MousePointer2 size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-text-dark tracking-tight uppercase">
                  {campaign ? 'Edit Campaign' : 'New Campaign'}
                </h2>
                <p className="text-[10px] font-black text-accent-gold uppercase tracking-[0.2em] mt-1">Design Event Landing Page</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-secondary-ivory rounded-full transition-all">
              <X size={24} />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
            {/* Identity */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe size={16} className="text-text-muted" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-text-muted">Campaign Identity</h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1">Campaign Name</label>
                  <input 
                    type="text" 
                    value={formData.skin_title}
                    onChange={e => setFormData({...formData, skin_title: e.target.value, skin_slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                    placeholder="e.g. SUMMER GLOW FESTIVAL"
                    className="w-full h-14 bg-secondary-ivory/50 rounded-2xl px-6 text-sm font-bold border-2 border-transparent focus:border-accent-gold outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1">Campaign Slug (URL Path)</label>
                  <div className="flex items-center gap-2 h-14 bg-secondary-ivory/30 rounded-2xl px-6 border border-secondary-ivory">
                     <span className="text-[10px] font-black text-text-muted">/campaign/</span>
                     <input 
                       type="text" 
                       value={formData.skin_slug}
                       onChange={e => setFormData({...formData, skin_slug: e.target.value})}
                       className="flex-1 bg-transparent text-sm font-bold outline-none"
                     />
                  </div>
                </div>
              </div>
            </section>

            {/* Visuals */}
            <section className="space-y-6">
               <div className="flex items-center gap-2 mb-4">
                 <ImageIcon size={16} className="text-text-muted" />
                 <h3 className="text-[11px] font-black uppercase tracking-widest text-text-muted">Visual Presentation</h3>
               </div>
               <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <AdminImageUpload 
                      value={formData.skin_banner_image}
                      onChange={(url) => setFormData(prev => ({ ...prev, skin_banner_image: url }))}
                      label="Header Banner Image"
                      dimensions="1200x600px recommended"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1">Landing Page Description</label>
                    <textarea 
                      value={formData.skin_description}
                      onChange={e => setFormData({...formData, skin_description: e.target.value})}
                      placeholder="Enter the persuasive subtext for the landing page hero..."
                      className="w-full h-32 bg-secondary-ivory/50 rounded-2xl p-6 text-sm font-bold border-2 border-transparent focus:border-accent-gold outline-none transition-all resize-none"
                    />
                  </div>
               </div>
            </section>

            {/* Linking */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Gift size={16} className="text-text-muted" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-text-muted">Linked Benefits</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1">Connect Promotion</label>
                    <select 
                      value={formData.skin_offer_id}
                      onChange={e => setFormData({...formData, skin_offer_id: e.target.value})}
                      className="w-full h-14 bg-secondary-ivory/50 rounded-2xl px-6 text-sm font-bold outline-none cursor-pointer"
                    >
                      <option value="">NONE (NO OFFER)</option>
                      {promotions.map(p => <option key={p.skin_id} value={p.skin_id}>{p.skin_title}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1">Connect Coupon</label>
                    <select 
                      value={formData.skin_coupon_id}
                      onChange={e => setFormData({...formData, skin_coupon_id: e.target.value})}
                      className="w-full h-14 bg-secondary-ivory/50 rounded-2xl px-6 text-sm font-bold outline-none cursor-pointer"
                    >
                      <option value="">NONE (NO COUPON)</option>
                      {coupons.map(c => <option key={c.skin_id} value={c.skin_id}>{c.skin_code}</option>)}
                    </select>
                 </div>
              </div>
            </section>

            {/* Lifecycle */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={16} className="text-text-muted" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-text-muted">Lifecycle & Scheduling</h3>
              </div>
              <div className="grid grid-cols-2 gap-6 bg-secondary-ivory/30 p-8 rounded-[2.5rem]">
                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase tracking-widest text-text-muted ml-1">Campaign Start</label>
                   <input type="date" value={formData.skin_start_date} onChange={e => setFormData({...formData, skin_start_date: e.target.value})} className="w-full h-12 bg-white rounded-xl px-4 text-sm font-bold shadow-sm" />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase tracking-widest text-text-muted ml-1">Campaign End (Urgency Timer)</label>
                   <input type="date" value={formData.skin_end_date} onChange={e => setFormData({...formData, skin_end_date: e.target.value})} className="w-full h-12 bg-white rounded-xl px-4 text-sm font-bold shadow-sm" />
                </div>
              </div>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="p-8 border-t border-secondary-ivory bg-white">
            <button 
              onClick={handleSave}
              disabled={loading || !formData.skin_title || !formData.skin_slug}
              className="w-full h-16 bg-text-dark text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-accent-gold transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> DEPLOY CAMPAIGN ENGINE</>}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


