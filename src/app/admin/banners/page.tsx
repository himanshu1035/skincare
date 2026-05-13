"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Image as ImageIcon, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  ToggleLeft, 
  ToggleRight,
  Loader2,
  ExternalLink,
  Smartphone,
  Monitor,
  Clock,
  Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CreateBannerModal from './CreateBannerModal';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('skin_banners')
      .select('*')
      .order('skin_priority', { ascending: false });
    
    if (data) setBanners(data);
    setLoading(false);
  };

  const toggleBannerStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('skin_banners')
      .update({ skin_is_active: !currentStatus })
      .eq('skin_id', id);
    
    if (!error) {
      setBanners(banners.map(b => b.skin_id === id ? { ...b, skin_is_active: !currentStatus } : b));
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    
    const { error } = await supabase
      .from('skin_banners')
      .delete()
      .eq('skin_id', id);
    
    if (!error) {
      setBanners(banners.filter(b => b.skin_id !== id));
    }
  };

  const filteredBanners = banners.filter(b => 
    b.skin_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-dark tracking-tighter uppercase">Banner Engine</h1>
          <p className="text-text-muted text-xs mt-2 font-medium italic">Manage dynamic homepage heroes, promo sliders, and mobile banners.</p>
        </div>
        <button 
          onClick={() => { setSelectedBanner(null); setIsModalOpen(true); }}
          className="px-8 py-4 bg-text-dark text-white rounded-full font-black text-xs tracking-widest uppercase hover:bg-accent-gold transition-all shadow-xl flex items-center gap-2"
        >
          <Plus size={18} /> Create New Banner
        </button>
      </header>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-[2.5rem] border border-secondary-ivory shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search banners by title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-secondary-ivory/50 border-none rounded-xl pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-accent-gold outline-none"
          />
        </div>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? (
          <div className="col-span-2 py-20 text-center"><Loader2 className="animate-spin inline-block text-accent-gold" /></div>
        ) : filteredBanners.length > 0 ? (
          filteredBanners.map((banner) => (
            <motion.div 
              layout
              key={banner.skin_id} 
              className="bg-white border border-secondary-ivory rounded-[3rem] overflow-hidden shadow-sm group hover:shadow-xl transition-all duration-500"
            >
              <div className="aspect-[21/9] relative bg-secondary-ivory overflow-hidden">
                <img 
                  src={banner.skin_image_desktop} 
                  alt={banner.skin_title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg ${banner.skin_is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {banner.skin_is_active ? 'Active' : 'Paused'}
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[9px] font-black text-text-dark uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                    <Layout size={12} /> Priority {banner.skin_priority}
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[10px] font-black text-accent-gold uppercase tracking-[0.2em] mb-2">Campaign Banner</p>
                    <h3 className="text-xl font-black text-text-dark tracking-tight uppercase leading-tight">{banner.skin_title}</h3>
                    <p className="text-xs text-text-muted mt-2 font-medium italic">{banner.skin_subtitle || 'No subtitle provided.'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setSelectedBanner(banner); setIsModalOpen(true); }}
                      className="p-3 bg-secondary-ivory rounded-2xl text-text-dark hover:bg-accent-gold hover:text-white transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => deleteBanner(banner.skin_id)}
                      className="p-3 bg-secondary-ivory rounded-2xl text-text-dark hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-secondary-ivory">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[9px] font-black text-text-muted uppercase tracking-widest">
                      <Monitor size={12} /> Desktop View
                    </div>
                    <div className="truncate text-[10px] font-bold text-blue-600 underline cursor-pointer">{banner.skin_image_desktop}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[9px] font-black text-text-muted uppercase tracking-widest">
                      <Smartphone size={12} /> Mobile View
                    </div>
                    <div className="truncate text-[10px] font-bold text-blue-600 underline cursor-pointer">{banner.skin_image_mobile || 'Same as desktop'}</div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <button 
                       onClick={() => toggleBannerStatus(banner.skin_id, banner.skin_is_active)}
                       className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                         banner.skin_is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                       }`}
                     >
                       {banner.skin_is_active ? <><ToggleRight size={16} /> Disable</> : <><ToggleLeft size={16} /> Enable</>}
                     </button>
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest">
                     <ExternalLink size={14} /> Links to {banner.skin_link_type}
                   </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-2 py-20 text-center bg-white border border-dashed border-secondary-ivory rounded-[3rem]">
            <ImageIcon className="mx-auto text-text-muted/20 mb-4" size={64} />
            <p className="text-text-muted font-bold italic">No banners found. Start by creating a hero banner.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CreateBannerModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          banner={selectedBanner}
          onSave={fetchBanners}
        />
      )}
    </div>
  );
}
