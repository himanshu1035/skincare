"use client";

import React, { useState } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface AdminProductFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export const AdminProductForm: React.FC<AdminProductFormProps> = ({ initialData, isEdit }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: string | number = value;
    if (type === 'number') {
      processedValue = value === '' ? 0 : parseFloat(value);
      if (isNaN(processedValue)) processedValue = 0;
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const supabase = createClient();
    
    try {
      if (isEdit) {
        const { error } = await supabase
          .from('skin_products')
          .update(formData)
          .eq('skin_id', initialData.skin_id);
        
        if (error) throw error;
        alert('Product updated successfully!');
      } else {
        const { error } = await supabase
          .from('skin_products')
          .insert([{
            ...formData,
            skin_id: crypto.randomUUID()
          }]);
        
        if (error) throw error;
        alert('Product created successfully!');
      }
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
              {isEdit ? `Editing product ID: ${initialData.skin_id}` : 'Fill in the details to add a new product to your store.'}
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
        {/* Left Column: Basic Details */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-secondary-ivory space-y-8">
            <h2 className="text-xl font-black tracking-tighter text-text-dark flex items-center gap-3">
              <Tag size={20} className="text-accent-gold" /> General Information
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Product Name</label>
                <input 
                  name="skin_name"
                  value={formData.skin_name}
                  onChange={handleChange}
                  type="text" 
                  placeholder="e.g. Advanced Snail 96 Mucin Power Essence"
                  className="w-full bg-secondary-ivory/50 border-none rounded-2xl px-6 py-5 text-sm focus:ring-2 focus:ring-accent-gold outline-none font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Slug (URL Handle)</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                    <input 
                      name="skin_slug"
                      value={formData.skin_slug}
                      onChange={handleChange}
                      type="text" 
                      placeholder="advanced-snail-96-mucin"
                      className="w-full bg-secondary-ivory/50 border-none rounded-2xl pl-10 pr-6 py-5 text-sm focus:ring-2 focus:ring-accent-gold outline-none font-medium"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Brand</label>
                  <input 
                    name="skin_brand"
                    value={formData.skin_brand}
                    onChange={handleChange}
                    type="text" 
                    placeholder="COSRX"
                    className="w-full bg-secondary-ivory/50 border-none rounded-2xl px-6 py-5 text-sm focus:ring-2 focus:ring-accent-gold outline-none font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Description</label>
                <textarea 
                  name="skin_description"
                  value={formData.skin_description}
                  onChange={handleChange}
                  rows={8}
                  placeholder="Describe the product benefits, usage, and ingredients..."
                  className="w-full bg-secondary-ivory/50 border-none rounded-3xl px-6 py-5 text-sm focus:ring-2 focus:ring-accent-gold outline-none font-medium resize-none"
                  required
                />
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
                  <input 
                    name="skin_price"
                    value={formData.skin_price}
                    onChange={handleChange}
                    type="number" 
                    step="0.01"
                    className="w-full bg-secondary-ivory/50 border-none rounded-2xl pl-10 pr-6 py-5 text-sm focus:ring-2 focus:ring-accent-gold outline-none font-black"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Original Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold">₹</span>
                  <input 
                    name="skin_original_price"
                    value={formData.skin_original_price}
                    onChange={handleChange}
                    type="number" 
                    step="0.01"
                    className="w-full bg-secondary-ivory/50 border-none rounded-2xl pl-10 pr-6 py-5 text-sm focus:ring-2 focus:ring-accent-gold outline-none font-black opacity-60"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Stock Count</label>
                <input 
                  name="skin_stock_count"
                  value={formData.skin_stock_count}
                  onChange={handleChange}
                  type="number" 
                  className="w-full bg-secondary-ivory/50 border-none rounded-2xl px-6 py-5 text-sm focus:ring-2 focus:ring-accent-gold outline-none font-black"
                  required
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-secondary-ivory space-y-8">
            <h2 className="text-xl font-black tracking-tighter text-text-dark flex items-center gap-3">
              <Star size={20} className="text-accent-gold" /> Performance Metrics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Average Rating</label>
                <div className="relative">
                  <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-gold" size={14} />
                  <input 
                    name="skin_rating"
                    value={formData.skin_rating}
                    onChange={handleChange}
                    type="number" 
                    step="0.1"
                    min="0"
                    max="5"
                    className="w-full bg-secondary-ivory/50 border-none rounded-2xl pl-10 pr-6 py-5 text-sm focus:ring-2 focus:ring-accent-gold outline-none font-black"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Review Count</label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                  <input 
                    name="skin_review_count"
                    value={formData.skin_review_count}
                    onChange={handleChange}
                    type="number" 
                    className="w-full bg-secondary-ivory/50 border-none rounded-2xl pl-10 pr-6 py-5 text-sm focus:ring-2 focus:ring-accent-gold outline-none font-black"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Media & Organization */}
        <div className="space-y-8">
          <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-secondary-ivory space-y-8">
            <h2 className="text-xl font-black tracking-tighter text-text-dark flex items-center gap-3">
              <Upload size={20} className="text-accent-gold" /> Media
            </h2>
            
            <div className="space-y-6">
              <div className="aspect-square bg-secondary-ivory rounded-[2.5rem] flex items-center justify-center overflow-hidden border-2 border-dashed border-secondary-ivory group relative">
                {formData.skin_image_url ? (
                  <>
                    <img src={formData.skin_image_url} alt="Preview" className="w-full h-full object-cover p-8 mix-blend-multiply" />
                    <button 
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, skin_image_url: '' }))}
                      className="absolute top-4 right-4 w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-8">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-text-muted shadow-sm">
                      <Upload size={24} />
                    </div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest">No Image Provided</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Image URL</label>
                <input 
                  name="skin_image_url"
                  value={formData.skin_image_url}
                  onChange={handleChange}
                  type="url" 
                  placeholder="https://cdn.shopify.com/..."
                  className="w-full bg-secondary-ivory/50 border-none rounded-2xl px-6 py-5 text-xs focus:ring-2 focus:ring-accent-gold outline-none font-medium truncate"
                  required
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-secondary-ivory space-y-8">
             <h2 className="text-xl font-black tracking-tighter text-text-dark flex items-center gap-3">
              <Tag size={20} className="text-accent-gold" /> Organization
            </h2>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Collection</label>
              <select className="w-full bg-secondary-ivory/50 border-none rounded-2xl px-6 py-5 text-sm focus:ring-2 focus:ring-accent-gold outline-none font-bold tracking-widest uppercase appearance-none cursor-pointer">
                <option>None</option>
                <option>Snail Mucin</option>
                <option>The RX</option>
              </select>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
};
