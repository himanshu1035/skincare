"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Star, Shield, Truck, RotateCcw, Minus, Plus } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

interface ProductClientProps {
  product: any;
}

export const ProductClient: React.FC<ProductClientProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // High quality fallback for product images
  const displayImage = imageError || !product.skin_image_url || product.skin_image_url.includes('assets/product.png')
    ? 'https://cdn.shopify.com/s/files/1/0511/4845/6114/files/Snail_Essence_PC_800x.jpg'
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
    cleaned = cleaned.replace(/<a\s+[^>]*href=["']https?:\/\/(www\.)?cosrx\.com[^"']*["'][^>]*>(.*?)<\/a>/gi, '$2');
    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
    return cleaned;
  };

  return (
    <div className="pt-32 pb-24">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Image Gallery */}
          <div className="space-y-6">
            <div className="relative aspect-square bg-secondary-ivory overflow-hidden rounded-[2.5rem] shadow-sm">
              <Image
                src={displayImage}
                alt={product.skin_name}
                fill
                className="object-contain p-8 mix-blend-multiply transition-transform duration-700 hover:scale-110"
                priority
                onError={() => setImageError(true)}
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[displayImage, displayImage, displayImage, displayImage].map((src, i) => (
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
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex text-accent-gold">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} fill="currentColor" />)}
                </div>
                <span className="text-[10px] text-text-muted font-black uppercase tracking-widest bg-secondary-ivory px-3 py-1 rounded-full">
                  {product.skin_review_count || 2450} Reviews
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter text-text-dark leading-[1.1]">
                {product.skin_name}
              </h1>
              
              <p className="text-accent-gold font-bold text-xs uppercase tracking-[0.4em] mb-8">
                {product.skin_brand || 'COSRX OFFICIAL'}
              </p>
              
              <div className="flex items-center space-x-6 mb-10 pb-10 border-b border-secondary-ivory">
                <span className="text-4xl font-black text-text-dark">{formatPrice(product.skin_price)}</span>
                {product.skin_original_price && product.skin_original_price > product.skin_price && (
                  <span className="text-2xl text-text-muted line-through opacity-40 font-medium">
                    {formatPrice(product.skin_original_price)}
                  </span>
                )}
                <span className="bg-accent-gold text-white text-[10px] font-black px-3 py-1.5 rounded-lg tracking-widest uppercase shadow-lg shadow-accent-gold/20">
                  Save 20%
                </span>
              </div>
              
              <div 
                className="prose prose-sm max-w-none text-text-muted leading-relaxed mb-10 prose-p:mb-4 prose-strong:text-text-dark prose-a:text-accent-gold prose-img:rounded-3xl prose-img:my-8"
                dangerouslySetInnerHTML={{ __html: cleanDescription(product.skin_description) }}
              />
            </div>

            <div className="space-y-4 mb-12">
              <div className="flex flex-col sm:flex-row items-stretch gap-4">
                <div className="flex items-center border-2 border-secondary-ivory rounded-none h-16 bg-white overflow-hidden">
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
                  className="flex-1 h-16 text-sm font-black tracking-[0.2em] bg-text-dark hover:bg-accent-gold text-white border-none rounded-none shadow-xl transition-all active:scale-[0.98]"
                  onClick={handleAddToCart}
                >
                  ADD TO CART
                </Button>
              </div>
              <Button variant="outline" size="lg" className="w-full h-16 text-sm font-black tracking-[0.2em] border-2 border-text-dark text-text-dark hover:bg-text-dark hover:text-white rounded-none transition-all">
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
      </div>
    </div>
  );
};
