import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useMemo } from "react";
import { LinearGradient } from "expo-linear-gradient";

import useOnboardingStore from "@jarly/store";
import { colors, fonts } from "../../constants/colors";
import { Steps } from "../../components/steps";
import { formatCurrency } from "../../lib/formatCurrency";
import GoalForm from "../../components/goalForm";

const categories = [
  { name: "Emergency", color: "#FF8B6B" },
  { name: "Travel", color: "#6BB5E8" },
  { name: "Tech", color: "#8B9DC3" },
  { name: "Home", color: "#FFD166" },
  { name: "Car", color: "#9BA8B5" },
  { name: "Education", color: "#A78BDA" },
  { name: "Life", color: "#F0A0BC" },
  { name: "Other", color: "#6BC5A0" },
];

export default function Goal() {
  const router = useRouter();
  const income = useOnboardingStore((s) => s.income);
  const goal = useOnboardingStore((s) => s.goal);
  const setGoal = useOnboardingStore((s) => s.setGoal);
  const setSuggestedGoalsPct = useOnboardingStore(
    (s) => s.setSuggestedGoalsPct,
  );

  const goalsPct = useOnboardingStore((s) => s.goalsPct) || 20;
  const [error, setError] = useState(null);

  const handleSkip = () => {
    router.push("/onboarding/jars");
  };

  const handleContinue = ({ goalName, targetCents, targetDate, category }) => {
    useOnboardingStore.setState({
      goal: {
        goalName,
        targetCents,
        targetDate,
        category,
        suggestedGoalsPct: 20,
      },
      suggestedGoalsPct: 20,
    });
    router.push("/onboarding/jars");
  };

  return (
    <LinearGradient
      colors={["#FFF0E8", "#FFF8F0", "#E8F7F0"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>
            Is there something you're saving up for?
          </Text>
          <Text style={styles.subtitle}>
            Big or small — we'll figure out how much to set aside each month.
          </Text>

          <GoalForm
            onSave={handleContinue}
            prefilledData={{}}
            showHeader={false}
            backgroundColor="transparent"
            noPadding
          />
          <View style={styles.bottomSection}>
            <View style={styles.secondaryRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.push("/onboarding/income")}
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSkip}>
                <Text style={styles.skipText}>Skip for now</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Steps currentStep={3} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 12,
  },
  title: {
    fontFamily: fonts.black,
    fontSize: 32,
    color: colors.textDark,
    lineHeight: 38,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.semi,
    fontSize: 14,
    color: colors.textMid,
    lineHeight: 22,
    marginBottom: 24,
  },

  // Error
  errorMessage: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: "#E05C5C",
    marginTop: 8,
  },

  // Bottom section
  bottomSection: {
    padding: 24,
    paddingBottom: 24,
  },
  secondaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginBottom: 16,
  },
  backButton: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButtonText: {
    fontFamily: fonts.extra,
    fontSize: 14,
    color: colors.textMid,
  },
  skipText: {
    fontFamily: fonts.extra,
    fontSize: 14,
    color: colors.textLight,
  },
});
