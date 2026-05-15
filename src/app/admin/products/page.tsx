import React from 'react';
import { createClient } from '@/lib/supabase';
import { Plus, Edit2, Trash2, ExternalLink, Search, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { ThumbnailImage } from '@/components/ThumbnailImage';
import { ProductInventoryClient } from './ProductInventoryClient';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const supabase = createClient();
  
  // Fetch products with their category names and collection associations
  const [productsRes, collectionsRes, categoriesRes] = await Promise.all([
    supabase.from('skin_products').select(`
      *,
      skin_categories (skin_name),
      skin_collection_products (skin_collection_id)
    `).order('skin_created_at', { ascending: false }),
    supabase.from('skin_collections').select('*').order('skin_name'),
    supabase.from('skin_categories').select('*').order('skin_name')
  ]);

  return (
    <ProductInventoryClient 
      initialProducts={productsRes.data || []} 
      collections={collectionsRes.data || []}
      categories={categoriesRes.data || []}
    />
  );
}
