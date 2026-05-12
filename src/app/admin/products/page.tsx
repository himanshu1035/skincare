import React from 'react';
import { createClient } from '@/lib/supabase';
import { Plus, Edit2, Trash2, ExternalLink, Search, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { ThumbnailImage } from '@/components/ThumbnailImage';

export default async function AdminProductsPage() {
  const supabase = createClient();
  
  // Fetch products with their category names
  const { data: products } = await supabase
    .from('skin_products')
    .select(`
      *,
      skin_categories (skin_name)
    `)
    .order('skin_created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-500 text-xs mt-1 italic">Managing {products?.length || 0} products in your catalog.</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="h-10 px-6 bg-black text-white rounded-lg text-xs font-bold flex items-center gap-2">
            <Plus size={16} /> ADD NEW PRODUCT
          </Button>
        </Link>
      </header>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by product name, SKU or brand..." 
            className="w-full bg-gray-50 border-none rounded-lg pl-10 pr-4 py-3 text-sm outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Product Info</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Category</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Stock</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Price</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products?.map((product) => (
              <tr key={product.skin_id} className="hover:bg-gray-50/50 transition-colors group text-sm">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <ThumbnailImage 
                        src={product.skin_image_url} 
                        alt={product.skin_name} 
                        className="w-full h-full object-contain p-1 mix-blend-multiply" 
                      />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 line-clamp-1 tracking-tight">{product.skin_name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{product.skin_brand || 'COSRX'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-3 py-1.5 bg-gray-100 rounded-full">
                    {product.skin_categories?.skin_name || 'COSRX'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <p className={`text-[11px] font-black tracking-tight ${product.skin_stock_count < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                    {product.skin_stock_count || 0} PCS
                  </p>
                </td>
                <td className="px-8 py-6">
                  <p className="font-black text-gray-900">{formatPrice(product.skin_price)}</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/products/${product.skin_id}`}>
                      <button className="p-2.5 text-gray-400 hover:text-black hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-gray-100">
                        <Edit2 size={16} />
                      </button>
                    </Link>
                    <button className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100">
                      <Trash2 size={16} />
                    </button>
                    <Link href={`/products/${product.skin_slug}`} target="_blank">
                      <button className="p-2.5 text-gray-400 hover:text-blue-600 transition-all">
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
    </div>
  );
}
