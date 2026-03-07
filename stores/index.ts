// src/stores/index.ts

import { AuthUser } from "../lib/api/types";
import { create } from "zustand";
import { tokenStorage } from "../lib/api/api-client";

// Re-export message store
export { useMessageStore } from "./message.store";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: () => {
    tokenStorage.clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  hasRole: (role) => {
    return get().user?.role === role;
  },
}));
