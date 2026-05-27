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
  const goalsAmount = Math.round((goalsPct / 100) * income);

  const [selectedCategory, setSelectedCategory] = useState(
    goal.selectedCategory ?? null,
  );
  const [goalName, setGoalName] = useState(goal.goalName);
  const [targetAmount, setTargetAmount] = useState(
    goal ? String(goal.targetAmount) : 0,
  );
  const [targetDate, setTargetDate] = useState(goal.targetDate);
  const [error, setError] = useState(null);

  const calc = useMemo(() => {
    const amount = Number(targetAmount);
    if (!amount || !targetDate || !income) {
      return null;
    }

    const [targetYear, targetMonth] = targetDate.split("-").map(Number);
    if (!targetYear || !targetMonth) {
      return null;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const months =
      (targetYear - currentYear) * 12 + (targetMonth - currentMonth);

    if (months <= 0) {
      return null;
    }

    const monthlyNeeded = Math.ceil(amount / months);
    const pctOfGoalsJar =
      goalsAmount > 0 ? Math.round((monthlyNeeded / goalsAmount) * 100) : 0;
    const suggestedGoalsPct = Math.min(
      60,
      Math.max(10, Math.round((monthlyNeeded / income) * 100)),
    );

    return { monthlyNeeded, months, pctOfGoalsJar, suggestedGoalsPct };
  }, [targetAmount, targetDate, income, goalsAmount]);

  const handleContinue = () => {
    useOnboardingStore.setState({
      goal: {
        goalName,
        targetAmount,
        targetDate,
        selectedCategory,
        suggestedGoalsPct: calc?.suggestedGoalsPct ?? 20,
      },
      suggestedGoalsPct: calc?.suggestedGoalsPct ?? 20,
    });

    router.push("/onboarding/jars");
  };

  const handleSkip = () => {
    router.push("/onboarding/jars");
  };

  // Format month display
  const formatMonth = (dateStr) => {
    if (!dateStr || dateStr.length < 7) {
      return null;
    }
    const [y, m] = dateStr.split("-");
    const monthNum = parseInt(m);
    if (!y || !m || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return null;
    }

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[monthNum - 1]} '${y.slice(2)}`;
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

          {/* Category picker */}
          <View style={styles.categoriesWrapper}>
            {categories.map((cat, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedCategory(cat.name)}
                style={[
                  styles.categoryChip,
                  selectedCategory === i && {
                    backgroundColor: `${cat.color}25`,
                    borderColor: cat.color,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === i && { color: cat.color },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Goal name input */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>What is it?</Text>
            <TextInput
              style={styles.inputText}
              placeholder="e.g. Emergency fund, Japan trip..."
              placeholderTextColor={colors.textLight}
              value={goalName}
              onChangeText={setGoalName}
              maxLength={60}
            />
          </View>

          {/* Amount + Date row */}
          <View style={styles.twoColRow}>
            <View style={[styles.inputCard, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Target Amount</Text>
              <View style={styles.amountRow}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textLight}
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                />
              </View>
            </View>
            <View style={[styles.inputCard, { flex: 1 }]}>
              <Text style={styles.inputLabel}>By When?</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="2028-12"
                placeholderTextColor={colors.textLight}
                value={targetDate}
                onChangeText={setTargetDate}
              />
              {formatMonth(targetDate) ? (
                <Text style={styles.dateFormatted}>
                  {formatMonth(targetDate)}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Calc card */}
          {calc && (
            <View style={styles.calcCard}>
              <View style={styles.calcLeft}>
                <Text style={styles.calcLabel}>✨ You'd need to save</Text>
                <View style={styles.calcAmountRow}>
                  <Text style={styles.calcAmount}>
                    ${formatCurrency(calc.monthlyNeeded)}
                  </Text>
                  <Text style={styles.calcPerMonth}> / month</Text>
                </View>
                <Text style={styles.calcSub}>
                  We'll set your Goals Jar to {calc.suggestedGoalsPct}% to make
                  this happen.
                </Text>
              </View>
              <View style={styles.calcRight}>
                <Text style={styles.calcMonths}>{calc.months}</Text>
                <Text style={styles.calcMonthsLabel}>months to go</Text>
              </View>
            </View>
          )}

          {error && <Text style={styles.errorMessage}>{error}</Text>}
        </ScrollView>

        {/* Bottom section */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.ctaButton} onPress={handleContinue}>
            <Text style={styles.ctaButtonText}>Save this goal →</Text>
          </TouchableOpacity>

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

          <Steps currentStep={3} />
        </View>
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

  // Category picker
  categoriesWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  categoryText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textMid,
  },

  // Input cards
  inputCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  inputLabel: {
    fontFamily: fonts.extra,
    fontSize: 11,
    color: colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  inputText: {
    fontFamily: fonts.extra,
    fontSize: 18,
    color: colors.textDark,
  },
  twoColRow: {
    flexDirection: "row",
    gap: 12,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dollarSign: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textMid,
    marginRight: 4,
  },
  amountInput: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.textDark,
    flex: 1,
  },
  dateInput: {
    fontFamily: fonts.extra,
    fontSize: 16,
    color: colors.textDark,
  },
  dateFormatted: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textDark,
    marginTop: 4,
  },

  // Calc card
  calcCard: {
    backgroundColor: colors.goalsLight,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  calcLeft: {
    flex: 1,
  },
  calcLabel: {
    fontFamily: fonts.extra,
    fontSize: 11,
    color: colors.goals,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  calcAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  calcAmount: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.textDark,
  },
  calcPerMonth: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.textMid,
  },
  calcSub: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textMid,
    lineHeight: 18,
  },
  calcRight: {
    alignItems: "center",
    marginLeft: 16,
  },
  calcMonths: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.goals,
    lineHeight: 40,
  },
  calcMonthsLabel: {
    fontFamily: fonts.extra,
    fontSize: 10,
    color: colors.textMid,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },

  // Placeholder card
  placeholderCard: {
    backgroundColor: "#F0EBE3",
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
  },
  placeholderTitle: {
    fontFamily: fonts.extra,
    fontSize: 11,
    color: colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  placeholderSub: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.textLight,
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
  ctaButton: {
    backgroundColor: colors.needs,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: colors.needs,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 12,
  },
  ctaButtonText: {
    color: colors.white,
    fontSize: 17,
    fontFamily: fonts.extra,
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
