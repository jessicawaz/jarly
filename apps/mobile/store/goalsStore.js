import { create } from "zustand";
import { get } from "@jarly/api-client";

const useGoalsStore = create((set) => ({
  goals: [],
  isLoading: true,
  error: null,

  fetchGoals: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await get("/api/v1/goals");
      set({ goals: data, isLoading: false });
    } catch (e) {
      console.error("FETCH GOALS ERROR:", e.message);
      set({ goals: null, isLoading: false, error: e.message });
    }
  },

  clearGoals: () => set({ goals: null, isLoading: false, error: null }),
}));

export default useGoalsStore;
