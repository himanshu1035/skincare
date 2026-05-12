import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
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
        // Optional: clear other state or handle cookie cleanup
      },
    }),
    {
      name: 'skin-auth-storage',
    }
  )
);
