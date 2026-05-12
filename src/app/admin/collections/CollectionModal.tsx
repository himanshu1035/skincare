"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Tag, FileText, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface CollectionModalProps {
  collection?: any;
  onClose: () => void;
}

export const CollectionModal = ({ collection, onClose }: CollectionModalProps) => {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const [formData, setFormData] = useState({
    skin_name: collection?.skin_name || '',
    skin_slug: collection?.skin_slug || '',
    skin_description: collection?.skin_description || '',
    skin_image_url: collection?.skin_image_url || ''
  });

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      skin_name: name,
      skin_slug: collection ? formData.skin_slug : generateSlug(name)
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    let error;
    if (collection) {
      const { error: err } = await supabase
        .from('skin_collections')
        .update(formData)
        .eq('skin_id', collection.skin_id);
      error = err;
    } else {
      const { error: err } = await supabase
        .from('skin_collections')
        .insert([formData]);
      error = err;
    }

    if (!error) {
      router.refresh();
      onClose();
    } else {
      alert('Error saving collection: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-secondary-ivory"
      >
        <div className="p-8 md:p-12">
          <header className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black tracking-tighter text-text-dark">
              {collection ? 'Edit Collection' : 'Create New Collection'}
            </h2>
            <button onClick={onClose} className="p-3 rounded-full hover:bg-secondary-ivory transition-colors">
              <X size={24} />
            </button>
          </header>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Collection Name</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input 
                  value={formData.skin_name} 
                  onChange={e => handleNameChange(e.target.value)} 
                  className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none" 
                  placeholder="e.g., Best Sellers"
                  required 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">URL Slug</label>
              <input 
                value={formData.skin_slug} 
                onChange={e => setFormData({...formData, skin_slug: e.target.value})} 
                className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none" 
                placeholder="best-sellers"
                required 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Description</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 text-text-muted" size={16} />
                <textarea 
                  value={formData.skin_description} 
                  onChange={e => setFormData({...formData, skin_description: e.target.value})} 
                  className="w-full h-24 bg-secondary-ivory/50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none resize-none" 
                  placeholder="Describe this collection..."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Banner Image URL</label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input 
                  value={formData.skin_image_url} 
                  onChange={e => setFormData({...formData, skin_image_url: e.target.value})} 
                  className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none" 
                  placeholder="https://..."
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full h-16 rounded-full font-black tracking-widest text-xs shadow-xl mt-4" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} className="mr-2" /> {collection ? 'UPDATE COLLECTION' : 'CREATE COLLECTION'}</>}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
