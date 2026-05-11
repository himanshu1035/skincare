import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string;
  isFree?: boolean;
}

interface State {
  cart: CartItem[];
  isBogoActive: boolean;
  isCartOpen: boolean;
  offerExpiresAt: number;
  stockLeft: number;
  
  // Actions
  toggleCart: () => void;
  setBogoActive: (active: boolean) => void;
  addToCart: (product: Omit<CartItem, 'quantity' | 'isFree'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
}

export const useStore = create<State>((set) => ({
  cart: [],
  isBogoActive: true,
  isCartOpen: false,
  offerExpiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
  stockLeft: 42,
  
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  
  setBogoActive: (active) => set({ isBogoActive: active }),
  
  addToCart: (product) => set((state) => {
    const existingMain = state.cart.find(item => item.id === product.id && !item.isFree);
    
    if (existingMain) {
      // Sync quantity for both main and free
      return {
        cart: state.cart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
        isCartOpen: true
      };
    }

    // Add new pair
    const mainItem: CartItem = { ...product, quantity: 1 };
    const freeItem: CartItem = { 
      ...product, 
      id: `${product.id}-free`, 
      name: `${product.name} (FREE GIFT)`,
      price: 0, 
      quantity: 1, 
      isFree: true 
    };

    return { 
      cart: [...state.cart, mainItem, freeItem],
      isCartOpen: true,
      stockLeft: Math.max(0, state.stockLeft - 2)
    };
  }),

  removeFromCart: (id) => set((state) => {
    // If we remove the main item, remove the free one too
    const baseId = id.replace('-free', '');
    return {
      cart: state.cart.filter(item => !item.id.startsWith(baseId))
    };
  }),

  updateQuantity: (id, delta) => set((state) => {
    const baseId = id.replace('-free', '');
    const newCart = state.cart.map(item => {
      if (item.id.startsWith(baseId)) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    return { cart: newCart };
  }),

  clearCart: () => set({ cart: [] }),
}));
