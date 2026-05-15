import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchActivePromotions, evaluatePromotions } from '@/lib/promotionEngine';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  handle: string;
  category_id?: string;
  is_free?: boolean;
  promotion_id?: string;
}

interface CartStore {
  items: CartItem[];
  promoItems: CartItem[];
  appliedCoupons: any[];
  discountAmount: number;
  promoSavings: number;
  userId: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getGrandTotal: () => number;
  applyCoupon: (coupon: any, amount: number) => void;
  removeCoupon: (code: string) => void;
  revalidateCoupons: (paymentMethod: string) => void;
  refreshPromotions: () => Promise<void>;
  syncUser: (userId: string | null) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      promoItems: [],
      appliedCoupons: [],
      discountAmount: 0,
      promoSavings: 0,
      userId: null,
 
      syncUser: (currentUserId) => {
        const { userId, clearCart } = get();
        // If the stored userId doesn't match the current session, clear everything
        if (userId !== currentUserId) {
          clearCart();
          set({ userId: currentUserId });
        }
      },

      revalidateCoupons: (paymentMethod: string) => {
        const { appliedCoupons, getTotal } = get();
        const subtotal = getTotal();
        let newTotalDiscount = 0;
        
        const validCoupons = appliedCoupons.map(coupon => {
          // Rule 1: Prepaid only check
          if (coupon.skin_is_prepaid_only && paymentMethod !== 'UPI') {
            return null;
          }
          // Rule 2: Min order amount check
          if (subtotal < coupon.skin_min_order_amount) {
            return null;
          }

          let discount = 0;
          if (coupon.skin_type === 'percentage' || coupon.skin_type === 'percent') {
            // ALWAYS calculated on original subtotal
            discount = (subtotal * coupon.skin_value) / 100;
            if (coupon.skin_max_discount_amount) {
              discount = Math.min(discount, coupon.skin_max_discount_amount);
            }
          } else if (coupon.skin_type === 'fixed') {
            discount = Math.min(coupon.skin_value, subtotal);
          }

          newTotalDiscount += discount;
          return { ...coupon, calculated_discount: discount };
        }).filter(Boolean);

        set({ 
          appliedCoupons: validCoupons, 
          discountAmount: newTotalDiscount 
        });
      },
      
      refreshPromotions: async () => {
        const { items } = get();
        if (items.length === 0) {
          set({ promoItems: [], promoSavings: 0 });
          return;
        }

        const promotions = await fetchActivePromotions();
        const { savings, freeItems } = evaluatePromotions(items, promotions);
        
        set({ promoSavings: savings, promoItems: freeItems as CartItem[] });
      },

      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          let newItems;
          if (existingItem) {
            newItems = state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            );
          } else {
            newItems = [...state.items, item];
          }
          return { items: newItems };
        });
        get().refreshPromotions();
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
        get().refreshPromotions();
      },

      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
          ),
        }));
        get().refreshPromotions();
      },

      clearCart: () => set({ items: [], promoItems: [], appliedCoupons: [], discountAmount: 0, promoSavings: 0 }),
      
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getGrandTotal: () => {
        const subtotal = get().getTotal();
        return Math.max(0, subtotal - get().discountAmount - get().promoSavings);
      },

      applyCoupon: (coupon, amount) => {
        const { appliedCoupons, discountAmount } = get();
        if (appliedCoupons.find(c => c.skin_code === coupon.skin_code)) return;
        
        set({ 
          appliedCoupons: [...appliedCoupons, coupon], 
          discountAmount: discountAmount + amount 
        });
      },
      
      removeCoupon: (code) => {
        const { appliedCoupons } = get();
        const couponToRemove = appliedCoupons.find(c => c.skin_code === code);
        if (!couponToRemove) return;

        // Recalculate discount after removal (this is simplified, in a complex system we'd re-apply all)
        // For now, we'll just subtract the amount that was added for this specific coupon
        // Note: A more robust way is to re-evaluate all coupons against the subtotal
        set((state) => {
            const newCoupons = state.appliedCoupons.filter(c => c.skin_code !== code);
            // Re-calculating total discount from scratch for accuracy
            const subtotal = get().getTotal();
            let newTotalDiscount = 0;
            newCoupons.forEach(c => {
               if (c.skin_type === 'percent' || c.skin_type === 'percentage' || c.skin_discount_percent) {
                  const val = c.skin_discount_percent || c.skin_value;
                  newTotalDiscount += (subtotal * val) / 100;
               }
               else newTotalDiscount += c.skin_value || c.skin_discount_amount || 0;
            });

            return {
                appliedCoupons: newCoupons,
                discountAmount: newTotalDiscount
            };
        });
      },
    }),
    {
      name: 'skin-cart-storage',
      // Ensure we re-run promotions on hydration
      onRehydrateStorage: () => (state) => {
        state?.refreshPromotions();
      }
    }
  )
);
