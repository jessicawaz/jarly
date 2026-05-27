import { create } from "zustand";
import { router } from "expo-router";

import { get } from "@jarly/api-client";
import { signOut } from "@jarly/api-client/auth";

const useUserStore = create((set) => ({
  user: null,
  isLoading: true,
  error: null,

  fetchUser: async () => {
    try {
      set({ isLoading: true });

      const data = await get("/api/v1/users/me");

      if (!data) {
        console.log("1243123412");
        await signOut();
        router.replace("/onboarding/welcome");
      }

      set({ user: data.user, budget: data.budget, isLoading: false });
    } catch (e) {
      set({ user: null, isLoading: false, error: null });
      await signOut();
      router.replace("/onboarding/welcome");
    }
  },

  clearUser: () => set({ user: null, isLoading: false, error: null }),
}));

export default useUserStore;
