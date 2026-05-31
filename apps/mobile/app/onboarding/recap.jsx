import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { colors, fonts } from "../../constants/colors";
import { JarIllustration } from "../../components/jarIllustration";
import { Steps } from "../../components/steps";
import { LinearGradient } from "expo-linear-gradient";
import useOnboardingStore from "@jarly/store";
import { jars } from "../../lib/jars";
import { formatCurrency } from "../../lib/formatCurrency";
import { formatTargetDate } from "../../lib/dates";

export default function Welcome() {
  const router = useRouter();

  const income = useOnboardingStore((s) => s.income);
  const needsPct = useOnboardingStore((s) => s.needsPct);
  const needsAmt = useOnboardingStore((s) => s.needsAmt);
  const goalsPct = useOnboardingStore((s) => s.goalsPct);
  const goalsAmt = useOnboardingStore((s) => s.goalsAmt);
  const funPct = useOnboardingStore((s) => s.funPct);
  const funAmt = useOnboardingStore((s) => s.funAmt);
  const goal = useOnboardingStore((s) => s.goal);

  const category =
    categories.find(
      (c) => c.name.toLowerCase() === goal.category.toLowerCase(),
    ) || categories[7];

  return (
    <LinearGradient
      colors={["#FFF0E8", "#FFF8F0", "#E8F7F0"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Jarly Recap</Text>

        <View style={styles.incomeWrapper}>
          <Text style={styles.sectionTitle}>Your Budget</Text>
          <Text style={styles.income}>
            {income.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            })}
          </Text>
        </View>

        <View style={styles.jarsWrapper}>
          <Text style={styles.sectionTitle}>Your Jars</Text>

          {jars.map((jar, i) => {
            if (jar.name === "Needs") {
              jar.pct = needsPct;
              jar.amt = needsAmt.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              });
            }
            if (jar.name === "Goals") {
              jar.pct = goalsPct;
              jar.amt = goalsAmt.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              });
            }
            if (jar.name === "Fun") {
              jar.pct = funPct;
              jar.amt = funAmt.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              });
            }

            return (
              <View
                key={`jar-${i}`}
                style={[styles.jarCard, { backgroundColor: jar.light }]}
              >
                <View style={styles.jarContent}>
                  <View
                    style={[styles.iconWrapper, { backgroundColor: jar.color }]}
                  >
                    <View style={styles.icon}>{jar.icon}</View>
                  </View>

                  <View style={styles.nameAndIndicatorWrapper}>
                    <Text style={styles.label}>{jar.name} Jar</Text>

                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${jar.pct}%`,
                            backgroundColor: jar.color,
                          },
                        ]}
                      />
                    </View>

                    <Text style={styles.jarPctText}>{jar.pct}%</Text>
                  </View>

                  <View style={styles.amountLeftWrapper}>
                    <Text style={[styles.amountLeft, { color: jar.textColor }]}>
                      {jar.amt}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {goal && (
          <View style={styles.goalWrapper}>
            <Text style={styles.sectionTitle}>Your Goal</Text>
            <View style={styles.goalCard}>
              <View style={styles.topContent}>
                <View style={styles.leftWrapper}>
                  <View
                    style={[
                      styles.categoryDot,
                      { backgroundColor: category.color },
                    ]}
                  />

                  <View>
                    <Text
                      style={styles.label}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {goal.goalName}
                    </Text>
                  </View>
                </View>

                <View style={styles.rightWrapper}>
                  <Text style={styles.target}>
                    {(goal.targetCents / 100).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    })}
                  </Text>

                  <View style={styles.targetDateWrapper}>
                    <Text style={styles.targetDateText}>
                      {formatTargetDate(goal.targetDate)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push("/home")}
        >
          <Text style={styles.ctaButtonText}>Let's go →</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    marginTop: 60,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 32,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 36,
    color: colors.textDark,
    fontFamily: fonts.bold,
    textAlign: "center",
    lineHeight: 38,
  },

  sectionTitle: {
    fontWeight: 600,
    fontSize: 16,
    color: colors.textMid,
  },

  // Budget
  incomeWrapper: {
    marginTop: 16,
  },
  income: {
    fontSize: 40,
    color: colors.textDark,
    fontWeight: 800,
    fontFamily: fonts.extra,
  },

  // Jars
  jarsWrapper: {
    marginTop: 24,
    gap: 16,
    marginBottom: 16,
  },
  jarCard: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    position: "relative",
  },
  jarContent: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },
  iconWrapper: {
    justifyContent: "center",
    padding: 10,
    margin: "auto",
    marginLeft: 0,
    marginRight: 0,
    borderRadius: 10,
  },
  icon: {
    height: 20,
    width: 20,
  },
  nameAndIndicatorWrapper: { width: 160 },
  progressTrack: {
    height: 6,
    backgroundColor: "#D3D3D3",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 16,
  },
  amountLeft: {
    fontFamily: fonts.extra,
    fontSize: 16,
  },
  jarPctText: {
    fontFamily: fonts.bold,
  },

  // Goal
  goalWrapper: {
    marginTop: 24,
  },
  goalCard: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: colors.white, // ← add this
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    overflow: "hidden",
    position: "relative",
    padding: 16,
  },
  topContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftWrapper: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    overflow: "hidden",
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: 800,
    color: colors.textDark,
    numberOfLines: 1,
  },
  rightWrapper: {
    alignItems: "flex-end",
    flexShrink: 0,
    marginLeft: 8,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  target: {
    fontFamily: fonts.extra,
    fontSize: 18,
    textAlign: "right",
  },
  targetDateWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  targetDateText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.textMid,
  },

  ctaButton: {
    marginTop: 24,
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
  ctaButtonText: {
    color: "white",
    fontSize: 17,
    fontFamily: fonts.extra,
  },
});

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
