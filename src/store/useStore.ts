import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  username?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  landmark?: string;
  city?: string;
  state?: string;
  zip?: string;
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
  utrId?: string;
  createdAt: string;
  userId?: string;
}

interface CampaignSettings {
  codCharge: number;
  prepayDiscount: number;
  deliveryCharge: number;
  payDeliveryFirst: boolean;
  isCodEnabled: boolean;
  upiId: string;
  displayReviewCount: string;
  displayRating: string;
}

interface Review {
  id: string;
  userId?: string;
  userName: string;
  rating: number;
  comment: string;
  isPublic: boolean;
  createdAt: string;
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
  reviews: Review[];
  
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
  
  // Review Actions
  fetchReviews: () => Promise<void>;
  addReview: (review: Partial<Review>) => Promise<void>;
  adminUpdateReview: (id: string, updates: Partial<Review>) => Promise<void>;
  adminDeleteReview: (id: string) => Promise<void>;
  
  // Auth Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkUserExists: (email: string, mobile: string) => Promise<boolean>;
  registerUser: (email: string, mobile: string, password: string, extra?: any) => Promise<string | null>;
  updateUserDetails: (userId: string, updates: Partial<User>) => Promise<void>;
  
  // Order Actions
  createOrder: (orderData: any) => Promise<string | boolean>;
  fetchUserOrders: () => Promise<Order[]>;
  
  // Admin Actions
  fetchAllOrders: () => Promise<Order[]>;
  fetchAllUsers: () => Promise<User[]>;
  updateOrderStatus: (orderId: string, status: string, trackingId?: string) => Promise<void>;
  adminUpdateOrder: (orderId: string, updates: any) => Promise<boolean>;
  deleteOrder: (orderId: string) => Promise<boolean>;
  adminUpdateUser: (userId: string, updates: any) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  submitUtr: (orderId: string, utrId: string) => Promise<boolean>;
}

