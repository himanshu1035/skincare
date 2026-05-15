import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
}

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null, 
      setUser: (user) => set({ user }),
      logout: () => {
        set({ user: null });
        // NEW: Also clear cart on logout
        import('@/store/useCartStore').then(mod => {
          mod.useCartStore.getState().clearCart();
          mod.useCartStore.getState().syncUser(null);
        });
      },
    }),
    {
      name: 'skin-auth-storage',
    }
  )
);
