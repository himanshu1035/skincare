import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  handle: string;
}

interface CartStore {
  items: CartItem[];
  appliedCoupon: any | null;
  discountAmount: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  applyCoupon: (coupon: any, amount: number) => void;
  removeCoupon: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      discountAmount: 0,
      addItem: (item) => set((state) => {
        const existingItem = state.items.find((i) => i.id === item.id);
        if (existingItem) {
          return {
            items: state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          };
        }
        return { items: [...state.items, item] };
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      })),
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((i) =>
          i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
        ),
      })),
      clearCart: () => set({ items: [], appliedCoupon: null, discountAmount: 0 }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      applyCoupon: (coupon, amount) => set({ appliedCoupon: coupon, discountAmount: amount }),
      removeCoupon: () => set({ appliedCoupon: null, discountAmount: 0 }),
    }),
    {
      name: 'skin-cart-storage',
    }
  )
);
