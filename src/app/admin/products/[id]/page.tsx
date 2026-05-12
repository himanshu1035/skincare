import React from 'react';
import { AdminProductForm } from '@/components/AdminProductForm';
import { createClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createClient();
  
  const { data: product } = await supabase
    .from('skin_products')
    .select('*')
    .eq('skin_id', id)
    .single();

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <AdminProductForm initialData={product} isEdit={true} />
    </div>
  );
}
