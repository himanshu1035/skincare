"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  X, 
  Upload, 
  Tag, 
  DollarSign, 
  Star, 
  MessageSquare, 
  Hash,
  ArrowLeft,
  Check,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase';
import { AdminImageUpload } from './AdminImageUpload';
import { cn } from '@/lib/utils';

interface AdminProductFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export const AdminProductForm: React.FC<AdminProductFormProps> = ({ initialData, isEdit }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [allCollections, setAllCollections] = useState<any[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    skin_name: initialData?.skin_name || '',
    skin_slug: initialData?.skin_slug || '',
    skin_brand: initialData?.skin_brand || 'COSRX',
    skin_price: initialData?.skin_price ?? 0,
    skin_original_price: initialData?.skin_original_price ?? 0,
    skin_description: initialData?.skin_description || '',
    skin_image_url: initialData?.skin_image_url || '',
    skin_stock_count: initialData?.skin_stock_count ?? 100,
    skin_rating: initialData?.skin_rating ?? 5.0,
    skin_review_count: initialData?.skin_review_count ?? 0,
  });

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch all available collections
      const { data: cols } = await supabase.from('skin_collections').select('*').order('skin_name');
      if (cols) setAllCollections(cols);

      // 2. If editing, fetch current product collections
      if (isEdit && initialData?.skin_id) {
        const { data: currentCols } = await supabase
          .from('skin_collection_products')
          .select('skin_collection_id')
          .eq('skin_product_id', initialData.skin_id);
        
        if (currentCols) {
          setSelectedCollections(currentCols.map(c => c.skin_collection_id));
        }
      }
    };
    fetchData();
  }, [isEdit, initialData?.skin_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number = value;
    if (type === 'number') {
      processedValue = value === '' ? 0 : parseFloat(value);
      if (isNaN(processedValue)) processedValue = 0;
    }
    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const toggleCollection = (colId: string) => {
    setSelectedCollections(prev => 
      prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const productId = isEdit ? initialData.skin_id : crypto.randomUUID();
      
      // 1. Update/Insert Product
      if (isEdit) {
        const { error } = await supabase
          .from('skin_products')
          .update(formData)
          .eq('skin_id', productId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('skin_products')
          .insert([{ ...formData, skin_id: productId }]);
        if (error) throw error;
      }

      // 2. Sync Collections (Delete existing and insert new)
      const { error: delError } = await supabase
        .from('skin_collection_products')
        .delete()
        .eq('skin_product_id', productId);
      if (delError) throw delError;

      if (selectedCollections.length > 0) {
        const { error: insError } = await supabase
          .from('skin_collection_products')
          .insert(selectedCollections.map(colId => ({
            skin_product_id: productId,
            skin_collection_id: colId
          })));
        if (insError) throw insError;
      }

      alert('Product saved successfully!');
      router.push('/admin/products');
      router.refresh();
    } catch (error: any) {
      alert('Error saving product: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12 pb-24">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="w-12 h-12 rounded-full bg-white border border-secondary-ivory flex items-center justify-center text-text-muted hover:text-text-dark hover:shadow-md transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-text-dark">
              {isEdit ? 'Edit Product' : 'New Product'}
            </h1>
            <p className="text-text-muted mt-2 font-medium">
              {isEdit ? `Editing product: ${formData.skin_name}` : 'Add a new premium product to your catalog.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => router.back()}
            className="h-14 px-8 rounded-full font-black tracking-widest text-[10px] uppercase"
          >
            <X size={16} className="mr-2" /> DISCARD
          </Button>
          <Button 
            type="submit" 
            className="h-14 px-10 rounded-full font-black tracking-widest text-[10px] uppercase bg-text-dark hover:bg-accent-gold transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? 'SAVING...' : (
              <span className="flex items-center gap-2">
                <Save size={16} /> {isEdit ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}
              </span>
            )}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-secondary-ivory space-y-8">
            <h2 className="text-xl font-black tracking-tighter text-text-dark flex items-center gap-3">
              <Tag size={20} className="text-accent-gold" /> General Information
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Product Name</label>
                <input name="skin_name" value={formData.skin_name} onChange={handleChange} type="text" className="w-full bg-secondary-ivory/50 border-none rounded-2xl px-6 py-5 text-sm focus:ring-2 focus:ring-accent-gold outline-none font-medium" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Slug (URL Handle)</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                    <input name="skin_slug" value={formData.skin_slug} onChange={handleChange} type="text" className="w-full bg-secondary-ivory/50 border-none rounded-2xl pl-10 pr-6 py-5 text-sm focus:ring-2 focus:ring-accent-gold outline-none font-medium" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Brand</label>
                  <input name="skin_brand" value={formData.skin_brand} onChange={handleChange} type="text" className="w-full bg-secondary-ivory/50 border-none rounded-2xl px-6 py-5 text-sm focus:ring-2 focus:ring-accent-gold outline-none font-medium" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Description</label>
                <textarea name="skin_description" value={formData.skin_description} onChange={handleChange} rows={6} className="w-full bg-secondary-ivory/50 border-none rounded-3xl px-6 py-5 text-sm focus:ring-2 focus:ring-accent-gold outline-none font-medium resize-none" required />
              </div>
            </div>
          </section>

          <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-secondary-ivory space-y-8">
            <h2 className="text-xl font-black tracking-tighter text-text-dark flex items-center gap-3">
              <DollarSign size={20} className="text-accent-gold" /> Pricing & Inventory
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold">₹</span>
                  <input name="skin_price" value={formData.skin_price} onChange={handleChange} type="number" step="0.01" className="w-full bg-secondary-ivory/50 border-none rounded-2xl pl-10 pr-6 py-5 text-sm focus:ring-2 focus:ring-accent-gold outline-none font-black" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Original Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold">₹</span>
                  <input name="skin_original_price" value={formData.skin_original_price} onChange={handleChange} type="number" step="0.01" className="w-full bg-secondary-ivory/50 border-none rounded-2xl pl-10 pr-6 py-5 text-sm focus:ring-2 focus:ring-accent-gold outline-none font-black opacity-60" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Stock Count</label>
                <input name="skin_stock_count" value={formData.skin_stock_count} onChange={handleChange} type="number" className="w-full bg-secondary-ivory/50 border-none rounded-2xl px-6 py-5 text-sm focus:ring-2 focus:ring-accent-gold outline-none font-black" required />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-secondary-ivory space-y-8">
            <h2 className="text-xl font-black tracking-tighter text-text-dark flex items-center gap-3">
              <Upload size={20} className="text-accent-gold" /> Media
            </h2>
            <AdminImageUpload 
              value={formData.skin_image_url}
              onChange={(url) => setFormData(prev => ({ ...prev, skin_image_url: url }))}
              label="Product Image"
              dimensions="1000x1000px recommended"
            />
          </section>

          <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-secondary-ivory space-y-8">
             <h2 className="text-xl font-black tracking-tighter text-text-dark flex items-center gap-3">
              <Tag size={20} className="text-accent-gold" /> Collections
            </h2>
            
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1 mb-4 italic">Assign product to multiple collections:</p>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {allCollections.map((col) => {
                  const isSelected = selectedCollections.includes(col.skin_id);
                  return (
                    <div 
                      key={col.skin_id}
                      onClick={() => toggleCollection(col.skin_id)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2",
                        isSelected ? "bg-accent-gold/10 border-accent-gold" : "bg-secondary-ivory/50 border-transparent hover:border-secondary-ivory"
                      )}
                    >
                      <span className={cn("text-xs font-black uppercase tracking-widest", isSelected ? "text-accent-gold" : "text-text-muted")}>
                        {col.skin_name}
                      </span>
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-accent-gold flex items-center justify-center text-white"><Check size={14} /></div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-secondary-ivory" />
                      )}
                    </div>
                  );
                })}
              </div>
              {allCollections.length === 0 && <p className="text-xs italic text-text-muted">No collections found. Create them in the Collections menu.</p>}
            </div>
          </section>
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </form>
  );
};
