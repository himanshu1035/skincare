"use client";

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  Search, 
  ShoppingBag,
  Filter,
  ArrowUpDown,
  Tag,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { ThumbnailImage } from '@/components/ThumbnailImage';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface ProductInventoryClientProps {
  initialProducts: any[];
  collections: any[];
  categories: any[];
}

export const ProductInventoryClient = ({ 
  initialProducts, 
  collections,
  categories 
}: ProductInventoryClientProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  const filteredProducts = useMemo(() => {
    let result = initialProducts.filter(p => 
      p.skin_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.skin_category_id === selectedCategory);
    }

    if (selectedCollection !== 'all') {
      // This is trickier because we need to know which products are in which collection
      // Since we already pre-fetched collection mapping in the parent (ideally), 
      // or we can just filter if products have collection info.
      // For now, I'll filter by the collection ID if the product's linked collections match.
      result = result.filter(p => 
        p.skin_collection_products?.some((cp: any) => cp.skin_collection_id === selectedCollection)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'name') return a.skin_name.localeCompare(b.skin_name);
      if (sortBy === 'price') return b.skin_price - a.skin_price;
      if (sortBy === 'stock') return b.skin_stock_count - a.skin_stock_count;
      return 0;
    });

    return result;
  }, [initialProducts, searchTerm, selectedCollection, selectedCategory, sortBy]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    setIsDeleting(id);
    try {
      // 1. Delete collection links
      await supabase.from('skin_collection_products').delete().eq('skin_product_id', id);
      
      // 2. Delete variants
      await supabase.from('skin_variants').delete().eq('skin_product_id', id);
      
      // 3. Delete product
      const { error } = await supabase.from('skin_products').delete().eq('skin_id', id);
      
      if (error) throw error;
      
      router.refresh();
      alert('Product deleted successfully');
    } catch (err: any) {
      alert('Error deleting product: ' + err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-dark tracking-tighter uppercase">Inventory</h1>
          <p className="text-text-muted text-xs mt-2 font-medium italic">Managing {filteredProducts.length} filtered products.</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="h-14 px-10 bg-text-dark text-white rounded-full text-xs font-black tracking-widest flex items-center gap-3 shadow-xl hover:bg-accent-gold transition-all duration-300">
            <Plus size={18} /> NEW PRODUCT
          </Button>
        </Link>
      </header>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-[2rem] border border-secondary-ivory shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-secondary-ivory/50 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-accent-gold"
            />
          </div>

          {/* Collection Filter */}
          <div className="flex items-center gap-2 bg-secondary-ivory/30 px-4 py-2 rounded-2xl border border-secondary-ivory/50">
            <Tag size={16} className="text-text-muted" />
            <select 
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
            >
              <option value="all">All Collections</option>
              {collections.map(c => (
                <option key={c.skin_id} value={c.skin_id}>{c.skin_name}</option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-2 bg-secondary-ivory/30 px-4 py-2 rounded-2xl border border-secondary-ivory/50">
            <ArrowUpDown size={16} className="text-text-muted" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Highest Price</option>
              <option value="stock">Highest Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-secondary-ivory rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-secondary-ivory bg-secondary-ivory/10">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Product Detail</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Category</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Inventory</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Price</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-ivory/30">
              {filteredProducts.map((product) => (
                <tr key={product.skin_id} className="hover:bg-accent-gold/[0.02] transition-colors group">
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-[1.5rem] bg-secondary-ivory/30 border border-secondary-ivory flex items-center justify-center overflow-hidden p-2 group-hover:scale-110 transition-transform duration-500">
                        <ThumbnailImage 
                          src={product.skin_image_url} 
                          alt={product.skin_name} 
                          className="w-full h-full object-contain mix-blend-multiply" 
                        />
                      </div>
                      <div>
                        <p className="font-black text-text-dark text-base tracking-tight mb-1">{product.skin_name}</p>
                        <p className="text-[9px] font-black text-accent-gold uppercase tracking-[0.2em]">{product.skin_brand || 'COSRX OFFICIAL'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted px-4 py-2 bg-secondary-ivory rounded-full">
                      {product.skin_categories?.skin_name || 'Standard'}
                    </span>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex flex-col gap-1">
                       <p className={`text-xs font-black tracking-tight ${product.skin_stock_count < 10 ? 'text-red-500' : 'text-text-dark'}`}>
                         {product.skin_stock_count || 0} UNITS
                       </p>
                       <div className="w-24 h-1.5 bg-secondary-ivory rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${product.skin_stock_count < 10 ? 'bg-red-500' : 'bg-accent-gold'}`} style={{ width: `${Math.min(100, (product.skin_stock_count || 0) * 2)}%` }} />
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <p className="font-black text-text-dark text-lg">{formatPrice(product.skin_price)}</p>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/products/${product.skin_id}`}>
                        <button className="w-10 h-10 rounded-full bg-secondary-ivory/50 flex items-center justify-center text-text-muted hover:text-text-dark hover:bg-white hover:shadow-md transition-all">
                          <Edit2 size={16} />
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleDelete(product.skin_id)}
                        disabled={isDeleting === product.skin_id}
                        className="w-10 h-10 rounded-full bg-secondary-ivory/50 flex items-center justify-center text-text-muted hover:text-red-600 hover:bg-red-50 transition-all"
                      >
                        {isDeleting === product.skin_id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                      </button>
                      <Link href={`/products/${product.skin_slug}`} target="_blank">
                        <button className="w-10 h-10 rounded-full bg-secondary-ivory/50 flex items-center justify-center text-text-muted hover:text-accent-gold transition-all">
                          <ExternalLink size={16} />
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <ShoppingBag size={48} className="mx-auto text-secondary-ivory" />
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">No products match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};
