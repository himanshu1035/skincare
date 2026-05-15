import React from 'react';
export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase';
import { CollectionClient } from './CollectionClient';

export default async function AdminCollectionsPage() {
  const supabase = createClient();
  
  // Fetch collections with product counts
  const { data: collections } = await supabase
    .from('skin_collections')
    .select(`
      *,
      skin_collection_products (count)
    `)
    .order('skin_name');

  return <CollectionClient collections={collections || []} />;
}
