import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { DateTime, Interval } from "luxon";
import Octicons from "@expo/vector-icons/Octicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Swipeable } from "react-native-gesture-handler";

import { colors, fonts } from "../constants/colors";
import useUserStore from "../store/userStore";
import BottomNav from "../components/bottomNav";
import { useRouter } from "expo-router";
import { del, get } from "@jarly/api-client";
import GoalFormModal from "../components/goalFormModal";
import { formatTargetDate } from "../lib/dates";
import { formatCurrency } from "../lib/formatCurrency";
import ErrorBanner from "../components/error";
import useGoalsStore from "../store/goalsStore";
import useSpendsStore from "../store/spendsStore";
import { useNetInfo } from "@react-native-community/netinfo";
import OfflineBanner from "../components/offlineBanner";

export default function Goals() {
  const router = useRouter();
  const {
    user,
    isLoading,
    fetchUser,
    budget,
    error: userError,
    isLoading: userLoading,
  } = useUserStore();
  const {
    goals,
    fetchGoals,
    error: goalsError,
    isLoading: goalsLoading,
  } = useGoalsStore();
  const {
    spends,
    fetchSpends,
    error: spendsError,
    isLoading: spendsLoading,
  } = useSpendsStore();
  const netInfo = useNetInfo();

  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [goalEditing, setGoalEditing] = useState(null);

  const error = userError || goalsError || spendsError;
  const loading = userLoading || goalsLoading || spendsLoading;
  const goalsAmt = (budget?.goalsAmt || 0) / 100;

  useEffect(() => {
    async function load() {
      await fetchUser();
      await fetchGoals();
      await fetchSpends();
    }
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUser();
    await fetchGoals();
    setRefreshing(false);
  };

  const getMonthlyNeeded = (targetCents, savedCents, targetDate) => {
    if (!targetDate) {
      return null;
    }

    const [targetYear, targetMonth] = targetDate.split("-").map(Number);
    const now = new Date();
    const months =
      (targetYear - now.getFullYear()) * 12 +
      (targetMonth - (now.getMonth() + 1));

    if (months <= 0) {
      return null;
    }

    const remaining = targetCents - (savedCents || 0);

    return Math.ceil(remaining / months / 100); // convert cents to dollars
  };

  const handleDelete = async (goalId) => {
    try {
      await del(`/api/v1/goals/${goalId}`);
      fetchGoals();
    } catch (e) {
      console.error(e);
    }
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

  const goalsSpends = (spends || []).filter((spend) => spend.jar === "Goals");
  const goalsSpent =
    goalsSpends.reduce((sum, s) => sum + s.amountCents, 0) / 100;
  const goalsContributed = goalsSpends.length;
  const goalsLeft = goalsAmt - goalsSpent;

  return (
    <>
      <LinearGradient
        colors={["#FFF0E8", "#FFF8F0", "#E8F7F0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {!netInfo.isConnected && <OfflineBanner />}

        <ScrollView
          contentContainerStyle={{
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

          <View style={styles.content}>
            <Text style={styles.title}>
              Your Goals <Octicons name="goal" size={30} color="black" />
            </Text>

            <View style={styles.goalsWrapper}>
              {!goals?.length ? (
                <View>
                  <Text style={styles.nothingLabel}>No goals yet</Text>
                  <Text style={styles.nothingHint}>
                    Tap the + button to add something you're saving for
                  </Text>
                </View>
              ) : (
                goals.map((goal, i) => {
                  const monthlyNeeded = getMonthlyNeeded(
                    goal.targetCents,
                    goal.savedCents,
                    goal.targetDate,
                  );

                  const savedPct =
                    goal.targetCents > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (goal.savedCents / goal.targetCents) * 100,
                          ),
                        )
                      : 0;

                  const category =
                    categories.find(
                      (c) =>
                        c.name.toLowerCase() === goal.category.toLowerCase(),
                    ) || categories[7];

                  return (
                    <Swipeable
                      key={`goal-${i}`}
                      containerStyle={styles.swipeable}
                      friction={2}
                      enableTrackpadTwoFingerGesture
                      rightThreshold={40}
                      renderRightActions={() => (
                        <TouchableOpacity
                          style={[
                            styles.deleteAction,
                            !netInfo.isConnected && { opacity: 0.5 },
                          ]}
                          disabled={!netInfo.isConnected}
                          onPress={() => handleDelete(goal.id)}
                        >
                          <Text style={styles.deleteActionText}>Delete</Text>
                        </TouchableOpacity>
                      )}
                    >
                      <TouchableOpacity
                        style={styles.goalCard}
                        disabled={!netInfo.isConnected}
                        onPress={() => {
                          setModalVisible(true);
                          setGoalEditing(goal);
                        }}
                      >
                        <View style={styles.goalContent}>
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
                                  {goal.name}
                                </Text>
                              </View>
                            </View>

                            <View style={styles.rightWrapper}>
                              <Text style={styles.amountSaved}>
                                ${formatCurrency(goal.savedCents / 100)}
                              </Text>
                              <Text style={styles.amountSavedText}>
                                of ${formatCurrency(goal.targetCents / 100)}
                              </Text>
                            </View>
                          </View>

                          <View>
                            <View style={styles.progressTrack}>
                              <View
                                style={[
                                  styles.progressFill,
                                  {
                                    width: `${savedPct}%`,
                                    backgroundColor: category.color,
                                  },
                                ]}
                              />
                            </View>

                            <View style={styles.progressDetailWrapper}>
                              <Text style={styles.doneByText}>
                                Save ${monthlyNeeded}/mo ·{" "}
                                {formatTargetDate(goal.targetDate)}
                              </Text>

                              <Text style={styles.savedPercent}>
                                {Math.round(savedPct)}%
                              </Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </Swipeable>
                  );
                })
              )}
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.floatingButton,
            !netInfo.isConnected && { opacity: 0.5 },
          ]}
          disabled={!netInfo.isConnected}
          onPress={() => {
            setGoalEditing(null);
            setModalVisible(true);
          }}
        >
          <AntDesign name="plus-circle" size={28} color="black" />
        </TouchableOpacity>

        <GoalFormModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setGoalEditing(null);
          }}
          onSaved={() => {
            setGoalEditing(null);
            setModalVisible(false);
            fetchGoals();
          }}
          prefilledData={goalEditing}
        />
      </LinearGradient>

      <BottomNav currentPage={"goals"} />
    </>
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
    fontFamily: fonts.black,
    fontSize: 32,
    color: colors.textDark,
    lineHeight: 38,
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: 800,
    color: colors.textDark,
    numberOfLines: 1,
  },
  monthlyTargetText: {
    fontSize: 12,
    fontFamily: fonts.black,
    color: colors.textMid,
    marginTop: 4,
  },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  floatingButton: {
    backgroundColor: colors.goals,
    borderRadius: 16,
    padding: 8,
    alignSelf: "flex-end",
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
  },
  goalsWrapper: {
    gap: 16,
    marginBottom: 16,
  },
  goalCard: {
    borderRadius: 16,
    backgroundColor: colors.white, // ← add this
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    overflow: "hidden",
    position: "relative",
  },
  goalContent: {
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
  rightWrapper: {
    alignItems: "flex-end",
    flexShrink: 0,
    marginLeft: 8,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  progressTrack: {
    width: "100%",
    height: 16,
    backgroundColor: colors.goalsLight,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
  },
  doneByText: {
    fontSize: 12,
    fontFamily: fonts.semi,
    color: colors.textMid,
  },
  savedPercent: {
    fontSize: 12,
    fontFamily: fonts.black,
    color: colors.textMid,
  },
  progressDetailWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  amountSaved: {
    fontFamily: fonts.extra,
    fontSize: 18,
    textAlign: "right",
  },
  amountSavedText: {
    textAlign: "right",
    fontFamily: fonts.black,
    color: colors.textMid,
  },
  spentTrack: {
    marginTop: 8,
    fontFamily: fonts.black,
    color: colors.textMid,
    fontSize: 12,
  },
  nothingLabel: {
    fontFamily: fonts.black,
    fontSize: 14,
  },
  nothingHint: {
    fontFamily: fonts.semi,
    color: colors.textMid,
    fontSize: 14,
  },
  deleteAction: {
    backgroundColor: "#E05C5C",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 16,
  },
  deleteActionText: {
    color: "#fff",
    fontFamily: fonts.extra,
    fontSize: 13,
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
