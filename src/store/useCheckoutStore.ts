import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CheckoutData {
  email: string;
  firstName: string;
  lastName: string;
  primaryPhone: string;
  alternatePhone: string;
  street: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  password?: string;
}

interface CheckoutStore {
  data: Partial<CheckoutData>;
  setData: (data: Partial<CheckoutData>) => void;
  clearData: () => void;
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set) => ({
      data: {},
      setData: (newData) => set((state) => ({ 
        data: { ...state.data, ...newData } 
      })),
      clearData: () => set({ data: {} }),
    }),
    {
      name: 'skin-checkout-storage',
    }
  )
);
