import React from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowRight,
  PackageCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default async function AdminCategoriesPage() {
  const supabase = createClient();
  
  // Fetch categories with product counts
  const { data: categories } = await supabase
    .from('skin_categories')
    .select(`
      *,
      skin_products (count)
    `)
    .order('skin_name');

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-xs mt-1">Organize products into collections and groups.</p>
        </div>
        <Button className="h-10 px-6 bg-black text-white rounded-lg text-xs font-bold flex items-center gap-2">
          <Plus size={16} /> NEW CATEGORY
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories?.map((cat) => (
          <div key={cat.skin_id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                <Layers size={20} />
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-black transition-colors"><Edit2 size={14} /></button>
                <button className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            
            <h3 className="font-bold text-gray-900 text-lg mb-1">{cat.skin_name}</h3>
            <p className="text-gray-500 text-xs mb-6 line-clamp-2">{cat.skin_description || 'No description provided.'}</p>
            
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                <PackageCheck size={14} />
                {cat.skin_products?.[0]?.count || 0} Products
              </div>
              <Link href={`/admin/categories/${cat.skin_id}/assign`}>
                <button className="text-xs font-bold text-black hover:underline flex items-center gap-1">
                  Assign Products <ArrowRight size={12} />
                </button>
              </Link>
            </div>
          </div>
        ))}

        {/* Empty State / Add New */}
        <div className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-8 hover:border-black transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-black transition-colors mb-3">
            <Plus size={24} />
          </div>
          <p className="text-xs font-bold text-gray-500 group-hover:text-black transition-colors uppercase tracking-widest">Add Category</p>
        </div>
      </div>
    </div>
  );
}
