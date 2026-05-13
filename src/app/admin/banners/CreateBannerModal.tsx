"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  X, 
  Save, 
  ImageIcon, 
  Link as LinkIcon, 
  Calendar, 
  Palette, 
  Layout, 
  Plus, 
  Trash2,
  Monitor,
  Smartphone,
  Info,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminImageUpload } from '@/components/AdminImageUpload';

interface CreateBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner?: any;
  onSave: () => void;
}

export default function CreateBannerModal({ 
  isOpen, 
  onClose, 
  banner, 
  onSave 
}: CreateBannerModalProps) {
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<{
    products: any[],
    collections: any[],
    promotions: any[],
    coupons: any[]
  }>({
    products: [],
    collections: [],
    promotions: [],
    coupons: []
  });
  
  const [formData, setFormData] = useState({
    skin_title: '',
    skin_subtitle: '',
    skin_image_desktop: '',
    skin_image_mobile: '',
    skin_cta_text: 'SHOP NOW',
    skin_link_type: 'collection',
    skin_link_id: '',
    skin_start_date: '',
    skin_end_date: '',
    skin_is_active: true,
    skin_priority: 0,
    skin_bg_color: '#FFFFFF',
    skin_text_color: '#1A1A1A',
  });

  const supabase = createClient();

  useEffect(() => {
    fetchResources();
    if (banner) {
      setFormData({
        skin_title: banner.skin_title || '',
        skin_subtitle: banner.skin_subtitle || '',
        skin_image_desktop: banner.skin_image_desktop || '',
        skin_image_mobile: banner.skin_image_mobile || '',
        skin_cta_text: banner.skin_cta_text || 'SHOP NOW',
        skin_link_type: banner.skin_link_type || 'collection',
        skin_link_id: banner.skin_link_id || '',
        skin_start_date: banner.skin_start_date?.split('T')[0] || '',
        skin_end_date: banner.skin_end_date?.split('T')[0] || '',
        skin_is_active: banner.skin_is_active,
        skin_priority: banner.skin_priority || 0,
        skin_bg_color: banner.skin_bg_color || '#FFFFFF',
        skin_text_color: banner.skin_text_color || '#1A1A1A',
      });
    }
  }, [banner]);

  const fetchResources = async () => {
    const [p, col, promo, coup] = await Promise.all([
      supabase.from('skin_products').select('skin_id, skin_name, skin_slug'),
      supabase.from('skin_collections').select('skin_id, skin_name, skin_slug'),
      supabase.from('skin_promotions').select('skin_id, skin_title'),
      supabase.from('skin_coupons').select('skin_id, skin_code'),
    ]);
    
    setMetadata({
      products: p.data || [],
      collections: col.data || [],
      promotions: promo.data || [],
      coupons: coup.data || []
    });
  };

  const handleSave = async () => {
    setLoading(true);
    const payload = {
      ...formData,
      skin_priority: Number(formData.skin_priority),
      skin_start_date: formData.skin_start_date || null,
      skin_end_date: formData.skin_end_date || null,
    };

    if (banner) {
      const { error } = await supabase.from('skin_banners').update(payload).eq('skin_id', banner.skin_id);
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.from('skin_banners').insert(payload);
      if (error) alert(error.message);
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
                <ImageIcon size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-text-dark tracking-tight uppercase">
                  {banner ? 'Edit Banner' : 'New Banner'}
                </h2>
                <p className="text-[10px] font-black text-accent-gold uppercase tracking-[0.2em] mt-1">Configure Visual Engine</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-secondary-ivory rounded-full transition-all">
              <X size={24} />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
            {/* General Info */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Info size={16} className="text-text-muted" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-text-muted">Creative Details</h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1">Banner Title</label>
                  <input 
                    type="text" 
                    value={formData.skin_title}
                    onChange={e => setFormData({...formData, skin_title: e.target.value})}
                    placeholder="e.g. SUMMER GLOW SALE"
                    className="w-full h-14 bg-secondary-ivory/50 rounded-2xl px-6 text-sm font-bold border-2 border-transparent focus:border-accent-gold outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1">Subtitle / Subtext</label>
                  <input 
                    type="text" 
                    value={formData.skin_subtitle}
                    onChange={e => setFormData({...formData, skin_subtitle: e.target.value})}
                    placeholder="e.g. UP TO 50% OFF ON ALL SERUMS"
                    className="w-full h-14 bg-secondary-ivory/50 rounded-2xl px-6 text-sm font-bold border-2 border-transparent focus:border-accent-gold outline-none transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Assets */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Monitor size={16} className="text-text-muted" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-text-muted">Visual Assets (URLs)</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-secondary-ivory/30 p-8 rounded-[2.5rem]">
                <AdminImageUpload 
                  value={formData.skin_image_desktop}
                  onChange={(url) => setFormData(prev => ({ ...prev, skin_image_desktop: url }))}
                  label="Desktop Banner"
                  dimensions="1920x800px recommended"
                />
                <AdminImageUpload 
                  value={formData.skin_image_mobile}
                  onChange={(url) => setFormData(prev => ({ ...prev, skin_image_mobile: url }))}
                  label="Mobile Banner (Optional)"
                  dimensions="800x800px recommended"
                />
              </div>
            </section>

            {/* Actions & Links */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <LinkIcon size={16} className="text-text-muted" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-text-muted">CTA & Target Link</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1">CTA Button Text</label>
                  <input 
                    type="text" 
                    value={formData.skin_cta_text}
                    onChange={e => setFormData({...formData, skin_cta_text: e.target.value})}
                    className="w-full h-14 bg-secondary-ivory/50 rounded-2xl px-6 text-sm font-bold outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1">Link Type</label>
                  <select 
                    value={formData.skin_link_type}
                    onChange={e => setFormData({...formData, skin_link_type: e.target.value})}
                    className="w-full h-14 bg-secondary-ivory/50 rounded-2xl px-6 text-sm font-bold outline-none"
                  >
                    <option value="collection">COLLECTION</option>
                    <option value="product">PRODUCT</option>
                    <option value="offer">OFFER / PROMO</option>
                    <option value="campaign">CAMPAIGN PAGE</option>
                    <option value="external">EXTERNAL URL</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1">Target Resource</label>
                <select 
                  value={formData.skin_link_id}
                  onChange={e => setFormData({...formData, skin_link_id: e.target.value})}
                  className="w-full h-14 bg-secondary-ivory/50 rounded-2xl px-6 text-sm font-bold outline-none"
                >
                  <option value="">SELECT TARGET...</option>
                  {formData.skin_link_type === 'collection' && metadata.collections.map(c => <option key={c.skin_id} value={c.skin_slug}>{c.skin_name}</option>)}
                  {formData.skin_link_type === 'product' && metadata.products.map(p => <option key={p.skin_id} value={p.skin_slug}>{p.skin_name}</option>)}
                  {formData.skin_link_type === 'offer' && metadata.promotions.map(p => <option key={p.skin_id} value={p.skin_id}>{p.skin_title}</option>)}
                  {formData.skin_link_type === 'campaign' && <option value="summer-glow-2024">Summer Glow Campaign</option>}
                </select>
              </div>
            </section>

            {/* Styling & Priority */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Palette size={16} className="text-text-muted" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-text-muted">Aesthetics & Scheduling</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-text-muted ml-1">BG Color</label>
                    <input type="color" value={formData.skin_bg_color} onChange={e => setFormData({...formData, skin_bg_color: e.target.value})} className="w-full h-12 bg-secondary-ivory rounded-xl cursor-pointer" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-text-muted ml-1">Text Color</label>
                    <input type="color" value={formData.skin_text_color} onChange={e => setFormData({...formData, skin_text_color: e.target.value})} className="w-full h-12 bg-secondary-ivory rounded-xl cursor-pointer" />
                 </div>
                 <div className="col-span-2 space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-text-muted ml-1">Display Priority</label>
                    <input type="number" value={formData.skin_priority} onChange={e => setFormData({...formData, skin_priority: parseInt(e.target.value)})} className="w-full h-12 bg-secondary-ivory rounded-xl px-4 text-sm font-bold" />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-secondary-ivory">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest ml-1">Start Date</label>
                   <input type="date" value={formData.skin_start_date} onChange={e => setFormData({...formData, skin_start_date: e.target.value})} className="w-full h-14 bg-secondary-ivory/50 rounded-2xl px-6 text-sm font-bold" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest ml-1">End Date</label>
                   <input type="date" value={formData.skin_end_date} onChange={e => setFormData({...formData, skin_end_date: e.target.value})} className="w-full h-14 bg-secondary-ivory/50 rounded-2xl px-6 text-sm font-bold" />
                </div>
              </div>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="p-8 border-t border-secondary-ivory bg-white">
            <button 
              onClick={handleSave}
              disabled={loading || !formData.skin_title || !formData.skin_image_desktop}
              className="w-full h-16 bg-text-dark text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-accent-gold transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> SAVE BANNER ENGINE CONFIG</>}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
