import { create } from "zustand";
import { get } from "@jarly/api-client";

const useSpendsStore = create((set) => ({
  spends: [],
  isLoading: true,
  error: null,

  fetchSpends: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await get("/api/v1/spends/summary");
      set({ spends: data, isLoading: false });
    } catch (e) {
      console.log(e)
      console.error("FETCH SPENDS ERROR:", e.message);
      set({ spends: null, isLoading: false, error: e.message });
    }
  },

  clearSpends: () => set({ spends: null, isLoading: false, error: null }),
}));

export default useSpendsStore;
