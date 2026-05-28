import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

import useUserStore from "../store/userStore";
import { get, post } from "@jarly/api-client";
import SpendForm from "../components/spendForm";

export default function Spend() {
  const router = useRouter();
  const { budget } = useUserStore();

  const handleSave = async ({ amount, label, jar, goalId }) => {
    try {
      await post("/api/v1/spends", {
        amount: Number(amount) * 100,
        jar,
        goalId: goalId || null,
        label: label || "",
      });

      const { data: spends } = await get("/api/v1/spends/summary");
      const filteredSpends = spends.filter((s) => s.jar === jar);
      const totalSpent = filteredSpends.reduce((sum, s) => sum + s.amountCents, 0) / 100;

      let spendPct = 0;
      switch (jar) {
        case "Needs": spendPct = (totalSpent / (budget.needsAmt / 100)) * 100; break;
        case "Goals": spendPct = (totalSpent / (budget.goalsAmt / 100)) * 100; break;
        case "Fun": spendPct = (totalSpent / (budget.funAmt / 100)) * 100; break;
      }

      let goalMilestone = false;
      let filteredGoal;
      if (goalId) {
        const { data: goals } = await get("/api/v1/goals");
        filteredGoal = goals.find((g) => g.id === goalId);
        goalMilestone = filteredGoal?.savedCents >= filteredGoal?.targetCents;
      }

      if (spendPct >= 80) {
        return Alert.alert("", `Heads up! Your ${jar} Jar is almost full!`,
          [{ text: "OK", onPress: () => router.push("/home") }]);
      } else if (goalMilestone) {
        return Alert.alert("", `Congrats! ${filteredGoal.name} Goal is finished!`,
          [{ text: "OK", onPress: () => router.push("/home") }]);
      }

      router.push("/home");
    } catch (err) {
      console.log({ err });
    }
  };

  return (
    <LinearGradient
      colors={["#FFF0E8", "#FFF8F0", "#E8F7F0"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SpendForm
        onSave={handleSave}
        onClose={() => router.push("/home")}
      />
    </LinearGradient>
  );
}