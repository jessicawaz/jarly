import { create } from "zustand";
import { get } from "@jarly/api-client";

const useUserStore = create((set) => ({
  user: null,
  isLoading: true,
  error: null,

  fetchUser: async () => {
    try {
      set({ isLoading: true });

      const data = await get("/api/v1/users/me");

      set({ user: data.user, budget: data.budget, isLoading: false });
    } catch (e) {
      console.log("FETCH USER ERROR:", e.message);
      set({ user: null, isLoading: false, error: e.message });
    }
  },

  clearUser: () => set({ user: null, isLoading: false, error: null }),
}));

export default useUserStore;
