import { createClient } from './supabase';

export interface Promotion {
  skin_id: string;
  skin_title: string;
  skin_description: string;
  skin_type: 'bogo' | 'free_gift' | 'cart_value' | 'quantity' | 'category' | 'combo';
  skin_priority: number;
  skin_min_cart_value: number;
  skin_min_quantity: number;
  skin_buy_quantity: number;
  skin_get_quantity: number;
  skin_discount_percent: number | null;
  skin_discount_amount: number | null;
  skin_free_product_id: string | null;
  targets: PromotionTarget[];
}

export interface PromotionTarget {
  skin_target_type: 'product' | 'category';
  skin_target_id: string;
  skin_is_exclusion: boolean;
}

export const fetchActivePromotions = async () => {
  const supabase = createClient();
  const now = new Date().toISOString();
  
  const { data: promotions, error } = await supabase
    .from('skin_promotions')
    .select(`
      *,
      targets:skin_promotion_targets(*)
    `)
    .eq('skin_is_active', true)
    .or(`skin_start_date.lte.${now},skin_start_date.is.null`)
    .or(`skin_end_date.gte.${now},skin_end_date.is.null`)
    .order('skin_priority', { ascending: false });

  if (error) {
    console.error('Error fetching promotions:', error);
    return [];
  }

  return promotions as Promotion[];
};

export const evaluatePromotions = (cartItems: any[], promotions: Promotion[]) => {
  let savings = 0;
  let freeItems: any[] = [];
  let appliedPromotionIds: string[] = [];

  // Sort promotions by priority
  const sortedPromotions = [...promotions].sort((a, b) => b.skin_priority - a.skin_priority);

  for (const promo of sortedPromotions) {
    let promoSavings = 0;
    let promoFreeItems: any[] = [];

    // Check Cart Value
    const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    if (promo.skin_min_cart_value > 0 && cartTotal < promo.skin_min_cart_value) continue;

    // Check specific logic types
    if (promo.skin_type === 'free_gift' && promo.skin_free_product_id) {
       // Automatic gift based on cart value or specific item presence
       const meetsTarget = promo.targets.length === 0 || promo.targets.some(t => 
         !t.skin_is_exclusion && cartItems.some(ci => 
           t.skin_target_type === 'product' ? ci.id === t.skin_target_id : ci.category_id === t.skin_target_id
         )
       );

       if (meetsTarget) {
         promoFreeItems.push({
           id: promo.skin_free_product_id,
           quantity: 1,
           is_free: true,
           promotion_id: promo.skin_id,
           name: `Gift: ${promo.skin_title}`
         });
         appliedPromotionIds.push(promo.skin_id);
       }
    }

    if (promo.skin_type === 'bogo') {
      // Buy X Get Y logic
      // Find eligible items for this BOGO
      const eligibleItems = cartItems.filter(item => 
        promo.targets.some(t => 
          !t.skin_is_exclusion && (t.skin_target_type === 'product' ? item.id === t.skin_target_id : item.category_id === t.skin_target_id)
        )
      );

      const totalEligibleQuantity = eligibleItems.reduce((acc, item) => acc + item.quantity, 0);
      
      if (totalEligibleQuantity >= promo.skin_buy_quantity) {
        const freeSets = Math.floor(totalEligibleQuantity / promo.skin_buy_quantity);
        const freeQuantity = freeSets * promo.skin_get_quantity;

        if (freeQuantity > 0) {
          // If we have a specific free product ID, add it
          if (promo.skin_free_product_id) {
            promoFreeItems.push({
              id: promo.skin_free_product_id,
              quantity: freeQuantity,
              is_free: true,
              promotion_id: promo.skin_id,
              name: `BOGO: ${promo.skin_title}`
            });
          } else {
            // Otherwise, make the cheapest eligible items free
            // This is complex for a purely client-side evaluatator without full product data
            // We'll calculate savings instead
            const sortedByPrice = [...eligibleItems].sort((a, b) => a.price - b.price);
            let remainingFree = freeQuantity;
            for (const item of sortedByPrice) {
              const freeFromThisItem = Math.min(item.quantity, remainingFree);
              promoSavings += freeFromThisItem * item.price;
              remainingFree -= freeFromThisItem;
              if (remainingFree <= 0) break;
            }
          }
          appliedPromotionIds.push(promo.skin_id);
        }
      }
    }

    if (promo.skin_type === 'combo') {
      // ALL targets must be present in cart
      const allTargetsPresent = promo.targets.every(t => 
        cartItems.some(ci => t.skin_target_type === 'product' ? ci.id === t.skin_target_id : ci.category_id === t.skin_target_id)
      );

      if (allTargetsPresent) {
        if (promo.skin_discount_percent) {
          const eligibleTotal = cartItems.reduce((acc, ci) => {
            const isTarget = promo.targets.some(t => t.skin_target_type === 'product' ? ci.id === t.skin_target_id : ci.category_id === t.skin_target_id);
            return isTarget ? acc + (ci.price * ci.quantity) : acc;
          }, 0);
          promoSavings += (eligibleTotal * promo.skin_discount_percent) / 100;
        } else if (promo.skin_discount_amount) {
          promoSavings += promo.skin_discount_amount;
        }
        appliedPromotionIds.push(promo.skin_id);
      }
    }

    if (promo.skin_type === 'quantity' && promo.skin_min_quantity > 0) {
      const eligibleItems = cartItems.filter(item => 
        promo.targets.length === 0 || promo.targets.some(t => 
          !t.skin_is_exclusion && (t.skin_target_type === 'product' ? item.id === t.skin_target_id : item.category_id === t.skin_target_id)
        )
      );
      const totalQty = eligibleItems.reduce((acc, i) => acc + i.quantity, 0);
      
      if (totalQty >= promo.skin_min_quantity) {
        if (promo.skin_discount_percent) {
          const eligibleTotal = eligibleItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
          promoSavings += (eligibleTotal * promo.skin_discount_percent) / 100;
        } else if (promo.skin_discount_amount) {
          promoSavings += promo.skin_discount_amount;
        }
        appliedPromotionIds.push(promo.skin_id);
      }
    }
    // Accumulate results
    savings += promoSavings;
    freeItems = [...freeItems, ...promoFreeItems];
  }

  return { 
    savings, 
    freeItems, 
    appliedPromotionIds 
  };
};

