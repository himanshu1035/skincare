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
  Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { AssignCollectionClient } from './AssignCollectionClient';

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
    .select('skin_id, skin_name, skin_image_url')
    .order('skin_name');

  // 3. Fetch currently assigned product IDs
  const { data: assigned } = await supabase
    .from('skin_collection_products')
    .select('skin_product_id')
    .eq('skin_collection_id', id);

  const assignedIds = assigned?.map(a => a.skin_product_id) || [];
 
  return (
    <AssignCollectionClient 
      collection={collection} 
      allProducts={allProducts || []} 
      initialAssignedIds={assignedIds} 
    />
  );
}
