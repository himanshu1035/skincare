"use client";

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Tag, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowRight,
  PackageCheck,
  Zap,
  Sparkles,
  Globe,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CollectionModal } from './CollectionModal';
import { useRouter } from 'next/navigation';

interface CollectionClientProps {
  collections: any[];
}

export const CollectionClient = ({ collections: initialCollections }: CollectionClientProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleEdit = (col: any) => {
    setSelectedCollection(col);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCollection(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this collection? Products will NOT be deleted, but the grouping will be removed.')) return;
    const { error } = await supabase.from('skin_collections').delete().eq('skin_id', id);
    if (!error) {
      router.refresh();
    } else {
      alert('Error deleting: ' + error.message);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-dark tracking-tighter uppercase">Collections</h1>
          <p className="text-text-muted text-xs mt-2 font-medium italic">Group your products into high-conversion themes.</p>
        </div>
        <Button onClick={handleCreate} className="h-14 px-10 bg-text-dark text-white rounded-full text-xs font-black tracking-widest flex items-center gap-3 shadow-xl hover:bg-accent-gold transition-all duration-300">
          <Plus size={18} /> NEW COLLECTION
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {initialCollections?.map((col) => {
          const isFeatured = col.skin_show_on_homepage;
          const isPinned = col.skin_show_in_navbar;
          const isDynamic = col.skin_is_dynamic;
          return (
            <div key={col.skin_id} className={cn(
              "bg-white p-8 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden shadow-sm hover:shadow-2xl group",
              isDynamic ? "border-accent-gold/40 bg-accent-gold/[0.02]" : (isFeatured ? "border-accent-gold/30 bg-accent-gold/5" : "border-secondary-ivory")
            )}>
              {isDynamic && (
                <div className="absolute top-0 right-0 bg-accent-gold text-white text-[8px] font-black px-4 py-2 rounded-bl-2xl uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                   <Zap size={10} className="animate-pulse" /> LIVE OFFER
                </div>
              )}
              {isPinned && !isDynamic && (
                <div className="absolute top-0 right-0 bg-text-dark text-white text-[8px] font-black px-4 py-2 rounded-bl-2xl uppercase tracking-widest flex items-center gap-1.5">
                  <Globe size={10} className="text-accent-gold" /> PINNED
                </div>
              )}
              <div className="flex items-start justify-between mb-6">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-inner",
                  isDynamic ? "bg-text-dark text-accent-gold" : (isFeatured ? "bg-accent-gold text-white" : "bg-secondary-ivory text-text-dark")
                )}>
                  {isDynamic ? <Sparkles size={24} /> : <Tag size={24} />}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(col)} className="w-10 h-10 rounded-full bg-secondary-ivory/50 flex items-center justify-center text-text-muted hover:text-text-dark hover:bg-white hover:shadow-md transition-all"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(col.skin_id)} className="w-10 h-10 rounded-full bg-secondary-ivory/50 flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={16} /></button>
                </div>
              </div>
              
              <h3 className="font-black text-text-dark text-2xl mb-2 tracking-tight uppercase">{col.skin_name}</h3>
              <p className="text-text-muted text-xs font-medium mb-8 line-clamp-2 leading-relaxed">{col.skin_description || 'A curated selection of premium COSRX skincare.'}</p>
              
              <div className="flex items-center justify-between pt-8 border-t border-secondary-ivory">
                <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest">
                  {isDynamic ? <Zap size={14} className="text-accent-gold" /> : <PackageCheck size={14} className="text-accent-gold" />}
                  {isDynamic ? 'Auto-Sync Active' : `${col.skin_collection_products?.[0]?.count || 0} Products`}
                </div>
                <Link href={`/admin/collections/${col.skin_id}/assign`}>
                  <button className="text-[10px] font-black text-text-dark hover:text-accent-gold transition-colors flex items-center gap-2 uppercase tracking-widest">
                    Manage Items <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
            </div>
          );
        })}

        <div onClick={handleCreate} className="border-4 border-dashed border-secondary-ivory rounded-[2.5rem] flex flex-col items-center justify-center p-10 hover:border-accent-gold hover:bg-accent-gold/5 transition-all duration-500 cursor-pointer group">
          <div className="w-16 h-16 rounded-full bg-secondary-ivory flex items-center justify-center text-text-muted group-hover:text-accent-gold group-hover:bg-white group-hover:shadow-lg transition-all duration-500 mb-4">
            <Plus size={32} />
          </div>
          <p className="text-[10px] font-black text-text-muted group-hover:text-text-dark transition-colors uppercase tracking-[0.3em]">Add Collection</p>
        </div>
      </div>

      {isModalOpen && (
        <CollectionModal 
          collection={selectedCollection} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};
