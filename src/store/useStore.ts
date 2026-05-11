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
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  createdAt?: string;
  password?: string;
}

export interface Address {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  address: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  mobile: string;
  alternateMobile?: string;
  isDefault: boolean;
}

interface Order {
  id: string;
  customerEmail: string;
  customerMobile: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  paymentMethod: string;
  totalAmount: number;
  items: CartItem[];
  status: string;
  trackingId?: string;
  utrId?: string;
  createdAt: string;
  userId?: string;
  alternateMobile?: string;
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
  updateUserDetails: (userId: string, updates: Partial<User>) => Promise<boolean>;
  
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
  
  // Address Actions
  addresses: Address[];
  fetchAddresses: () => Promise<void>;
  addAddress: (address: Omit<Address, 'id' | 'userId'>) => Promise<boolean>;
  updateAddress: (id: string, updates: Partial<Address>) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
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
  addresses: [],
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
        addressLine2: data.skin_address_line2,
        city: data.skin_city,
        state: data.skin_state,
        zip: data.skin_zip,
        country: data.skin_country
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
      skin_alternate_mobile: orderData.alternateMobile,
      skin_first_name: orderData.firstName,
      skin_last_name: orderData.lastName,
      skin_customer_address: orderData.address,
      skin_address_line2: orderData.addressLine2,
      skin_customer_city: orderData.city,
      skin_customer_state: orderData.state,
      skin_customer_zip: orderData.zip,
      skin_country: orderData.country || 'India',
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
        skin_address_line2: orderData.addressLine2,
        skin_city: orderData.city,
        skin_state: orderData.state,
        skin_zip: orderData.zip,
        skin_country: orderData.country || 'India'
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
      alternateMobile: o.skin_alternate_mobile,
      firstName: o.skin_first_name,
      lastName: o.skin_last_name,
      address: o.skin_customer_address,
      addressLine2: o.skin_address_line2,
      city: o.skin_customer_city,
      state: o.skin_customer_state,
      zip: o.skin_customer_zip,
      country: o.skin_country,
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
      alternateMobile: o.skin_alternate_mobile,
      firstName: o.skin_first_name,
      lastName: o.skin_last_name,
      address: o.skin_customer_address,
      addressLine2: o.skin_address_line2,
      city: o.skin_customer_city,
      state: o.skin_customer_state,
      zip: o.skin_customer_zip,
      country: o.skin_country,
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
      lastName: u.skin_last_name,
      address: u.skin_address,
      addressLine2: u.skin_address_line2,
      city: u.skin_city,
      state: u.skin_state,
      zip: u.skin_zip,
      country: u.skin_country,
      createdAt: u.skin_created_at,
      password: u.skin_password
    }));
  },

  updateOrderStatus: async (orderId, status, trackingId) => {
    await supabase.from('skin_orders').update({ skin_status: status, skin_tracking_id: trackingId }).eq('skin_id', orderId);
  },

  updateUserDetails: async (userId, updates) => {
    const { error } = await supabase.from('skin_users').update({
      skin_email: updates.email,
      skin_mobile: updates.mobile,
      skin_first_name: updates.firstName,
      skin_last_name: updates.lastName,
      skin_password: updates.password
    }).eq('skin_id', userId);
    return !error;
  },

  adminUpdateUser: async (userId, updates) => {
    const { error } = await supabase.from('skin_users').update({
      skin_first_name: updates.firstName,
      skin_last_name: updates.lastName,
      skin_email: updates.email,
      skin_mobile: updates.mobile,
      skin_address: updates.address,
      skin_password: updates.password
    }).eq('skin_id', userId);
    return !error;
  },

  deleteUser: async (userId) => {
    const { error } = await supabase.from('skin_users').delete().eq('skin_id', userId);
    return !error;
  },

  adminUpdateOrder: async (orderId, updates) => {
    const { error } = await supabase.from('skin_orders').update({
      skin_first_name: updates.firstName,
      skin_last_name: updates.lastName,
      skin_customer_mobile: updates.customerMobile,
      skin_alternate_mobile: updates.alternateMobile,
      skin_customer_address: updates.address,
      skin_address_line2: updates.addressLine2,
      skin_customer_city: updates.city,
      skin_customer_state: updates.state,
      skin_customer_zip: updates.zip,
      skin_country: updates.country,
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
  },

  fetchAddresses: async () => {
    const userId = get().currentUser?.id;
    if (!userId) return;
    const { data } = await supabase.from('skin_addresses').select('*').eq('skin_user_id', userId).order('skin_is_default', { ascending: false });
    set({ addresses: (data || []).map(a => ({
      id: a.skin_id,
      userId: a.skin_user_id,
      firstName: a.skin_first_name,
      lastName: a.skin_last_name,
      address: a.skin_address,
      addressLine2: a.skin_address_line2,
      city: a.skin_city,
      state: a.skin_state,
      zip: a.skin_zip,
      country: a.skin_country,
      mobile: a.skin_mobile,
      alternateMobile: a.skin_alternate_mobile,
      isDefault: a.skin_is_default
    })) });
  },

  addAddress: async (address) => {
    const userId = get().currentUser?.id;
    if (!userId) return false;
    const { error } = await supabase.from('skin_addresses').insert({
      skin_user_id: userId,
      skin_first_name: address.firstName,
      skin_last_name: address.lastName,
      skin_address: address.address,
      skin_address_line2: address.addressLine2,
      skin_city: address.city,
      skin_state: address.state,
      skin_zip: address.zip,
      skin_country: address.country || 'India',
      skin_mobile: address.mobile,
      skin_alternate_mobile: address.alternateMobile,
      skin_is_default: address.isDefault
    });
    if (!error) await get().fetchAddresses();
    return !error;
  },

  updateAddress: async (id, updates) => {
    const { error } = await supabase.from('skin_addresses').update({
      skin_first_name: updates.firstName,
      skin_last_name: updates.lastName,
      skin_address: updates.address,
      skin_address_line2: updates.addressLine2,
      skin_city: updates.city,
      skin_state: updates.state,
      skin_zip: updates.zip,
      skin_country: updates.country,
      skin_mobile: updates.mobile,
      skin_alternate_mobile: updates.alternateMobile,
      skin_is_default: updates.isDefault
    }).eq('skin_id', id);
    if (!error) await get().fetchAddresses();
    return !error;
  },

  deleteAddress: async (id) => {
    const { error } = await supabase.from('skin_addresses').delete().eq('skin_id', id);
    if (!error) await get().fetchAddresses();
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