export const getEligibleProductsForPromotion = async (promotionId: string) => {
  const supabase = createClient();
  
  // 1. Fetch promotion and its targets
  const { data: promo } = await supabase
    .from('skin_promotions')
    .select('*, targets:skin_promotion_targets(*)')
    .eq('skin_id', promotionId)
    .single();

  if (!promo) return [];

  const targets = promo.targets || [];
  
  // 2. Build Query
  let query = supabase.from('skin_products').select('*');

  if (targets.length === 0) {
    // Storewide
    const { data } = await query;
    return data || [];
  }

  // Handle inclusions
  // Handle inclusions and exclusions with defensive checks
  const targetList = Array.isArray(targets) ? targets : [];
  
  const inclusions = targetList.filter(t => t && !t.skin_is_exclusion);
  const exclusions = targetList.filter(t => t && t.skin_is_exclusion);

  const inclusionProductIds = inclusions
    .filter(t => t.skin_target_type === 'product' && t.skin_target_id)
    .map(t => t.skin_target_id);
    
  const inclusionCategoryIds = inclusions
    .filter(t => t.skin_target_type === 'category' && t.skin_target_id)
    .map(t => t.skin_target_id);

  const exclusionProductIds = exclusions
    .filter(t => t.skin_target_type === 'product' && t.skin_target_id)
    .map(t => t.skin_target_id);
    
  const exclusionCategoryIds = exclusions
    .filter(t => t.skin_target_type === 'category' && t.skin_target_id)
    .map(t => t.skin_target_id);

  // 3. Build optimized query with DB-level filtering
  let baseQuery = supabase.from('skin_products').select('*');

  // Handle inclusions
  if (inclusions.length > 0) {
    const filters = [];
    if (inclusionProductIds.length > 0) filters.push(`skin_id.in.(${inclusionProductIds.join(',')})`);
    if (inclusionCategoryIds.length > 0) filters.push(`skin_category_id.in.(${inclusionCategoryIds.join(',')})`);
    
    if (filters.length > 0) {
      baseQuery = baseQuery.or(filters.join(','));
    }
  }

  // Handle exclusions
  if (exclusionProductIds.length > 0) {
    baseQuery = baseQuery.not('skin_id', 'in', `(${exclusionProductIds.join(',')})`);
  }
  if (exclusionCategoryIds.length > 0) {
    baseQuery = baseQuery.not('skin_category_id', 'in', `(${exclusionCategoryIds.join(',')})`);
  }

  const { data: eligibleProducts } = await baseQuery;
  return eligibleProducts || [];
};

export const getPromotionMetadata = (promo: Promotion) => {
  switch (promo.skin_type) {
    case 'bogo':
      return `Buy ${promo.skin_buy_quantity} Get ${promo.skin_get_quantity} FREE`;
    case 'free_gift':
      return 'Free Gift with Purchase';
    case 'cart_value':
      return `Extra Discount on ₹${promo.skin_min_cart_value}+`;
    case 'quantity':
      return `Bulk Discount (${promo.skin_min_quantity}+ items)`;
    case 'combo':
      return 'Special Combo Price';
    default:
      return 'Special Offer';
  }
};
