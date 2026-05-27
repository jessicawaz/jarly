import { create } from "zustand";

const baseStore = {
  income: 0,
  goal: {
    goalName: "",
    targetAmount: 0,
    targetDate: "",
    selectedCategory: null,
    suggestedGoalsPct: 20,
  },
  needsPct: 50,
  goalsPct: 20,
  funPct: 30,
  needsAmt: 0,
  goalsAmt: 0,
  funAmt: 0,
};

const useOnboardingStore = create((set) => ({
  ...baseStore,

  setIncome: (income) => set({ income }),
  setGoal: (goal) => set({ goal }),
  setSuggestedGoalsPct: (pct) => set({ suggestedGoalsPct: pct }),
  setSplitPct: (needsPct, goalsPct, funPct) =>
    set({ needsPct, goalsPct, funPct }),
  setSplitAmt: (needsAmt, goalsAmt, funAmt) =>
    set({ needsAmt, goalsAmt, funAmt }),
  reset: () => set(baseStore),
}));

export default useOnboardingStore;
