import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { PaginatedProductGrid } from '@/components/PaginatedProductGrid';
import { createClient } from '@/lib/supabase';
import { CampaignTimer } from '@/components/CampaignTimer';
import { getEligibleProductsForPromotion, fetchActivePromotions, getPromotionMetadata } from '@/lib/promotionEngine';
import { Sparkles, Calendar, Zap, Gift, Package } from 'lucide-react';

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
      const { data: collectionProducts, error: colProdErr } = await supabase
        .from('skin_collection_products')
        .select('skin_product_id')
        .eq('skin_collection_id', collection.skin_id);
      
      if (colProdErr) console.error('Error fetching collection products:', colProdErr);
 
      if (collectionProducts && collectionProducts.length > 0) {
        const productIds = collectionProducts.map(cp => cp.skin_product_id);
        const { data: realProducts, error: prodErr } = await supabase
          .from('skin_products')
          .select('*')
          .in('skin_id', productIds);
        
        if (prodErr) console.error('Error fetching real products:', prodErr);
        products = realProducts || [];
      }
    }
 
    // Secondary fallback for 'all' handle or if a collection search failed
    if (products.length === 0 && (handle === 'all' || !collection)) {
       const { data: allProducts, error: allProdErr } = await supabase
        .from('skin_products')
        .select('*')
        .range(0, 23) // Limit initial load to 24 products
        .order('skin_created_at', { ascending: false });
       
       if (allProdErr) console.error('Error fetching all products:', allProdErr);
       products = allProducts || [];
    }
  } catch (e) {
    console.error('Critical error in CollectionPage:', e);
  }
 
  // If no collection found and not 'all' view, 404
  if (!collection && handle !== 'all') {
    notFound();
  }
 
  // Fetch promotions to show badges (Safe fetch - won't crash if table missing)
  let allPromotions: any[] = [];
  try {
    const { data: promoData } = await supabase.from('skin_promotions').select('*, targets:skin_promotion_targets(*)');
    if (promoData) allPromotions = promoData;
  } catch (e) {
    // Promotions disabled or table missing
  }
 
  const productsWithPromos = products.map(product => {
    const isBOGO = allPromotions.some(promo => 
      promo.skin_type === 'bogo' && (promo.targets || []).some((t: any) => 
        !t.skin_is_exclusion && (t.skin_target_type === 'product' ? t.skin_target_id === product.skin_id : t.skin_target_id === product.skin_category_id)
      )
    );
    return { ...product, isBOGO };
  });
 
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-24 pb-24">
        {/* Collection Hero */}
        <section className="relative h-[45vh] min-h-[400px] overflow-hidden mb-16 mx-4 md:mx-8 rounded-[3rem] group">
           <img 
              src={collection?.skin_image_url || 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=2000&auto=format&fit=crop'} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110" 
              alt={collection?.skin_name || handle} 
           />
           <div className="absolute inset-0 bg-gradient-to-t from-text-dark/80 via-text-dark/20 to-transparent" />
           <div className="absolute bottom-12 left-12 right-12 z-10">
              <div className="container max-w-none px-0">
                <span className="text-accent-gold font-bold tracking-[0.4em] uppercase text-[10px] mb-4 block flex items-center gap-2">
                   Curated Collection
                </span>
                <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter uppercase mb-4 leading-none">
                   {collection?.skin_name || handle.replace(/-/g, ' ')}
                </h1>
                <p className="text-white/80 max-w-2xl leading-relaxed text-sm md:text-base font-medium italic">
                  {collection?.skin_description || `Discover our curated selection of premium skincare formulas designed for your specific concerns.`}
                </p>
              </div>
           </div>
        </section>
 
        <div className="container">
          {productsWithPromos.length > 0 ? (
            <PaginatedProductGrid 
              initialProducts={productsWithPromos} 
              handle={handle} 
              collectionId={collection?.skin_id} 
            />
          ) : (
            <div className="py-24 text-center bg-secondary-ivory/30 rounded-[3rem] border border-dashed border-secondary-ivory">
               <Package className="mx-auto text-text-muted mb-6 opacity-20" size={64} />
               <h3 className="text-xl font-black text-text-dark uppercase tracking-tighter mb-2">Collection is Empty</h3>
               <p className="text-xs font-medium text-text-muted italic mb-8">We are currently updating this selection. Check back soon!</p>
               <Link href="/collections/all">
                  <button className="h-14 px-10 bg-text-dark text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-accent-gold transition-all">
                     CONTINUE SHOPPING
                  </button>
               </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
