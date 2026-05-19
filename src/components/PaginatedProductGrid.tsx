"use client";

import React, { useState } from 'react';
import { ProductCard } from './ProductCard';
import { Button } from './ui/Button';
import { Loader2, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface PaginatedProductGridProps {
  initialProducts: any[];
  collectionId?: string;
  handle: string;
  initialTotal?: number;
}

export const PaginatedProductGrid: React.FC<PaginatedProductGridProps> = ({ 
  initialProducts, 
  collectionId, 
  handle,
}) => {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(handle === 'all' ? false : initialProducts.length >= 24);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const loadMore = async () => {
    setIsLoading(true);
    const nextPage = page + 1;
    const from = page * 24;
    const to = from + 23;

    try {
      let nextProducts: any[] = [];
      
      if (handle === 'all' || !collectionId) {
        const { data } = await supabase
          .from('skin_products')
          .select('*')
          .range(from, to)
          .order('skin_created_at', { ascending: false });
        nextProducts = data || [];
      } else {
        // Fetch from junction table
        const { data: junctionData } = await supabase
          .from('skin_collection_products')
          .select('skin_product_id')
          .eq('skin_collection_id', collectionId)
          .range(from, to);
        
        if (junctionData && junctionData.length > 0) {
          const ids = junctionData.map(j => j.skin_product_id);
          const { data } = await supabase
            .from('skin_products')
            .select('*')
            .in('skin_id', ids);
          nextProducts = data || [];
        }
      }

      if (nextProducts.length > 0) {
        // Fetch promos for these new products (or just append if you want to skip promo check for now)
        // For performance, we'll assume promos are handled or fetch them here
        setProducts(prev => [...prev, ...nextProducts]);
        setPage(nextPage);
        setHasMore(nextProducts.length === 24);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-20">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
        {products.map((product) => (
          <ProductCard key={product.skin_id} product={product} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-10 border-t border-secondary-ivory">
          <Button 
            onClick={loadMore} 
            disabled={isLoading}
            className="h-16 px-12 rounded-full bg-text-dark text-white font-black text-xs tracking-[0.2em] uppercase hover:bg-accent-gold transition-all shadow-2xl flex items-center gap-3"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <><Plus size={18} /> LOAD MORE FORMULAS</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
