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

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  stockCount: number;
}

interface User {
  id: string;
  email: string;
  mobile: string;
}

interface Order {
  id: string;
  customerEmail: string;
  customerMobile: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  landmark?: string;
  city?: string;
  state?: string;
  zip?: string;
  paymentMethod: string;
  totalAmount: number;
  items: CartItem[];
  status: string;
  trackingId?: string;
  createdAt: string;
  userId?: string;
}

interface CampaignSettings {
  codCharge: number;
  prepayDiscount: number;
  deliveryCharge: number;
  payDeliveryFirst: boolean;
}

interface State {
  cart: CartItem[];
  isBogoActive: boolean;
  isCartOpen: boolean;
  offerExpiresAt: number;
  stockLeft: number;
  currency: string;
  product: Product | null;
  isLoading: boolean;
  currentUser: User | null;
  settings: CampaignSettings;
  
  // Actions
  fetchData: () => Promise<void>;
  toggleCart: () => void;
  setBogoActive: (active: boolean) => Promise<void>;
  updateCurrency: (currency: string) => Promise<void>;
  updateProduct: (updates: Partial<Product>) => Promise<boolean>;
  updateSettings: (updates: Partial<CampaignSettings>) => Promise<boolean>;
  addToCart: (product: Omit<CartItem, 'quantity' | 'isFree'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  
  // Auth Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkUserExists: (email: string, mobile: string) => Promise<boolean>;
  registerUser: (email: string, mobile: string, password: string) => Promise<string | null>;
  
  // Order Actions
  createOrder: (orderData: any) => Promise<boolean>;
  fetchUserOrders: () => Promise<Order[]>;
  
  // Admin Actions
  fetchAllOrders: () => Promise<Order[]>;
  fetchAllUsers: () => Promise<User[]>;
  updateOrderStatus: (orderId: string, status: string, trackingId?: string) => Promise<void>;
  updateUserDetails: (userId: string, updates: Partial<User>) => Promise<void>;
}

const DEFAULT_PRODUCT: Product = {
  id: 'cosrx-snail-96',
  name: 'COSRX Advanced Snail 96 Mucin Power Essence',
  price: 25.0,
  originalPrice: 50.0,
  image: '/assets/product.png',
  stockCount: 42
};

export const useStore = create<State>((set, get) => ({
  cart: [],
  isBogoActive: true,
  isCartOpen: false,
  offerExpiresAt: Date.now() + 1000 * 60 * 60 * 2,
  stockLeft: 42,
  currency: '$',
  product: null,
  isLoading: true,
  currentUser: null,
  settings: {
    codCharge: 0,
    prepayDiscount: 0,
    deliveryCharge: 0,
    payDeliveryFirst: false
  },
  
  fetchData: async () => {
    try {
      const { data: settingsData } = await supabase.from('skin_campaign_settings').select('*').eq('skin_id', 'bogo_campaign').single();
      const { data: products } = await supabase.from('skin_products').select('*').limit(1).maybeSingle();

      if (settingsData) {
        set({ 
          isBogoActive: settingsData.skin_is_active,
          currency: settingsData.skin_currency,
          settings: {
            codCharge: Number(settingsData.skin_cod_charge),
            prepayDiscount: Number(settingsData.skin_prepay_discount),
            deliveryCharge: Number(settingsData.skin_delivery_charge),
            payDeliveryFirst: settingsData.skin_pay_delivery_first
          }
        });
      }

      if (products) {
        set({
          product: {
            id: products.skin_id,
            name: products.skin_name,
            price: Number(products.skin_price),
            originalPrice: Number(products.skin_original_price),
            image: products.skin_image_url,
            stockCount: products.skin_stock_count
          }
        });
      } else {
        set({ product: DEFAULT_PRODUCT });
      }
    } catch (err) {
      set({ product: DEFAULT_PRODUCT });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  
  setBogoActive: async (active) => {
    await supabase.from('skin_campaign_settings').upsert({ skin_id: 'bogo_campaign', skin_is_active: active });
    set({ isBogoActive: active });
  },

  updateCurrency: async (currency) => {
    await supabase.from('skin_campaign_settings').upsert({ skin_id: 'bogo_campaign', skin_currency: currency });
    set({ currency });
  },

  updateProduct: async (updates) => {
    const product = get().product;
    if (!product) return false;
    const { error } = await supabase.from('skin_products').upsert({
      skin_id: product.id,
      skin_name: updates.name ?? product.name,
      skin_price: updates.price ?? product.price,
      skin_original_price: updates.originalPrice ?? product.originalPrice,
      skin_stock_count: updates.stockCount ?? product.stockCount,
      skin_image_url: product.image
    });
    if (!error) {
      set({ product: { ...product, ...updates } });
      return true;
    }
    return false;
  },

  updateSettings: async (updates) => {
    const settings = get().settings;
    const { error } = await supabase.from('skin_campaign_settings').upsert({
      skin_id: 'bogo_campaign',
      skin_cod_charge: updates.codCharge ?? settings.codCharge,
      skin_prepay_discount: updates.prepayDiscount ?? settings.prepayDiscount,
      skin_delivery_charge: updates.deliveryCharge ?? settings.deliveryCharge,
      skin_pay_delivery_first: updates.payDeliveryFirst ?? settings.payDeliveryFirst
    });
    if (!error) {
      set({ settings: { ...settings, ...updates } });
      return true;
    }
    return false;
  },
  
  addToCart: (product) => set((state) => {
    const existingMain = state.cart.find(item => item.id === product.id && !item.isFree);
    if (existingMain) {
      return { cart: state.cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item), isCartOpen: true };
    }
    const mainItem: CartItem = { ...product, quantity: 1 };
    const freeItem: CartItem = { ...product, id: `${product.id}-free`, name: `${product.name} (FREE GIFT)`, price: 0, quantity: 1, isFree: true };
    return { cart: state.isBogoActive ? [...state.cart, mainItem, freeItem] : [...state.cart, mainItem], isCartOpen: true };
  }),

  removeFromCart: (id) => set((state) => ({ cart: state.cart.filter(item => !item.id.startsWith(id.replace('-free', ''))) })),
  updateQuantity: (id, delta) => set((state) => ({ cart: state.cart.map(item => item.id.startsWith(id.replace('-free', '')) ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item) })),
  clearCart: () => set({ cart: [] }),

  login: async (email, password) => {
    const { data } = await supabase.from('skin_users').select('*').eq('skin_email', email).eq('skin_password', password).maybeSingle();
    if (data) {
      set({ currentUser: { id: data.skin_id, email: data.skin_email, mobile: data.skin_mobile } });
      return true;
    }
    return false;
  },

  logout: () => set({ currentUser: null }),
  checkUserExists: async (email, mobile) => {
    const { data } = await supabase.from('skin_users').select('skin_id').or(`skin_email.eq.${email},skin_mobile.eq.${mobile}`).maybeSingle();
    return !!data;
  },

  registerUser: async (email, mobile, password) => {
    const { data, error } = await supabase.from('skin_users').insert({ skin_email: email, skin_mobile: mobile, skin_password: password }).select('*').single();
    if (error) return null;
    set({ currentUser: { id: data.skin_id, email: data.skin_email, mobile: data.skin_mobile } });
    return data.skin_id;
  },

  createOrder: async (orderData) => {
    const store = get();
    const randomTrackingId = `TRK-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    
    const { error } = await supabase.from('skin_orders').insert({
      skin_customer_email: orderData.email,
      skin_customer_mobile: orderData.mobile,
      skin_first_name: orderData.firstName,
      skin_last_name: orderData.lastName,
      skin_customer_address: orderData.address,
      skin_landmark: orderData.landmark,
      skin_customer_city: orderData.city,
      skin_customer_state: orderData.state,
      skin_customer_zip: orderData.zip,
      skin_payment_method: orderData.paymentMethod,
      skin_total_amount: orderData.totalAmount,
      skin_items: store.cart,
      skin_user_id: orderData.userId || store.currentUser?.id || null,
      skin_tracking_id: randomTrackingId
    });
    if (!error) { store.clearCart(); return true; }
    return false;
  },

  fetchUserOrders: async () => {
    const user = get().currentUser;
    if (!user) return [];
    const { data } = await supabase.from('skin_orders').select('*').eq('skin_user_id', user.id).order('skin_created_at', { ascending: false });
    return (data || []).map(o => ({
      id: o.skin_id,
      customerEmail: o.skin_customer_email,
      customerMobile: o.skin_customer_mobile,
      firstName: o.skin_first_name,
      lastName: o.skin_last_name,
      address: o.skin_customer_address,
      landmark: o.skin_landmark,
      city: o.skin_customer_city,
      state: o.skin_customer_state,
      zip: o.skin_customer_zip,
      paymentMethod: o.skin_payment_method,
      totalAmount: o.skin_total_amount,
      items: o.skin_items,
      status: o.skin_status,
      trackingId: o.skin_tracking_id,
      createdAt: o.skin_created_at
    }));
  },

  fetchAllOrders: async () => {
    const { data } = await supabase.from('skin_orders').select('*').order('skin_created_at', { ascending: false });
    return (data || []).map(o => ({
      id: o.skin_id,
      customerEmail: o.skin_customer_email,
      customerMobile: o.skin_customer_mobile,
      firstName: o.skin_first_name,
      lastName: o.skin_last_name,
      address: o.skin_customer_address,
      landmark: o.skin_landmark,
      city: o.skin_customer_city,
      state: o.skin_customer_state,
      zip: o.skin_customer_zip,
      paymentMethod: o.skin_payment_method,
      totalAmount: o.skin_total_amount,
      items: o.skin_items,
      status: o.skin_status,
      trackingId: o.skin_tracking_id,
      createdAt: o.skin_created_at,
      userId: o.skin_user_id
    }));
  },

  fetchAllUsers: async () => {
    const { data } = await supabase.from('skin_users').select('*').order('skin_created_at', { ascending: false });
    return (data || []).map(u => ({ id: u.skin_id, email: u.skin_email, mobile: u.skin_mobile }));
  },

  updateOrderStatus: async (orderId, status, trackingId) => {
    await supabase.from('skin_orders').update({ skin_status: status, skin_tracking_id: trackingId }).eq('skin_id', orderId);
  },

  updateUserDetails: async (userId, updates) => {
    await supabase.from('skin_users').update({
      skin_email: updates.email,
      skin_mobile: updates.mobile
    }).eq('skin_id', userId);
  }
}));
