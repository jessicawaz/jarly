import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Animated,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { DateTime, Interval } from "luxon";
import Octicons from "@expo/vector-icons/Octicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useLocalSearchParams, useRouter } from "expo-router";

import { colors, fonts } from "../constants/colors";
import useUserStore from "../store/userStore";
import BottomNav from "../components/bottomNav";
import { getCurrentMonthYear, getDaysUntilNextMonth } from "../lib/dates";
import {
  calculateFunSpentPct,
  calculateGoalsSpentPct,
  calculateNeedsSpentPct,
  jars,
} from "../lib/jars";
import { formatCurrency } from "../lib/formatCurrency";
import { get } from "@jarly/api-client";
import SpendLogs from "./spendLogs";
import useSpendsStore from "../store/spendsStore";
import ErrorBanner from "../components/error";
import AnimatedBanner from "../components/animatedBanner";

export default function Home() {
  const router = useRouter();
  const { goalCompleted } = useLocalSearchParams({ goalCompleted: Boolean });

  const {
    user,
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
  const [showConfetti, setShowConfetti] = useState(goalCompleted === "true");

  const error = userError || spendsError;
  const loading = userLoading || spendsLoading;

  const income = (budget?.incomeCents || 0) / 100;
  const needsAmt = (budget?.needsAmt || 0) / 100;
  const goalsAmt = (budget?.goalsAmt || 0) / 100;
  const funAmt = (budget?.funAmt || 0) / 100;

  const needsSpends = (spends || []).filter((spend) => spend.jar === "Needs");
  const needsSpent =
    needsSpends.reduce((sum, s) => sum + s.amountCents, 0) / 100;
  const needsCovered = needsSpent >= needsAmt * 0.5 && needsSpent <= needsAmt;
  const needsLeft = needsAmt - needsSpent;
  const goalsSpends = (spends || []).filter((spend) => spend.jar === "Goals");
  const goalsSpent =
    goalsSpends.reduce((sum, s) => sum + s.amountCents, 0) / 100;
  const goalsContributed = goalsSpends.length;
  const goalsLeft = goalsAmt - goalsSpent;
  const funSpends = (spends || []).filter((spend) => spend.jar === "Fun");
  const funSpent = funSpends.reduce((sum, s) => sum + s.amountCents, 0) / 100;
  const funLeft = funAmt - funSpent;

  useEffect(() => {
    async function load() {
      await fetchUser();
      await fetchSpends();
    }
    load();
  }, []);

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

  if (!user) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.bg,
        }}
      >
        <Text style={{ color: colors.textMid }}>Could not load profile.</Text>
      </View>
    );
  }

  const monthYear = getCurrentMonthYear();

  const daysUntilNextMonth = getDaysUntilNextMonth();

  return (
    <>
      <LinearGradient
        colors={["#FFF0E8", "#FFF8F0", "#E8F7F0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {showConfetti && (
          <AnimatedBanner bannerText={"Congrats! You completed a goal!"} />
        )}

        <ScrollView
          contentContainerStyle={{
            padding: 32,
            paddingTop: 0,
            paddingBottom: 120,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="transparent"
            />
          }
        >
          {error && <ErrorBanner />}

          <View
            style={[
              styles.content,
              error ? { marginTop: 0 } : { marginTop: 60 },
            ]}
          >
            <Text style={styles.welcomeMsg}>
              Hey {user.displayName} - {monthYear}
            </Text>
            <Text style={styles.income}>
              {income.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              })}
            </Text>
            <Text style={styles.incomeMsg}>
              came in this month · {daysUntilNextMonth} days left{" "}
            </Text>

            <View style={styles.jarsWrapper}>
              {jars.map((jar, i) => {
                if (jar.name === "Needs") {
                  jar.pct = calculateNeedsSpentPct(needsSpent, needsAmt);
                  jar.spent = `$${Math.round(needsSpent)} spent of $${Math.round(needsAmt)}`;
                  jar.left = `$${formatCurrency(needsLeft)}`;
                }
                if (jar.name === "Goals") {
                  jar.pct = calculateGoalsSpentPct(goalsSpent, goalsAmt);
                  jar.spent = `$${Math.round(goalsSpent)} saved of $${Math.round(goalsAmt)}`;
                  jar.left = `$${formatCurrency(goalsLeft)}`;
                }
                if (jar.name === "Fun") {
                  jar.pct = calculateFunSpentPct(funSpent, funAmt);
                  jar.spent = `$${Math.round(funSpent)} spent of $${Math.round(funAmt)}`;
                  jar.left = `$${formatCurrency(funLeft)}`;
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

                        <Text style={styles.spentTrack}>{jar.spent}</Text>
                      </View>

                      <View style={styles.amountLeftWrapper}>
                        <Text
                          style={[styles.amountLeft, { color: jar.textColor }]}
                        >
                          {jar.left}
                        </Text>
                        <Text style={styles.amountLeftText}>Left</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.hintCard}>
              <Text style={styles.hintCardText}>
                You've got ${formatCurrency(funLeft)} in your Fun Jar. Plenty of
                room to enjoy yourself!
              </Text>
            </View>
          </View>

          <SpendLogs />
        </ScrollView>

        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => router.push("/spend")}
        >
          <AntDesign name="plus-circle" size={28} color="black" />
        </TouchableOpacity>
      </LinearGradient>

      <BottomNav currentPage={"home"} />

      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: -10, y: 0 }}
          autoStart={true}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  income: {
    fontSize: 40,
    color: colors.textDark,
    fontWeight: 800,
    fontFamily: fonts.extra,
  },
  welcomeMsg: {
    fontWeight: 600,
    fontSize: 14,
    color: colors.textMid,
  },
  incomeMsg: {
    fontWeight: 600,
    fontSize: 14,
    color: colors.textMid,
    marginBottom: 16,
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
    color: colors.textMid,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  floatingButton: {
    backgroundColor: colors.needs,
    borderRadius: 16,
    padding: 8,
    alignSelf: "flex-end",
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
    position: "absolute",
    bottom: 20,
    right: 24,
  },
  hintCard: {
    backgroundColor: colors.funLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  hintCardText: {
    fontFamily: fonts.display,
    color: colors.textDark,
  },
  jarsWrapper: {
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
    overflow: "hidden",
    position: "relative",
  },
  jarContent: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
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
  nameAndIndicatorWrapper: { width: 160 },
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
  amountLeft: {
    fontFamily: fonts.extra,
    fontSize: 16,
  },
  amountLeftText: {
    textAlign: "right",
    fontFamily: fonts.black,
    color: colors.textMid,
  },
  spentTrack: {
    marginTop: 8,
    fontFamily: fonts.semi,
    color: colors.textMid,
    fontSize: 12,
  },
  errorBanner: {
    backgroundColor: "#FDECEA",
    borderRadius: 10,
    padding: 12,
    marginTop: 60,
    marginHorizontal: 32,
    marginBottom: 8,
  },
  errorBannerText: {
    color: "#E05C5C",
    fontFamily: fonts.semi,
    fontSize: 13,
  },
});
