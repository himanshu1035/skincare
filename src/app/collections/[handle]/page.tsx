import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
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
    .select('*, skin_promotions(*), skin_campaigns(*)')
    .eq('skin_slug', handle)
    .single();

  // Fetch products in this collection
  let products: any[] = [];
  try {
    if (collection?.skin_is_dynamic && collection.skin_promotion_id) {
       // Dynamic Collection Logic: Fetch products eligible for the promotion
       products = await getEligibleProductsForPromotion(collection.skin_promotion_id);
    } else if (collection) {
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

  // If no collection found and not 'all' view, 404
  if (!collection && handle !== 'all') {
    notFound();
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
                  {collection?.skin_is_dynamic ? <><Sparkles size={14} /> Seasonal Selection</> : 'Curated Collection'}
                </span>
                <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter uppercase mb-4 leading-none">
                   {collection?.skin_name || handle.replace('-', ' ')}
                </h1>
                <p className="text-white/80 max-w-2xl leading-relaxed text-sm md:text-base font-medium italic">
                  {collection?.skin_description || `Discover our curated selection of premium skincare formulas designed for your specific concerns.`}
                </p>
              </div>
           </div>
        </section>

        <div className="container">
          {collection?.skin_is_dynamic && (
            <div className="mb-12 p-8 bg-secondary-ivory rounded-[3rem] border border-accent-gold/20 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-text-dark rounded-2xl flex items-center justify-center text-accent-gold shadow-xl">
                     <Zap size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-text-dark tracking-tighter uppercase leading-tight">
                      {collection.skin_promotions?.skin_title || 'Limited Time Offer'}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="px-3 py-1 bg-accent-gold text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                          <Gift size={12} /> {getPromotionMetadata(collection.skin_promotions as any)}
                       </span>
                    </div>
                  </div>
               </div>
               
               {collection.skin_promotions?.skin_end_date && (
                 <div className="flex flex-col items-center md:items-end gap-3">
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] flex items-center gap-2">
                     <Calendar size={12} /> Offer Ends In:
                   </p>
                   <CampaignTimer endDate={collection.skin_promotions.skin_end_date} />
                 </div>
               )}
            </div>
          )}
          {productsWithPromos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
              {productsWithPromos.map((product: any) => (
                <ProductCard key={product.skin_id} product={product} />
              ))}
            </div>
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
