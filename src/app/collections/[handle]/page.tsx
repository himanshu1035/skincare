import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { createClient } from '@/lib/supabase';

import { notFound } from 'next/navigation';

export default async function CollectionPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  
  if (handle === 'dermskincare-guide') {
    notFound();
  }

  const supabase = createClient();
  
  // Fetch collection details
  const { data: collection } = await supabase
    .from('skin_collections')
    .select('*')
    .eq('skin_slug', handle)
    .single();

  // Fetch products in this collection
  let products: any[] = [];
  try {
    if (collection) {
      const { data: collectionProducts } = await supabase
        .from('skin_collection_products')
        .select('skin_product_id')
        .eq('skin_collection_id', collection.skin_id);
      
      if (collectionProducts && collectionProducts.length > 0) {
        const productIds = collectionProducts.map(cp => cp.skin_product_id);
        const { data: realProducts } = await supabase
          .from('skin_products')
          .select('*')
          .in('skin_id', productIds);
        products = realProducts || [];
      }
    } else if (handle === 'all') {
       const { data: allProducts } = await supabase
        .from('skin_products')
        .select('*')
        .limit(40);
       products = allProducts || [];
    }
  } catch (e) {
    console.error('Error fetching collection products:', e);
  }

  // Fallback to mock if empty
  if (products.length === 0) {
    products = [
      {
        skin_id: '1',
        skin_name: 'Advanced Snail 96 Mucin Power Essence',
        skin_price: 25.00,
        skin_image_url: 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/james_800x1067_1_1_4e9750cc-2cd6-4817-ace5-be2305a85806.jpg',
        skin_slug: 'advanced-snail-96-mucin-power-essence',
        skin_brand: 'COSRX'
      },
      {
        skin_id: '2',
        skin_name: 'The Retinol 0.1 Cream',
        skin_price: 27.00,
        skin_image_url: 'https://cdn.shopify.com/s/files/1/0513/3775/6828/files/02_800x1067_c1901a88-75c4-4b5c-a55d-85f8c85855f4.jpg',
        skin_slug: 'the-retinol-0-1-cream',
        skin_brand: 'COSRX'
      }
    ];
  }

  // Fetch promotions to show badges
  const { fetchActivePromotions } = await import('@/lib/promotionEngine');
  const allPromotions = await fetchActivePromotions();

  const productsWithPromos = products.map(product => {
    const isBOGO = allPromotions.some(promo => 
      promo.skin_type === 'bogo' && promo.targets.some(t => 
        !t.skin_is_exclusion && (t.skin_target_type === 'product' ? t.skin_target_id === product.skin_id : t.skin_target_id === product.skin_category_id)
      )
    );
    const isGift = allPromotions.some(promo => 
      promo.skin_type === 'free_gift' && promo.targets.some(t => 
        !t.skin_is_exclusion && (t.skin_target_type === 'product' ? t.skin_target_id === product.skin_id : t.skin_target_id === product.skin_category_id)
      )
    );
    return { ...product, isBOGO, isGift };
  });

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-32 pb-24">
        <div className="container">
          <header className="mb-16">
            <span className="text-accent-gold font-bold tracking-[0.2em] uppercase text-xs mb-4 block">
              Collection
            </span>
            <h1 className="text-5xl font-bold mb-6 capitalize">{collection?.skin_name || handle.replace('-', ' ')}</h1>
            <p className="text-text-muted max-w-2xl leading-relaxed">
              {collection?.skin_description || `Discover our curated selection of ${handle.replace('-', ' ')} products designed for your skin concerns.`}
            </p>
          </header>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
            {productsWithPromos.map((product: any) => (
              <ProductCard key={product.skin_id} product={product} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
