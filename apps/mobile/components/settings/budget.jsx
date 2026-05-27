import { View, Text, StyleSheet } from "react-native";

import { colors, fonts } from "../../constants/colors";
import {
  calculateFunSpentPct,
  calculateGoalsSpentPct,
  calculateNeedsSpentPct,
  jars,
} from "../../lib/jars";
import { formatCurrency } from "../../lib/formatCurrency";

export default function BudgetCard({
  budget,
  setEditIncomeVisible,
  setEditJarSplitVisible,
}) {
  const income = (budget?.incomeCents || 0) / 100;
  const needsAmt = (budget?.needsAmt || 0) / 100;
  const goalsAmt = (budget?.goalsAmt || 0) / 100;
  const funAmt = (budget?.funAmt || 0) / 100;

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.label}>Budget</Text>
        <View style={styles.topWrapper}>
          <View>
            <Text style={styles.budgetLabel}>Monthly Income</Text>
            <Text style={styles.income}>
              {(budget.incomeCents / 100).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              })}
            </Text>
          </View>

          <Text
            onPress={() => setEditIncomeVisible(true)}
            style={styles.actionButton}
          >
            Edit
          </Text>
        </View>

        <View style={styles.bottomWrapper}>
          <View style={{ flex: 1 }}>
            <View style={styles.jarSplitText}>
              <Text style={styles.budgetLabel}>Jar Split</Text>
              <Text
                onPress={() => setEditJarSplitVisible(true)}
                style={styles.actionButton}
              >
                Edit
              </Text>
            </View>

            <View style={styles.jarsWrapper}>
              {jars.map((jar, i) => {
                if (jar.name === "Needs") {
                  jar.pct = budget?.needsPct || 0;
                }
                if (jar.name === "Goals") {
                  jar.pct = budget?.goalsPct || 0;
                }
                if (jar.name === "Fun") {
                  jar.pct = budget?.funPct || 0;
                }
                return (
                  <View
                    key={`jar-${i}`}
                    style={[styles.jarCard, { backgroundColor: jar.light }]}
                  >
                    <View
                      style={[
                        styles.jarProgressBg,
                        {
                          width: `${jar.pct}%`,
                          backgroundColor: `${jar.color}20`,
                        },
                      ]}
                    />

                    <View style={styles.jarContent}>
                      <View
                        style={[
                          styles.iconWrapper,
                          { backgroundColor: jar.color },
                        ]}
                      >
                        <View style={styles.icon}>{jar.icon}</View>
                      </View>

                      <View style={styles.indicatorWrapper}>
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
                      </View>

                      <View style={styles.amountLeftWrapper}>
                        <Text
                          style={[styles.amountLeft, { color: jar.textColor }]}
                        >
                          {jar.pct}%
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* TODO: ADJUST BUTTON */}
            <View></View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#fff",
  },
  cardContent: {
    padding: 16,
    width: "100%",
  },
  label: {
    fontFamily: fonts.body,
    color: colors.textMid,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginBottom: 8,
    fontSize: 16,
  },
  topWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  bottomWrapper: {
    borderTopWidth: 1,
    borderTopColor: "#00000020",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
  },
  actionButton: {
    color: colors.needs,
    fontFamily: fonts.extra,
  },
  budgetLabel: {
    fontFamily: fonts.extra,
    color: colors.textMid,
    fontSize: 14,
  },
  income: {
    fontFamily: fonts.extra,
    fontSize: 18,
  },
  jarsWrapper: {
    gap: 16,
    marginBottom: 16,
    marginTop: 8,
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
    overflow: "hidden",
    position: "relative",
  },
  jarContent: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
  },
  jarSplitText: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  indicatorWrapper: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  jarProgressBg: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    borderRadius: 0,
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
  progressTrack: {
    height: 6,
    backgroundColor: "#D3D3D3",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  amountLeftWrapper: {
    alignItems: "flex-end",
    justifyContent: "center",
    flexShrink: 0,
  },
  amountLeft: {
    fontFamily: fonts.display,
    fontSize: 14,
  },
});
