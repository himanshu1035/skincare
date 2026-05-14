"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Star } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: {
    skin_id: string;
    skin_name: string;
    skin_price: number;
    skin_original_price?: number;
    skin_image_url: string;
    skin_slug: string;
    skin_brand?: string;
    skin_rating?: number;
    skin_review_count?: number;
    isBOGO?: boolean;
    isGift?: boolean;
  };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCartStore();
  const [imageError, setImageError] = useState(false);

  // Fallback image logic - Using reliable Unsplash images as requested
  const displayImage = imageError || !product.skin_image_url || product.skin_image_url.includes('assets/product.png')
    ? 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=800&auto=format&fit=crop' // Stable High quality fallback
    : product.skin_image_url;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.skin_id,
      name: product.skin_name,
      price: product.skin_price,
      image_url: displayImage,
      quantity: 1,
      handle: product.skin_slug,
      category_id: (product as any).skin_category_id
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group flex flex-col h-full bg-white transition-all duration-300"
    >
      {/* Image Container */}
      <Link href={`/products/${product.skin_slug}`} className="block relative aspect-[4/5] overflow-hidden bg-secondary-ivory rounded-2xl mb-5">
        <Image
          src={displayImage}
          alt={product.skin_name}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
          onError={() => setImageError(true)}
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.skin_original_price && product.skin_original_price > product.skin_price && (
            <div className="bg-text-dark text-white text-[9px] font-black px-3 py-1.5 tracking-widest uppercase rounded-lg shadow-xl">
              SALE
            </div>
          )}

        </div>

        {/* Quick Add Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <button 
            onClick={handleQuickAdd}
            className="w-full bg-white text-text-dark py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:bg-text-dark hover:text-white shadow-xl"
          >
            <ShoppingBag size={14} />
            QUICK ADD
          </button>
        </div>
      </Link>

      {/* Info Container */}
      <div className="flex flex-col flex-1 px-1">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={10} 
              className={i < (product.skin_rating || 5) ? "fill-accent-gold text-accent-gold" : "text-secondary-ivory"} 
            />
          ))}
          <span className="text-[10px] text-text-muted ml-1 font-medium">({product.skin_review_count || 120})</span>
        </div>
        
        <Link href={`/products/${product.skin_slug}`} className="block group/title">
          <h3 className="text-sm font-bold text-text-dark line-clamp-2 leading-relaxed mb-3 group-hover/title:text-accent-gold transition-colors">
            {product.skin_name}
          </h3>
        </Link>
        
        <div className="mt-auto flex items-center gap-3">
          <span className="text-base font-black text-text-dark">{formatPrice(product.skin_price)}</span>
          {product.skin_original_price && product.skin_original_price > product.skin_price && (
            <span className="text-sm text-text-muted line-through opacity-50 font-medium">
              {formatPrice(product.skin_original_price)}
            </span>
          )}
        </div>
        
        <p className="text-[10px] text-text-muted uppercase font-bold tracking-[0.2em] mt-3 opacity-60">
          {product.skin_brand || 'COSRX'}
        </p>
      </div>
    </motion.div>
  );
};
