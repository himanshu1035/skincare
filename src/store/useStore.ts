import { create } from 'zustand';
import { supabase } from '../lib/supabase';

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
  fetchCampaignSettings: () => Promise<void>;
  toggleCart: () => void;
  setBogoActive: (active: boolean) => Promise<void>;
  addToCart: (product: Omit<CartItem, 'quantity' | 'isFree'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  createOrder: (email: string) => Promise<boolean>;
}

export const useStore = create<State>((set, get) => ({
  cart: [],
  isBogoActive: true,
  isCartOpen: false,
  offerExpiresAt: Date.now() + 1000 * 60 * 60 * 2,
  stockLeft: 42,
  
  fetchCampaignSettings: async () => {
    try {
      const { data, error } = await supabase
        .from('skin_campaign_settings')
        .select('*')
        .eq('skin_id', 'bogo_campaign')
        .single();
      
      if (data && !error) {
        set({ 
          isBogoActive: data.skin_is_active,
          offerExpiresAt: data.skin_expires_at ? new Date(data.skin_expires_at).getTime() : get().offerExpiresAt
        });
      }
    } catch (err) {
      console.error('Error fetching campaign settings:', err);
    }
  },

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  
  setBogoActive: async (active) => {
    try {
      const { error } = await supabase
        .from('skin_campaign_settings')
        .update({ skin_is_active: active, skin_updated_at: new Date().toISOString() })
        .eq('skin_id', 'bogo_campaign');
      
      if (!error) {
        set({ isBogoActive: active });
      }
    } catch (err) {
      console.error('Error updating BOGO status:', err);
    }
  },
  
  addToCart: (product) => set((state) => {
    const existingMain = state.cart.find(item => item.id === product.id && !item.isFree);
    
    if (existingMain) {
      return {
        cart: state.cart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
        isCartOpen: true
      };
    }

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
      cart: state.isBogoActive ? [...state.cart, mainItem, freeItem] : [...state.cart, mainItem],
      isCartOpen: true,
      stockLeft: Math.max(0, state.stockLeft - (state.isBogoActive ? 2 : 1))
    };
  }),

  removeFromCart: (id) => set((state) => {
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

  createOrder: async (email) => {
    const state = get();
    const subtotal = state.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    try {
      const { error } = await supabase
        .from('skin_orders')
        .insert({
          skin_customer_email: email,
          skin_total_amount: subtotal,
          skin_items: state.cart,
          skin_created_at: new Date().toISOString()
        });
      
      if (!error) {
        state.clearCart();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creating order:', err);
      return false;
    }
  }
}));
