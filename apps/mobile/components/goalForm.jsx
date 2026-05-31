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
import { Picker } from "@react-native-picker/picker";
import { useState, useMemo, useEffect } from "react";
import { colors, fonts } from "../constants/colors";
import { formatCurrency } from "../lib/formatCurrency";
import { DateTime } from "luxon";

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

const monthNames = [
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

const currentYear = DateTime.now().year;
const years = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3];

export default function GoalForm({
  onSave,
  onClose,
  prefilledData = {},
  loading = false,
  showHeader = true,
  backgroundColor = "#FFF8F4",
  noPadding = false,
}) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(DateTime.now().month - 1);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [error, setError] = useState(null);

  const targetDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;

  const calc = useMemo(() => {
    const amount = Number(targetAmount);
    if (!amount || !targetDate) return null;

    const [tYear, tMonth] = targetDate.split("-").map(Number);
    if (!tYear || !tMonth) return null;

    const now = new Date();
    const months =
      (tYear - now.getFullYear()) * 12 + (tMonth - (now.getMonth() + 1));
    if (months <= 0) return null;

    const monthlyNeeded = Math.ceil(amount / months);
    return { monthlyNeeded, months };
  }, [targetAmount, targetDate]);

  useEffect(() => {
    if (prefilledData?.id) {
      setGoalName(prefilledData.name ?? "");
      setTargetAmount(
        prefilledData.targetCents
          ? String(prefilledData.targetCents / 100)
          : "",
      );
      setSelectedMonth(
        prefilledData.targetDate
          ? DateTime.fromISO(prefilledData.targetDate).month - 1
          : DateTime.now().month - 1,
      );
      setSelectedYear(
        prefilledData.targetDate
          ? DateTime.fromISO(prefilledData.targetDate).year
          : currentYear,
      );
      setSelectedCategory(
        prefilledData.category
          ? categories.findIndex(
              (c) =>
                c.name.toLowerCase() === prefilledData.category.toLowerCase(),
            )
          : null,
      );
    } else {
      setGoalName("");
      setTargetAmount("");
      setSelectedMonth(DateTime.now().month - 1);
      setSelectedYear(currentYear);
      setSelectedCategory(null);
      setError(null);
    }
  }, [prefilledData]);

  const handleSave = () => {
    if (!goalName) {
      setError("Enter a goal name.");
      return;
    }
    if (!targetAmount) {
      setError("Enter a target amount.");
      return;
    }
    onSave({
      goalName,
      targetCents: Number(targetAmount) * 100,
      targetDate,
      category:
        selectedCategory !== null ? categories[selectedCategory].name : null,
    });
  };

  const isTransparent = backgroundColor === "transparent";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor }]}
    >
      <ScrollView
        contentContainerStyle={[
          noPadding
            ? { padding: 0 }
            : { padding: 24, paddingTop: 32, paddingBottom: 12 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {showHeader && (
          <View style={styles.header}>
            <Text style={styles.title}>
              {prefilledData?.id ? "Edit" : "New"} Goal
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.inputLabel}>What kind of goal?</Text>
        <View style={styles.categoriesWrapper}>
          {categories.map((cat, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                setSelectedCategory(i);
              }}
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

        <Text style={styles.inputLabel}>What are you saving for?</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={styles.inputText}
            placeholder="e.g. Japan trip, new laptop..."
            placeholderTextColor={colors.textLight}
            value={goalName}
            onChangeText={setGoalName}
            maxLength={60}
          />
        </View>

        <Text style={styles.inputLabel}>Target amount</Text>
        <View style={styles.inputCardRow}>
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

        <Text style={styles.inputLabel}>By when?</Text>
        <View
          style={[
            styles.inputCard,
            { flexDirection: "row", padding: 0, overflow: "hidden" },
          ]}
        >
          <Picker
            selectedValue={selectedMonth}
            onValueChange={setSelectedMonth}
            style={{ flex: 1 }}
            itemStyle={{ fontSize: 16, height: 150 }}
          >
            {monthNames.map((m, i) => (
              <Picker.Item key={m} label={m} value={i} />
            ))}
          </Picker>
          <Picker
            selectedValue={selectedYear}
            onValueChange={setSelectedYear}
            style={{ flex: 1 }}
            itemStyle={{ fontSize: 16, height: 150 }}
          >
            {years.map((y) => (
              <Picker.Item key={y} label={String(y)} value={y} />
            ))}
          </Picker>
        </View>

        {calc ? (
          <View style={styles.calcCard}>
            <View>
              <Text style={styles.calcLabel}>✨ You'd need to save</Text>
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <Text style={styles.calcAmount}>
                  ${formatCurrency(calc.monthlyNeeded)}
                </Text>
                <Text style={styles.calcSub}> / month</Text>
              </View>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={styles.calcMonths}>{calc.months}</Text>
              <Text style={styles.calcMonthsLabel}>months</Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderTitle}>Monthly savings needed</Text>
            <Text style={styles.placeholderSub}>
              Fill in amount and date to see your target
            </Text>
          </View>
        )}

        {error && <Text style={styles.errorMessage}>{error}</Text>}
      </ScrollView>

      <View
        style={[
          styles.bottomSection,
          {
            backgroundColor,
            borderTopWidth: isTransparent ? 0 : 1,
            borderTopColor: isTransparent ? "transparent" : colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.saveButton, loading && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? "Saving..." : "Save goal →"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontFamily: fonts.black,
    fontSize: 28,
    color: colors.textDark,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.textMid,
  },
  inputLabel: {
    fontFamily: fonts.extra,
    fontSize: 11,
    color: colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
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
  inputCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  inputText: {
    fontFamily: fonts.extra,
    fontSize: 16,
    color: colors.textDark,
  },
  inputCardRow: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  dollarSign: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.textMid,
  },
  amountInput: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textDark,
    flex: 1,
  },
  calcCard: {
    backgroundColor: colors.goalsLight,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  calcLabel: {
    fontFamily: fonts.extra,
    fontSize: 11,
    color: colors.goals,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  calcAmount: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.textDark,
  },
  calcSub: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.textMid,
  },
  calcMonths: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.goals,
  },
  calcMonthsLabel: {
    fontFamily: fonts.extra,
    fontSize: 10,
    color: colors.textMid,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  placeholderCard: {
    backgroundColor: "#F0EBE3",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
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
    fontSize: 13,
    color: colors.textLight,
  },
  errorMessage: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: "#E05C5C",
    marginTop: 4,
  },
  bottomSection: {
    padding: 24,
    paddingBottom: 24,
  },
  saveButton: {
    backgroundColor: colors.needs,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: colors.needs,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 17,
    fontFamily: fonts.extra,
  },
});