const DEFAULT_PRODUCT: Product = {
  id: 'cosrx-snail-96',
  name: 'COSRX Advanced Snail 96 Mucin Power Essence',
  price: 25.0,
  originalPrice: 50.0,
  image: 'https://m.media-amazon.com/images/I/51r8A+Y+ZHL._SL1000_.jpg',
  stockCount: 42
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
  cart: [],
  isBogoActive: true,
  isCartOpen: false,
  offerExpiresAt: Date.now() + 1000 * 60 * 60 * 2,
  stockLeft: 42,
  currency: '₹',
  product: null,
  isLoading: true,
  currentUser: null,
  settings: {
    codCharge: 0,
    prepayDiscount: 0,
    deliveryCharge: 0,
    payDeliveryFirst: false,
    isCodEnabled: true,
    upiId: 'admin@upi',
    displayReviewCount: '1,240+',
    displayRating: '4.9'
  },
  reviews: [],
  
  fetchData: async () => {
    try {
      await get().fetchReviews();
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
            payDeliveryFirst: settingsData.skin_pay_delivery_first,
            isCodEnabled: settingsData.skin_cod_enabled ?? true,
            upiId: settingsData.skin_upi_id || 'admin@upi',
            displayReviewCount: settingsData.skin_display_review_count || '1,240+',
            displayRating: settingsData.skin_display_rating || '4.9'
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

  fetchReviews: async () => {
    const user = get().currentUser;
    let query = supabase.from('skin_reviews').select('*');
    
    const { data } = await query.order('skin_created_at', { ascending: false });
    
    const allReviews = (data || []).map(r => ({
      id: r.skin_id,
      userId: r.skin_user_id,
      userName: r.skin_user_name,
      rating: r.skin_rating,
      comment: r.skin_comment,
      isPublic: r.skin_is_public,
      createdAt: r.skin_created_at
    }));

    // Filter: Public reviews OR user's own reviews
    const filtered = allReviews.filter(r => r.isPublic || (user && r.userId === user.id));
    set({ reviews: filtered });
  },

  addReview: async (review) => {
    const user = get().currentUser;
    await supabase.from('skin_reviews').insert({
      skin_user_id: user?.id || null,
      skin_user_name: review.userName,
      skin_rating: review.rating,
      skin_comment: review.comment,
      skin_is_public: !user // Admin-created (no user) are public by default
    });
    get().fetchReviews();
  },

  adminUpdateReview: async (id, updates) => {
    await supabase.from('skin_reviews').update({
      skin_user_name: updates.userName,
      skin_rating: updates.rating,
      skin_comment: updates.comment,
      skin_is_public: updates.isPublic
    }).eq('skin_id', id);
    get().fetchReviews();
  },

  adminDeleteReview: async (id) => {
    await supabase.from('skin_reviews').delete().eq('skin_id', id);
    get().fetchReviews();
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
      skin_pay_delivery_first: updates.payDeliveryFirst ?? settings.payDeliveryFirst,
      skin_cod_enabled: updates.isCodEnabled ?? settings.isCodEnabled,
      skin_upi_id: updates.upiId ?? settings.upiId,
      skin_display_review_count: updates.displayReviewCount ?? settings.displayReviewCount,
      skin_display_rating: updates.displayRating ?? settings.displayRating
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
      set({ currentUser: { 
        id: data.skin_id, 
        email: data.skin_email, 
        mobile: data.skin_mobile,
        firstName: data.skin_first_name,
        lastName: data.skin_last_name,
        address: data.skin_address,
        landmark: data.skin_landmark,
        city: data.skin_city,
        state: data.skin_state,
        zip: data.skin_zip
      } });
      return true;
    }
    return false;
  },

  logout: () => set({ currentUser: null }),
  checkUserExists: async (email, mobile) => {
    const { data } = await supabase.from('skin_users').select('skin_id').or(`skin_email.eq.${email},skin_mobile.eq.${mobile}`).maybeSingle();
    return !!data;
  },

  registerUser: async (email, mobile, password, extra?: any) => {
    try {
      const { data, error } = await supabase.from('skin_users').insert({ 
        skin_id: crypto.randomUUID(),
        skin_email: email, 
        skin_mobile: mobile, 
        skin_password: password,
        skin_username: extra?.username,
        skin_first_name: extra?.firstName,
        skin_last_name: extra?.lastName
      }).select('*').single();
      
      if (error) {
        console.error('Registration Error:', error);
        return null;
      }
      
      const user = { 
        id: data.skin_id, 
        email: data.skin_email, 
        mobile: data.skin_mobile,
        username: data.skin_username,
        firstName: data.skin_first_name,
        lastName: data.skin_last_name
      };
      set({ currentUser: user });
      return data.skin_id;
    } catch (err) {
      console.error('Registration Exception:', err);
      return null;
    }
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
      skin_status: orderData.paymentMethod === 'Prepaid' ? 'Pending Payment' : 'Processing',
      skin_tracking_id: randomTrackingId
    }).select('skin_id').single();

    // Save/Update address to user profile if logged in
    if (!error && (orderData.userId || store.currentUser?.id)) {
      const uid = orderData.userId || store.currentUser?.id;
      await supabase.from('skin_users').update({
        skin_first_name: orderData.firstName,
        skin_last_name: orderData.lastName,
        skin_address: orderData.address,
        skin_landmark: orderData.landmark,
        skin_city: orderData.city,
        skin_state: orderData.state,
        skin_zip: orderData.zip
      }).eq('skin_id', uid);
      
      // Update local state too
      if (store.currentUser && store.currentUser.id === uid) {
        set({ currentUser: { ...store.currentUser, ...orderData } });
      }
    }

    if (!error) { 
      const orderId = (await supabase.from('skin_orders').select('skin_id').eq('skin_customer_email', orderData.email).order('skin_created_at', { ascending: false }).limit(1).single()).data?.skin_id;
      store.clearCart(); 
      return orderId || true; 
    }
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
      utrId: o.skin_utr_id,
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
      utrId: o.skin_utr_id,
      createdAt: o.skin_created_at,
      userId: o.skin_user_id
    }));
  },

  fetchAllUsers: async () => {
    const { data } = await supabase.from('skin_users').select('*').order('skin_created_at', { ascending: false });
    return (data || []).map(u => ({ 
      id: u.skin_id, 
      email: u.skin_email, 
      mobile: u.skin_mobile,
      firstName: u.skin_first_name,
      lastName: u.skin_last_name
    }));
  },

  updateOrderStatus: async (orderId, status, trackingId) => {
    await supabase.from('skin_orders').update({ skin_status: status, skin_tracking_id: trackingId }).eq('skin_id', orderId);
  },

  updateUserDetails: async (userId, updates) => {
    await supabase.from('skin_users').update({
      skin_email: updates.email,
      skin_mobile: updates.mobile,
      skin_first_name: updates.firstName,
      skin_last_name: updates.lastName
    }).eq('skin_id', userId);
  },

  adminUpdateUser: async (userId, updates) => {
    const { error } = await supabase.from('skin_users').update({
      skin_first_name: updates.firstName,
      skin_last_name: updates.lastName,
      skin_email: updates.email,
      skin_mobile: updates.mobile
    }).eq('skin_id', userId);
    return !error;
  },

  deleteUser: async (userId) => {
    const { error } = await supabase.from('skin_users').delete().eq('skin_id', userId);
    return !error;
  },

  adminUpdateOrder: async (orderId, updates) => {
    const { error } = await supabase.from('skin_orders').update({
      skin_customer_first_name: updates.firstName,
      skin_customer_last_name: updates.lastName,
      skin_customer_mobile: updates.customerMobile,
      skin_customer_address: updates.customerAddress,
      skin_customer_city: updates.city,
      skin_customer_state: updates.state,
      skin_customer_zip: updates.zip,
      skin_status: updates.status,
      skin_tracking_id: updates.trackingId
    }).eq('skin_id', orderId);
    return !error;
  },

  deleteOrder: async (orderId) => {
    const { error } = await supabase.from('skin_orders').delete().eq('skin_id', orderId);
    return !error;
  },

  submitUtr: async (orderId, utrId) => {
    const { error } = await supabase.from('skin_orders').update({ skin_utr_id: utrId }).eq('skin_id', orderId);
    return !error;
  }
    }),
    {
      name: 'cosrx-storage',
      partialize: (state: State) => ({ 
        currentUser: state.currentUser, 
        cart: state.cart 
      }),
    }
  )
);
