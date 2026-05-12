import React from 'react';
import { createClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  Search, 
  CheckCircle2, 
  Circle,
  Save,
  Tag,
  Edit3,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default async function AssignCollectionProductsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createClient();
  
  // 1. Fetch current collection
  const { data: collection } = await supabase
    .from('skin_collections')
    .select('*')
    .eq('skin_id', id)
    .single();

  if (!collection) notFound();

  // 2. Fetch all products
  const { data: allProducts } = await supabase
    .from('skin_products')
    .select('skin_id, skin_name, skin_brand')
    .order('skin_name');

  // 3. Fetch currently assigned product IDs
  const { data: assigned } = await supabase
    .from('skin_collection_products')
    .select('skin_product_id')
    .eq('skin_collection_id', id);

  const assignedIds = new Set(assigned?.map(a => a.skin_product_id) || []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/collections">
            <button className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 transition-all">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-gray-400" />
              <h1 className="text-2xl font-bold text-gray-900">{collection.skin_name}</h1>
            </div>
            <p className="text-gray-500 text-xs mt-1">Select products for this collection or click edit to change details.</p>
          </div>
        </div>
        <Button className="h-11 px-8 bg-black text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-black/10">
          <Save size={16} /> SAVE CHANGES
        </Button>
      </header>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search products by name..." 
            className="w-full bg-gray-50 border-none rounded-lg pl-10 pr-4 py-3 text-sm outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      {/* Product Selection List - High Speed (No Photos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {allProducts?.map((product) => {
          const isAssigned = assignedIds.has(product.skin_id);
          return (
            <div 
              key={product.skin_id}
              className={`p-4 rounded-xl border transition-all cursor-pointer group flex items-center gap-4 bg-white relative ${
                isAssigned ? 'border-black ring-1 ring-black' : 'border-gray-100 hover:border-gray-300'
              }`}
            >
              <div className={isAssigned ? "text-black" : "text-gray-300"}>
                {isAssigned ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900 truncate pr-8">
                  {product.skin_name}
                </h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{product.skin_brand || 'COSRX'}</p>
              </div>

              <Link 
                href={`/admin/products/${product.skin_id}`}
                className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-lg transition-all"
                title="Edit Product"
              >
                <Edit3 size={16} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
