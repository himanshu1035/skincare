"use client";

import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Search, 
  CheckCircle2, 
  Circle,
  Save,
  Tag,
  Edit3,
  Loader2,
  PackageCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AssignCollectionClientProps {
  collection: any;
  allProducts: any[];
  initialAssignedIds: string[];
}

export const AssignCollectionClient = ({ 
  collection, 
  allProducts, 
  initialAssignedIds 
}: AssignCollectionClientProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialAssignedIds));
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => 
      p.skin_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allProducts, searchTerm]);

  const toggleProduct = (productId: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedIds(newSelection);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Delete all existing assignments for this collection
      const { error: delErr } = await supabase
        .from('skin_collection_products')
        .delete()
        .eq('skin_collection_id', collection.skin_id);

      if (delErr) throw delErr;

      // 2. Insert new assignments
      if (selectedIds.size > 0) {
        const assignments = Array.from(selectedIds).map(productId => ({
          skin_collection_id: collection.skin_id,
          skin_product_id: productId
        }));

        const { error: insErr } = await supabase
          .from('skin_collection_products')
          .insert(assignments);

        if (insErr) throw insErr;
      }

      router.refresh();
      alert('Collection updated successfully!');
    } catch (err: any) {
      alert('Error saving: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link href="/admin/collections">
            <button className="w-12 h-12 rounded-2xl border border-secondary-ivory flex items-center justify-center text-text-muted hover:text-text-dark hover:bg-white hover:shadow-md transition-all">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-gold/10 rounded-xl flex items-center justify-center text-accent-gold">
                 <Tag size={20} />
              </div>
              <h1 className="text-3xl font-black text-text-dark tracking-tighter uppercase">{collection.skin_name}</h1>
            </div>
            <p className="text-text-muted text-xs mt-2 font-medium italic">
              Currently managing <span className="text-text-dark font-black px-2 py-0.5 bg-secondary-ivory rounded-full mx-1">{selectedIds.size}</span> products in this collection.
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="h-14 px-10 bg-text-dark text-white rounded-full text-xs font-black tracking-widest flex items-center gap-3 shadow-xl hover:bg-accent-gold transition-all duration-300"
        >
          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> SAVE CHANGES</>}
        </Button>
      </header>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-[2rem] border border-secondary-ivory shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
          <input 
            type="text" 
            placeholder="Search products by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-secondary-ivory/50 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-accent-gold"
          />
        </div>
      </div>

      {/* Product Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
        {filteredProducts.map((product) => {
          const isSelected = selectedIds.has(product.skin_id);
          return (
            <div 
              key={product.skin_id}
              onClick={() => toggleProduct(product.skin_id)}
              className={`p-6 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer group flex flex-col gap-4 bg-white relative overflow-hidden shadow-sm hover:shadow-xl ${
                isSelected ? 'border-accent-gold bg-accent-gold/[0.02]' : 'border-secondary-ivory'
              }`}
            >
              <div className="relative aspect-square rounded-3xl bg-secondary-ivory/30 overflow-hidden mb-2 group-hover:bg-white transition-colors">
                <img 
                  src={product.skin_image_url} 
                  alt="" 
                  className="w-full h-full object-contain p-6 mix-blend-multiply transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute top-4 right-4">
                  {isSelected ? (
                    <div className="w-8 h-8 bg-accent-gold rounded-full flex items-center justify-center text-white shadow-lg animate-in zoom-in">
                      <CheckCircle2 size={18} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-white/80 border-2 border-secondary-ivory rounded-full flex items-center justify-center text-secondary-ivory group-hover:border-accent-gold/50 group-hover:text-accent-gold/50 transition-all">
                      <Circle size={18} />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 space-y-3">
                <h4 className="text-sm font-black text-text-dark line-clamp-2 leading-relaxed uppercase tracking-tight">
                  {product.skin_name}
                </h4>
                <div className="flex items-center gap-2">
                   <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                     isSelected ? 'bg-accent-gold text-white' : 'bg-secondary-ivory text-text-muted'
                   }`}>
                     {isSelected ? 'Selected' : 'Available'}
                   </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
