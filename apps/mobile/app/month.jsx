import Octicons from "@expo/vector-icons/Octicons";
import { LinearGradient } from "expo-linear-gradient";
import { DateTime } from "luxon";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import { get } from "@jarly/api-client";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Svg, { Circle, G } from "react-native-svg";

import { colors, fonts } from "../constants/colors";
import useUserStore from "../store/userStore";
import BottomNav from "../components/bottomNav";
import { getCurrentMonthYear } from "../lib/dates";
import { jars } from "../lib/jars";
import { formatCurrency } from "../lib/formatCurrency";
import ErrorBanner from "../components/error";
import useSpendsStore from "../store/spendsStore";
import useGoalsStore from "../store/goalsStore";
import _ from "lodash";
import SpendHistoryRow from "../components/spendHistoryRow";

const DONUT_SIZE = 180;
const STROKE_WIDTH = 28;
const RADIUS = (DONUT_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function Month() {
  const {
    fetchUser,
    budget,
    error: userError,
    isLoading: userLoading,
  } = useUserStore();
  const {
    spends,
    fetchSpends,
    error: spendsError,
    isLoading: spendsLoading,
  } = useSpendsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("3m");
  const [historySpends, setHistorySpends] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const error = userError || spendsError;
  const loading = userLoading || spendsLoading;

  useEffect(() => {
    async function load() {
      await fetchUser();
      await fetchSpends();
    }
    load();
  }, []);

  useEffect(() => {
    let fromDate;
    switch (filter) {
      case "3m":
        fromDate = DateTime.now().minus({ months: 3 });
        break;
      case "6m":
        fromDate = DateTime.now().minus({ months: 6 });
        break;
      case "12m":
        fromDate = DateTime.now().minus({ months: 12 });
        break;
      case "all-time":
        fromDate = null;
        break;
      default:
        fromDate = DateTime.now().minus({ months: 3 });
        break;
    }
    const toDate = DateTime.now().endOf("month");

    async function fetchData() {
      setHistoryLoading(true);
      try {
        const url = fromDate
          ? `/api/v1/spends?from=${fromDate.toISODate()}&to=${toDate.toISODate()}`
          : `/api/v1/spends?to=${toDate.toISODate()}`;

        const { data } = await get(url);

        setHistorySpends(data);
      } catch (err) {
        console.error(err);
      } finally {
        setHistoryLoading(false);
      }
    }

    fetchData();
  }, [filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUser();
    await fetchSpends();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.bg,
        }}
      >
        <ActivityIndicator color={colors.needs} />
      </View>
    );
  }

  const monthYear = getCurrentMonthYear();

  const needsAmt = (budget?.needsAmt || 0) / 100;
  const funAmt = (budget?.funAmt || 0) / 100;
  const needsSpends = (spends || []).filter((spend) => spend.jar === "Needs");
  const needsSpent =
    needsSpends.reduce((sum, s) => sum + s.amountCents, 0) / 100;
  const needsCovered = needsSpent >= needsAmt * 0.5 && needsSpent <= needsAmt;
  const goalsSpends = (spends || []).filter((spend) => spend.jar === "Goals");
  const goalsSpent =
    goalsSpends.reduce((sum, s) => sum + s.amountCents, 0) / 100;
  const goalsContributed = goalsSpends.length;
  const funSpends = (spends || []).filter((spend) => spend.jar === "Fun");
  const funSpent = funSpends.reduce((sum, s) => sum + s.amountCents, 0) / 100;
  const funLeft = funAmt - funSpent;
  const totalSpent = needsSpent + funSpent + goalsSpent;

  const groupedSpends = _.groupBy(historySpends, (sp) =>
    DateTime.fromISO(sp.createdAt).toFormat("yyyy-MM"),
  );
  const sortedMonths = Object.keys(groupedSpends).sort().reverse();

  return (
    <>
      <LinearGradient
        colors={["#FFF0E8", "#FFF8F0", "#E8F7F0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="transparent"
            />
          }
          alwaysBounceVertical={true}
        >
          {error && <ErrorBanner />}

          <Text style={styles.currentMonth}>{monthYear}</Text>
          <Text style={styles.title}>Your Month at a Glance</Text>

          <LinearGradient
            colors={[`${colors.goals}20`, `${colors.fun}50`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.overviewWrapper}
          >
            <Text style={styles.overviewText}>
              {getSummaryMessage(needsCovered, goalsContributed, funLeft)}
            </Text>
          </LinearGradient>

          <View style={styles.jarsWrapper}>
            {jars.map((jar, i) => {
              let summaryText;

              if (jar.name === "Needs") {
                jar.spent = needsSpent;
                if (needsSpent === 0) {
                  summaryText = "No spending logged";
                } else if (needsSpent <= needsAmt) {
                  summaryText = "Stayed within budget";
                } else {
                  summaryText = `$${formatCurrency(Math.abs(needsSpent - needsAmt))} over budget`;
                }
              }

              if (jar.name === "Fun") {
                jar.spent = funSpent;
                if (funLeft > 0) {
                  summaryText = `$${formatCurrency(funLeft)} left over`;
                } else if (funLeft === 0) {
                  summaryText = "Used it all";
                } else {
                  summaryText = `$${formatCurrency(Math.round(Math.abs(funLeft)))} over budget`;
                }
              }

              if (jar.name === "Goals") {
                jar.spent = goalsSpent;
                summaryText =
                  goalsContributed > 0
                    ? `Saved toward ${goalsContributed} goal${goalsContributed > 1 ? "s" : ""}`
                    : "No savings logged";
              }

              return (
                <View
                  key={`jar-${i}`}
                  style={[styles.jarCard, { backgroundColor: jar.light }]}
                >
                  <View style={styles.jarContent}>
                    <View style={styles.leftWrapper}>
                      <View
                        style={[
                          styles.iconWrapper,
                          { backgroundColor: jar.color },
                        ]}
                      >
                        <View style={styles.icon}>{jar.icon}</View>
                      </View>

                      <View style={styles.labelAndSummaryWrapper}>
                        <Text style={styles.label}>{jar.name} Jar</Text>
                        <Text style={styles.summary}>{summaryText}</Text>
                      </View>
                    </View>

                    <View style={styles.rightWrapper}>
                      <Text style={styles.amountSpent}>
                        ${formatCurrency(jar.spent)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          <View
            style={[
              styles.jarCard,
              { backgroundColor: "#E8EDF2", marginBottom: 24 },
            ]}
          >
            <View style={styles.jarContent}>
              <View style={styles.leftWrapper}>
                <View
                  style={[styles.iconWrapper, { backgroundColor: "#2D2D2D" }]}
                >
                  <View style={styles.icon}>
                    <FontAwesome name="money" size={18} color="#a3b18a" />
                  </View>
                </View>

                <View style={styles.labelAndSummaryWrapper}>
                  <Text style={styles.label}>Total spent</Text>
                  <Text style={styles.summary}>
                    out of{" "}
                    {(budget.incomeCents / 100).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    })}
                  </Text>
                </View>
              </View>

              <View>
                <Text style={styles.amountSpent}>
                  ${formatCurrency(totalSpent)}
                </Text>
                <Text style={styles.amountSaved}>
                  ✓ ${formatCurrency(goalsSpent)} saved
                </Text>
              </View>
            </View>
          </View>

          <DonutChart
            needsSpent={needsSpent}
            goalsSpent={goalsSpent}
            funSpent={funSpent}
          />

          <Text style={styles.spendHistoryLabel}>Spend History</Text>

          {/* Filter tabs */}
          <View style={styles.filtersWrapper}>
            {filters.map(({ key, label }) => (
              <TouchableOpacity
                onPress={() => setFilter(key)}
                style={[
                  styles.filterButton,
                  key === filter && { backgroundColor: colors.needs },
                ]}
                key={key}
              >
                <Text style={styles.filterLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Spend history (grouped by month, each group shows spends for that month) */}
          <View style={{ opacity: historyLoading ? 0.4 : 1 }}>
            {sortedMonths.map((month, i) => {
              const spendsAtMonth = groupedSpends[month];
              return (
                <View key={`month-${i}`}>
                  <Text style={styles.monthText}>
                    {DateTime.fromISO(month).toFormat("MMMM yyyy")}
                  </Text>

                  <View style={styles.spendsWrapper}>
                    {spendsAtMonth.map((spend, j) => (
                      <SpendHistoryRow key={`spend-${j}`} spend={spend} />
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </LinearGradient>

      <BottomNav currentPage={"Recap"} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    padding: 32,
    paddingTop: 60,
    paddingBottom: 16,
  },
  currentMonth: {
    fontWeight: 600,
    fontSize: 18,
    color: colors.textMid,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.black,
    fontSize: 28,
    color: colors.textDark,
    lineHeight: 38,
    marginBottom: 8,
  },
  overviewWrapper: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  overviewText: {
    fontFamily: fonts.body,
    color: colors.textDark,
    fontSize: 14,
  },
  jarsWrapper: {
    gap: 16,
    marginBottom: 16,
  },
  leftWrapper: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
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
    flex: 1,
    alignItems: "center",
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
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textMid,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  summary: {
    marginTop: 4,
    fontFamily: fonts.black,
    color: colors.textMid,
    fontSize: 12,
  },
  amountSpent: {
    fontFamily: fonts.extra,
    fontSize: 18,
    textAlign: "right",
  },
  amountSaved: {
    textAlign: "right",
    fontFamily: fonts.bold,
    color: colors.textDark,
    fontSize: 12,
  },
  // Donut chart
  donutWrapper: {
    alignItems: "center",
    gap: 24,
  },
  donutContainer: {
    width: DONUT_SIZE,
    height: DONUT_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  donutCenter: {
    position: "absolute",
    alignItems: "center",
  },
  donutTotal: {
    fontFamily: fonts.extra,
    fontSize: 20,
    color: colors.textDark,
  },
  donutLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.textMid,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.textMid,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  legendAmount: {
    fontFamily: fonts.extra,
    fontSize: 13,
    color: colors.textDark,
  },

  // Filters
  filtersWrapper: {
    flexDirection: "row",
    gap: 8,
    margin: "auto",
    marginTop: 8,
    marginBottom: 16,
  },
  filterButton: {
    padding: 8,
    backgroundColor: colors.needsLight,
    borderRadius: 12,
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textDark,
    textTransform: "uppercase",
    textAlign: "center",
  },

  // Spend History
  spendHistoryLabel: {
    marginTop: 32,
    fontSize: 11,
    fontWeight: "800",
    color: colors.textMid,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textAlign: "center",
  },
  monthText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textLight,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  spendsWrapper: {
    gap: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 16,
  },
});

const getSummaryMessage = (needsCovered, goalsContributed, funLeft) => {
  const parts = [];

  if (needsCovered) {
    parts.push("covered all your needs");
  }
  if (goalsContributed > 0) {
    parts.push(
      `added to ${goalsContributed} goal${goalsContributed > 1 ? "s" : ""}`,
    );
  }
  if (funLeft > 0) {
    parts.push(
      `had $${formatCurrency(Math.round(funLeft))} left in your Fun Jar`,
    );
  }

  if (parts.length === 0) {
    return "Here's how your month went.";
  }

  const joined =
    parts.length === 1
      ? parts[0]
      : parts.slice(0, -1).join(", ") + ", and " + parts[parts.length - 1];

  return `You ${joined}. Solid month!`;
};

function DonutChart({ needsSpent, goalsSpent, funSpent }) {
  const total = needsSpent + goalsSpent + funSpent;

  if (total === 0) {
    return null;
  }

  const segments = [
    { value: needsSpent, color: colors.needs, label: "Needs" },
    { value: goalsSpent, color: colors.goals, label: "Goals" },
    { value: funSpent, color: colors.fun, label: "Fun" },
  ];

  let cumulativePct = 0;

  return (
    <View style={styles.donutWrapper}>
      <View style={styles.donutContainer}>
        <Svg width={DONUT_SIZE} height={DONUT_SIZE}>
          <G rotation="-90" origin={`${DONUT_SIZE / 2}, ${DONUT_SIZE / 2}`}>
            {/* Background circle */}
            <Circle
              cx={DONUT_SIZE / 2}
              cy={DONUT_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={colors.border}
              strokeWidth={STROKE_WIDTH}
            />
            {segments.map((seg, i) => {
              const pct = seg.value / total;
              const strokeDasharray = `${pct * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
              const strokeDashoffset = -cumulativePct * CIRCUMFERENCE;
              cumulativePct += pct;

              return (
                <Circle
                  key={i}
                  cx={DONUT_SIZE / 2}
                  cy={DONUT_SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={STROKE_WIDTH}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="butt"
                />
              );
            })}
          </G>
        </Svg>

        {/* Center label */}
        <View style={styles.donutCenter}>
          <Text style={styles.donutTotal}>${formatCurrency(total)}</Text>
          <Text style={styles.donutLabel}>spent</Text>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {segments.map((seg, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: seg.color }]} />
            <View>
              <Text style={styles.legendLabel}>{seg.label}</Text>
              <Text style={styles.legendAmount}>
                ${formatCurrency(seg.value)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const filters = [
  { key: "3m", label: "3 Months" },
  { key: "6m", label: "6 Months" },
  { key: "12m", label: "12 Months" },
  { key: "all-time", label: "All Time" },
];
