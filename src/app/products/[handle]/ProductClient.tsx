"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Star, Shield, Truck, RotateCcw, Minus, Plus } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface ProductClientProps {
  product: any;
  recommendations: any[];
}

export const ProductClient: React.FC<ProductClientProps> = ({ product, recommendations }) => {
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();

  // High quality fallback for product images
  const displayImage = imageError || !product.skin_image_url || product.skin_image_url.includes('assets/product.png')
    ? 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop'
    : product.skin_image_url;

  const handleAddToCart = () => {
    addItem({
      id: product.skin_id,
      name: product.skin_name,
      price: product.skin_price,
      image_url: displayImage,
      quantity: quantity,
      handle: product.skin_slug
    });
  };

  const handleQuickAdd = (p: any) => {
    addItem({
      id: p.skin_id,
      name: p.skin_name,
      price: p.skin_price,
      image_url: p.skin_image_url,
      quantity: 1,
      handle: p.skin_slug
    });
  };

  const handleBuyItNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const cleanDescription = (html: string) => {
    if (!html) return "";
    let cleaned = html
      .replace(/bis_size=["'][^"']*["']/g, '')
      .replace(/abs_x=["'][^"']*["']/g, '')
      .replace(/abs_y=["'][^"']*["']/g, '')
      .replace(/style=["']user-select: auto;["']/g, '')
      .replace(/data-mce-fragment=["'][^"']*["']/g, '')
      .replace(/bis_id=["'][^"']*["']/g, '')
      .replace(/bis_depth=["'][^"']*["']/g, '')
      .replace(/bis_chainid=["'][^"']*["']/g, '');

    cleaned = cleaned.replace(/<a\s+[^>]*href=["']https?:\/\/(www\.)?cosrx\.(com|in)[^"']*["'][^>]*>(.*?)<\/a>/gi, '$3');
    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
    return cleaned;
  };

  return (
    <div className="pt-32 pb-24">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-24">
          <div className="space-y-8 flex flex-col items-center">
            <div className="relative w-full aspect-square bg-secondary-ivory overflow-hidden rounded-[2.5rem] shadow-sm max-w-[500px]">
              <Image
                src={displayImage}
                alt={product.skin_name}
                fill
                className="object-contain p-8 mix-blend-multiply transition-transform duration-700 hover:scale-110"
                priority
                onError={() => setImageError(true)}
              />
            </div>
            
            {/* Show thumbnails only if we actually have multiple diverse images */}
            {product.skin_gallery_images && product.skin_gallery_images.length > 0 && (
              <div className="grid grid-cols-4 gap-4 w-full max-w-[500px]">
                {product.skin_gallery_images.map((src: string, i: number) => (
                  <div key={i} className="aspect-square bg-secondary-ivory relative cursor-pointer group rounded-2xl overflow-hidden border border-transparent hover:border-accent-gold transition-all">
                    <Image
                      src={src}
                      alt={`${product.skin_name} view ${i + 1}`}
                      fill
                      className="object-contain p-2 mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                      onError={() => setImageError(true)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="mb-10">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex text-accent-gold">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} fill="currentColor" />)}
                </div>
                <span className="text-[10px] text-text-muted font-black uppercase tracking-widest bg-secondary-ivory px-3 py-1 rounded-full whitespace-nowrap">
                  {product.skin_review_count || 2450} Reviews
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tighter text-text-dark leading-[1.1]">
                {product.skin_name}
              </h1>
              
              <p className="text-accent-gold font-bold text-xs uppercase tracking-[0.4em] mb-8">
                {product.skin_brand || 'COSRX OFFICIAL'}
              </p>
              
              <div className="flex flex-wrap items-baseline gap-4 sm:gap-6 mb-10 pb-10 border-b border-secondary-ivory">
                <span className="text-3xl sm:text-4xl font-black text-text-dark">{formatPrice(product.skin_price)}</span>
                {product.skin_original_price && product.skin_original_price > product.skin_price && (
                  <>
                    <span className="text-xl sm:text-2xl text-text-muted line-through opacity-40 font-medium">
                      {formatPrice(product.skin_original_price)}
                    </span>
                    <span className="bg-accent-gold text-white text-[10px] font-black px-3 py-1.5 rounded-lg tracking-widest uppercase shadow-lg shadow-accent-gold/20 whitespace-nowrap">
                      Save {Math.round(((product.skin_original_price - product.skin_price) / product.skin_original_price) * 100)}%
                    </span>
                  </>
                )}
              </div>
              
              <div 
                className="prose prose-sm max-w-none text-text-muted leading-relaxed mb-10 prose-p:mb-4 prose-strong:text-text-dark prose-a:text-accent-gold prose-img:rounded-3xl prose-img:my-8"
                dangerouslySetInnerHTML={{ __html: cleanDescription(product.skin_description) }}
              />
            </div>

            <div className="space-y-4 mb-12">
              <div className="flex flex-col sm:flex-row items-stretch gap-4">
                <div className="flex items-center border-2 border-secondary-ivory rounded-2xl h-16 bg-white overflow-hidden">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-full px-6 hover:bg-secondary-ivory transition-colors text-text-dark"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="px-4 font-black text-lg w-14 text-center text-text-dark">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-full px-6 hover:bg-secondary-ivory transition-colors text-text-dark"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <Button 
                  size="lg" 
                  className="flex-1 h-16 text-sm font-black tracking-[0.2em] bg-text-dark hover:bg-accent-gold text-white border-none rounded-2xl shadow-xl transition-all active:scale-[0.98]"
                  onClick={handleAddToCart}
                >
                  ADD TO CART
                </Button>
              </div>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full h-16 text-sm font-black tracking-[0.2em] border-2 border-text-dark text-text-dark hover:bg-text-dark hover:text-white rounded-2xl transition-all"
                onClick={handleBuyItNow}
              >
                BUY IT NOW
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-12 border-t border-secondary-ivory">
              {[
                { icon: <Shield size={20} />, label: "Authentic Product" },
                { icon: <Truck size={20} />, label: "Tracked Shipping" },
                { icon: <RotateCcw size={20} />, label: "30-Day Returns" },
                { icon: <Star size={20} />, label: "Derm Recommended" }
              ].map((perk, i) => (
                <div key={i} className="flex items-center space-x-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-secondary-ivory flex items-center justify-center text-accent-gold group-hover:bg-accent-gold group-hover:text-white transition-all duration-500 shadow-sm">
                    {perk.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dark/60">{perk.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended Products Section */}
        {recommendations && recommendations.length > 0 && (
          <div className="pt-24 border-t border-secondary-ivory">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-text-dark uppercase italic">You Might Also Love</h2>
                <p className="text-text-muted mt-2 font-medium italic">Handpicked essentials for your skincare routine.</p>
              </div>
              <Link href="/products" className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold hover:underline">
                Explore All Products →
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {recommendations.map((p, i) => (
                <motion.div 
                  key={p.skin_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group"
                >
                  <div className="relative aspect-[4/5] bg-secondary-ivory rounded-[2rem] overflow-hidden mb-6 group-hover:shadow-2xl transition-all duration-500">
                    <Link href={`/products/${p.skin_slug}`}>
                      <Image
                        src={p.skin_image_url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop'}
                        alt={p.skin_name}
                        fill
                        className="object-contain p-6 mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                      />
                    </Link>
                    
                    <button 
                      onClick={() => handleQuickAdd(p)}
                      className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-text-dark shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-accent-gold hover:text-white"
                      title="Quick Add to Cart"
                    >
                      <Plus size={20} />
                    </button>
                    
                    {p.skin_original_price > p.skin_price && (
                      <div className="absolute top-4 left-4 bg-accent-gold text-white text-[8px] font-black px-2 py-1 rounded-md tracking-widest uppercase">
                        SALE
                      </div>
                    )}
                  </div>

                  <Link href={`/products/${p.skin_slug}`}>
                    <h3 className="text-sm font-black text-text-dark uppercase tracking-tight italic mb-2 group-hover:text-accent-gold transition-colors line-clamp-1">{p.skin_name}</h3>
                    <div className="flex items-center space-x-3">
                      <span className="text-base font-black text-text-dark">{formatPrice(p.skin_price)}</span>
                      {p.skin_original_price > p.skin_price && (
                        <span className="text-xs text-text-muted line-through opacity-50">{formatPrice(p.skin_original_price)}</span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
