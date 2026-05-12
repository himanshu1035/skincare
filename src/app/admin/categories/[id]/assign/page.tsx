import React from 'react';
import { createClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  Search, 
  CheckCircle2, 
  Circle,
  Save,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default async function AssignProductsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createClient();
  
  // 1. Fetch current category
  const { data: category } = await supabase
    .from('skin_categories')
    .select('*')
    .eq('skin_id', id)
    .single();

  if (!category) notFound();

  // 2. Fetch all products
  const { data: allProducts } = await supabase
    .from('skin_products')
    .select('skin_id, skin_name, skin_image_url, skin_category_id')
    .order('skin_name');

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/categories">
            <button className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 transition-all">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-gray-400" />
              <h1 className="text-2xl font-bold text-gray-900">{category.skin_name}</h1>
            </div>
            <p className="text-gray-500 text-xs mt-1">Select products to assign to this category.</p>
          </div>
        </div>
        <Button className="h-11 px-8 bg-black text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-black/10">
          <Save size={16} /> SAVE CHANGES
        </Button>
      </header>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search products by name..." 
            className="w-full bg-gray-50 border-none rounded-lg pl-10 pr-4 py-3 text-sm outline-none focus:ring-1 focus:ring-black"
          />
        </div>
        <select className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none font-semibold">
          <option>All Products</option>
          <option>Assigned Only</option>
          <option>Unassigned Only</option>
        </select>
      </div>

      {/* Product Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {allProducts?.map((product) => {
          const isAssigned = product.skin_category_id === id;
          return (
            <div 
              key={product.skin_id}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer group flex flex-col gap-4 bg-white ${
                isAssigned ? 'border-black' : 'border-gray-100 hover:border-gray-300'
              }`}
            >
              <div className="relative aspect-square rounded-lg bg-gray-50 overflow-hidden mb-2">
                <img 
                  src={product.skin_image_url} 
                  alt="" 
                  className="w-full h-full object-contain p-4 mix-blend-multiply" 
                />
                <div className="absolute top-2 right-2">
                  {isAssigned ? (
                    <CheckCircle2 size={20} className="text-black fill-white" />
                  ) : (
                    <Circle size={20} className="text-gray-300 group-hover:text-gray-400" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-relaxed">
                  {product.skin_name}
                </h4>
                <p className={`text-[10px] mt-2 font-black uppercase tracking-widest ${
                  isAssigned ? 'text-black' : 'text-gray-400'
                }`}>
                  {isAssigned ? 'Selected' : 'Unassigned'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
