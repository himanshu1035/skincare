import React from 'react';
import { createClient } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { CampaignTimer } from '@/components/CampaignTimer';
import { Gift, Zap, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { notFound } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

export default async function CampaignPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const supabase = createClient();

  // 1. Fetch Campaign Details
  const { data: campaign } = await supabase
    .from('skin_campaigns')
    .select('*, skin_promotions(*)')
    .eq('skin_slug', handle)
    .single();

  if (!campaign) {
    // If not a formal campaign, check if it's a direct offer link (e.g. offer-UUID)
    if (handle.startsWith('offer-')) {
      const offerId = handle.replace('offer-', '');
      const { data: offer } = await supabase.from('skin_promotions').select('*').eq('skin_id', offerId).single();
      if (!offer) notFound();
      
      // Construct a virtual campaign
      const virtualCampaign = {
        skin_title: offer.skin_title,
        skin_description: offer.skin_description,
        skin_promotions: offer,
        skin_end_date: offer.skin_end_date
      };
      return <CampaignView campaign={virtualCampaign} products={await fetchOfferProducts(offer, supabase)} />;
    }
    notFound();
  }

  const products = await fetchOfferProducts(campaign.skin_promotions, supabase);

  return <CampaignView campaign={campaign} products={products} />;
}

async function fetchOfferProducts(offer: any, supabase: any) {
  if (!offer) return [];
  
  const { data: targets } = await supabase
    .from('skin_promotion_targets')
    .select('*')
    .eq('skin_promotion_id', offer.skin_id);
  
  if (!targets || targets.length === 0) {
    // Storewide - return some bestsellers or all
    const { data: all } = await supabase.from('skin_products').select('*').limit(20);
    return all || [];
  }

  const productIds = targets.filter((t: any) => t.skin_target_type === 'product').map((t: any) => t.skin_target_id);
  const categoryIds = targets.filter((t: any) => t.skin_target_type === 'category').map((t: any) => t.skin_target_id);

  let targetedProducts: any[] = [];
  
  if (productIds.length > 0) {
    const { data } = await supabase.from('skin_products').select('*').in('skin_id', productIds);
    if (data) targetedProducts = [...targetedProducts, ...data];
  }

  if (categoryIds.length > 0) {
    const { data } = await supabase.from('skin_products').select('*').in('skin_category_id', categoryIds);
    if (data) targetedProducts = [...targetedProducts, ...data];
  }

  return targetedProducts;
}

function CampaignView({ campaign, products }: { campaign: any, products: any[] }) {
  const offer = campaign.skin_promotions;
  
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden bg-secondary-ivory">
         <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
            <Sparkles size={400} className="text-accent-gold" />
         </div>
         
         <div className="container relative z-10">
            <div className="max-w-4xl space-y-12">
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="px-4 py-1.5 bg-accent-gold text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                        Special Event
                     </div>
                     {campaign.skin_end_date && (
                        <div className="flex items-center gap-2 text-text-muted text-[10px] font-black uppercase tracking-widest">
                           <Zap size={14} className="text-accent-gold" /> Ends Soon
                        </div>
                     )}
                  </div>
                  
                  <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9]">
                     {campaign.skin_title}
                  </h1>
                  <p className="text-xl md:text-2xl text-text-muted font-medium max-w-2xl leading-relaxed italic">
                     {campaign.skin_description}
                  </p>
               </div>

               {campaign.skin_end_date && (
                 <div className="pt-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-dark mb-6">Campaign Ends In</p>
                    <CampaignTimer endDate={campaign.skin_end_date} />
                 </div>
               )}

               <div className="flex flex-wrap gap-8 pt-12 border-t border-text-dark/10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-accent-gold shadow-sm">
                        <Gift size={24} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Benefit</p>
                        <p className="text-sm font-black text-text-dark uppercase">
                           {offer?.skin_type === 'bogo' ? `Buy ${offer.skin_buy_quantity} Get ${offer.skin_get_quantity}` : 'Exclusive Gift Included'}
                        </p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-accent-gold shadow-sm">
                        <ShieldCheck size={24} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Availability</p>
                        <p className="text-sm font-black text-text-dark uppercase">Limited Quantity Stock</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Product Grid */}
      <section className="py-32">
         <div className="container">
            <div className="flex flex-col items-center text-center mb-20">
               <span className="text-accent-gold font-bold tracking-[0.4em] uppercase text-[10px] mb-4">The Selection</span>
               <h2 className="text-5xl font-black tracking-tighter mb-6">Eligible Products</h2>
               <div className="w-20 h-1 bg-accent-gold rounded-full" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
               {products.map((product) => (
                  <ProductCard key={product.skin_id} product={product} />
               ))}
               {products.length === 0 && (
                 <div className="col-span-full py-20 text-center">
                    <p className="text-text-muted italic">No specific products found for this campaign. Discover our bestsellers below.</p>
                 </div>
               )}
            </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}
