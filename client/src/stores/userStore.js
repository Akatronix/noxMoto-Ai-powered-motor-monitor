import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      // State
      user: null,
      accessToken: null,

      // Actions
      setAuth: (userData, accessToken) => {
        set({ user: userData, accessToken: accessToken });
      },

      setNewAuth: (userData) => {
        set({ user: userData });
      },

      logout: () => {
        set({ user: null, accessToken: null });
      },

      setAccessToken: (newToken) => {
        set({ accessToken: newToken });
      },
    }),
    {
      name: "auth-storage", // Name of the item in localStorage
      storage: createJSONStorage(() => localStorage), // Use localStorage
      // Optional: Only persist these parts of the state
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    },
  ),
);

export { useAuthStore };
