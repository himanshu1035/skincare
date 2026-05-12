import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { createClient } from '@/lib/supabase';
import { ProductClient } from './ProductClient';

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const supabase = createClient();
  
  // Try to fetch product from Supabase
  const { data: product } = await supabase
    .from('skin_products')
    .select('*')
    .eq('skin_slug', handle)
    .single();

  // Mock product if not found
  const finalProduct = product || {
    skin_id: '1',
    skin_name: 'Advanced Snail 96 Mucin Power Essence',
    skin_price: 25.00,
    skin_original_price: 32.00,
    skin_image_url: 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/james_800x1067_1_1_4e9750cc-2cd6-4817-ace5-be2305a85806.jpg',
    skin_slug: 'advanced-snail-96-mucin-power-essence',
    skin_brand: 'COSRX',
    skin_description: '96.3% of Snail Secretion Filtrate helps protect the skin from moisture loss while improving skin elasticity. Snail mucin helps repair and soothes red, sensitized skin post-breakouts by replenishing moisture.'
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <ProductClient product={finalProduct} />
      <Footer />
    </main>
  );
}
