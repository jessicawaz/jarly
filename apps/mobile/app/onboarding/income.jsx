import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

import useOnboardingStore from "@jarly/store";
import { colors, fonts } from "../../constants/colors";
import { Steps } from "../../components/steps";
import { LinearGradient } from "expo-linear-gradient";

export default function Income() {
  const router = useRouter();
  const income = useOnboardingStore((s) => s.income);
  const setIncome = useOnboardingStore((s) => s.setIncome);
  const [amount, setAmount] = useState(income);
  const [error, setError] = useState(null);

  const validateIncome = (incomeAmount) => {
    const num = parseInt(incomeAmount, 10);
    if (!incomeAmount || isNaN(num)) {
      return "Enter your monthly income to continue.";
    }

    if (num < 0) {
      return "Monthly income must be more than $0.";
    }

    if (num > 9999999) {
      return "That's a lot! Enter a number under $9,999,999.";
    }

    return null;
  };

  const onContinue = (incomeAmount) => {
    const err = validateIncome(incomeAmount);
    if (err) {
      setError(err);
      return;
    }

    setIncome(incomeAmount);

    router.push({
      pathname: "/onboarding/goal",
    });
  };

  return (
    <LinearGradient
      colors={["#FFF0E8", "#FFF8F0", "#E8F7F0"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>How much do you make each month?</Text>
        <Text style={styles.subtitle}>
          We'll use this to figure out how much goes in each jar.
        </Text>

        <View style={styles.inputCard}>
          <Text style={styles.label}>MY MONTHLY INCOME</Text>
          <View style={styles.inputRow}>
            <Text style={styles.dollar}>$</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={amount ? String(amount) : amount}
              onChangeText={setAmount}
              placeholder="0"
            />
          </View>
        </View>

        <View style={styles.hintCard}>
          <Text style={styles.hintCardText}>
            Not sure? Use your best guess - you can always change it later.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => onContinue(Number(amount))}
        >
          <Text style={styles.buttonText}>Continue →</Text>
        </TouchableOpacity>

        {error && <Text style={styles.errorMessage}>{error}</Text>}
      </View>

      <Steps currentStep={2} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 32,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 32,
    color: colors.textDark,
    marginBottom: 8,
    marginTop: 36,
    fontWeight: "800",
  },
  subtitle: {
    marginBottom: 24,
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.textMid,
    lineHeight: 25,
  },
  inputCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 28,
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textLight,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  dollar: { fontSize: 30, color: colors.textMid },
  input: { fontSize: 52, color: colors.textDark, flex: 1 },
  button: {
    backgroundColor: colors.needs,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  buttonText: { color: colors.white, fontSize: 17, fontWeight: "800" },
  hintCard: {
    backgroundColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  hintCardText: {
    fontFamily: fonts.display,
    color: colors.textDark,
  },
  errorMessage: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: 700,
    color: "#e05c5c",
    marginTop: 8,
  },
});
