import React from 'react';
export const dynamic = 'force-dynamic';
import { BannerSlider } from '@/components/BannerSlider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { createClient } from '@/lib/supabase';
import { ArrowRight, Sparkles, Droplets, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { CollectionImage } from '@/components/CollectionImage';

export default async function Home() {
  const supabase = createClient();
  
  // 1. Parallel data fetching for maximum performance
  const [collectionsRes, bestSellerColRes, shippingSettingsRes] = await Promise.all([
    supabase.from('skin_collections')
      .select('*')
      .eq('skin_show_on_homepage', true)
      .limit(3),
    supabase.from('skin_collections')
      .select('skin_id')
      .eq('skin_slug', 'best-sellers')
      .single(),
    supabase.from('skin_settings').select('*').in('skin_key', ['free_shipping_threshold'])
  ]);
 
  const collections = collectionsRes.data;
  const bestSellerCollection = bestSellerColRes.data;
  const shippingSettings = shippingSettingsRes.data;
  
  // Static Hero Banner (since Banner Engine is removed)
  const activeBanners = [{
    skin_id: 'default',
    skin_title: 'Unveil Your Glow',
    skin_subtitle: 'Discover the power of dermatologist-recommended Korean skincare.',
    skin_image_desktop: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=2000&auto=format&fit=crop',
    skin_cta_text: 'EXPLORE COLLECTIONS',
    skin_link_type: 'collection',
    skin_link_id: 'all'
  }];
  
  const freeShippingThreshold = shippingSettings?.find(s => s.skin_key === 'free_shipping_threshold')?.skin_value || '1000';

  let products = [];
  if (bestSellerCollection) {
    const { data: bestsellers } = await supabase
      .from('skin_collection_products')
      .select('skin_products (*)')
      .eq('skin_collection_id', bestSellerCollection.skin_id)
      .limit(8);
    
    products = bestsellers?.map(b => b.skin_products).filter(Boolean) || [];
  } 
  
  // Fallback if no best sellers found or collection is empty
  if (products.length === 0) {
    const { data: featured } = await supabase
      .from('skin_products')
      .select('*')
      .limit(8);
    products = featured || [];
  }

  // Optimized fallback images for collections using verified high-res URLs
  const getCollectionImage = (col: any) => {
    if (col.skin_image_url && col.skin_image_url.startsWith('http')) return col.skin_image_url;
    
    const name = col.skin_name.toLowerCase();
    
    // Level 1: Collection-Specific Keywords
    if (name.includes('best')) return 'https://images.unsplash.com/photo-1596462502278-27bfad450526?q=80&w=800&auto=format&fit=crop'; // Premium Serum
    if (name.includes('new') || name.includes('arrival')) return 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=800&auto=format&fit=crop'; // Modern minimalist
    if (name.includes('snail')) return '/snail.png';
    if (name.includes('sun')) return '/sun.png';
    if (name.includes('vitamin c') || name.includes('glow')) return '/vitc.png';
    if (name.includes('propolis') || name.includes('toner')) return '/propolis.png';
    if (name.includes('cleanser')) return 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop';
    
    // Global Rotating Fallbacks based on ID length to ensure diversity even for unknown names
    const fallbacks = [
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800&auto=format&fit=crop'
    ];
    return fallbacks[col.skin_id.length % fallbacks.length];
  };

  return (
    <main className="min-h-screen bg-white selection:bg-accent-gold selection:text-white">
      <Navbar />
      <BannerSlider initialBanners={activeBanners} />
      
      {/* 1. Value Props */}
      <section className="py-16 bg-white border-b border-secondary-ivory">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
            {[
              { icon: <Sparkles size={24} />, title: "Derm-Tested", subtitle: "Expert Formulations" },
              { icon: <Droplets size={24} />, title: "Pure Ingredients", subtitle: "96% Snail Mucin" },
              { icon: <ShieldCheck size={24} />, title: "100% Authentic", subtitle: "Direct from Korea" },
              { icon: <Zap size={24} />, title: "Fast Shipping", subtitle: `Free over ₹${freeShippingThreshold}` }
            ].map((prop, i) => (
              <div key={i} className="flex flex-col items-center space-y-4 group">
                <div className="w-16 h-16 rounded-full bg-secondary-ivory flex items-center justify-center text-accent-gold group-hover:bg-accent-gold group-hover:text-white transition-all duration-500 shadow-sm">
                  {prop.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1">{prop.title}</p>
                  <p className="text-text-muted text-[11px] font-medium">{prop.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Collections Grid */}
      <section className="py-32">
        <div className="container">
          <div className="flex flex-col items-center text-center mb-20">
            <span className="text-accent-gold font-bold tracking-[0.4em] uppercase text-[10px] mb-4">Curated Care</span>
            <h2 className="text-6xl font-black tracking-tighter mb-6">Our Collections</h2>
            <div className="w-20 h-1 bg-accent-gold rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {collections?.map((col) => (
              <Link key={col.skin_slug} href={`/collections/${col.skin_slug}`} className="group relative overflow-hidden rounded-[2.5rem] aspect-[4/5] bg-secondary-ivory">
                <CollectionImage 
                  src={getCollectionImage(col)} 
                  alt={col.skin_name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-text-dark/90 via-text-dark/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                <div className="absolute bottom-10 left-10 right-10 z-10">
                  <h3 className="text-3xl font-black text-white mb-3 tracking-tight">{col.skin_name}</h3>
                  <p className="text-white/80 text-sm font-medium mb-6 line-clamp-2 leading-relaxed">{col.skin_description}</p>
                  <span className="inline-flex items-center gap-2 text-white text-[10px] font-black tracking-widest uppercase border-b-2 border-white/40 pb-1 group-hover:border-white transition-all">
                    Explore Now <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Bestsellers */}
      <section className="py-32 bg-secondary-ivory/30">
        <div className="container">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-xl">
              <span className="text-accent-gold font-bold tracking-[0.4em] uppercase text-[10px] mb-4 block">Trending Globally</span>
              <h2 className="text-5xl font-black tracking-tighter mb-6">Bestsellers</h2>
              <p className="text-text-muted text-lg font-medium leading-relaxed">Experience the power of dermatologist-recommended formulas that actually work.</p>
            </div>
            <Link href="/collections/all" className="hidden md:flex items-center gap-3 text-xs font-black tracking-[0.2em] border-b-2 border-text-dark pb-2 hover:text-accent-gold hover:border-accent-gold transition-all">
              VIEW ALL PRODUCTS <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
            {products.map((product: any) => (
              <ProductCard key={product.skin_id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
