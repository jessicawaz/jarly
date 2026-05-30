import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import Octicons from "@expo/vector-icons/Octicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Entypo from "@expo/vector-icons/Entypo";
import AntDesign from "@expo/vector-icons/AntDesign";
import _, { reduce } from "lodash";
import { Swipeable } from "react-native-gesture-handler";

import { colors, fonts } from "../constants/colors";
import { useEffect, useState } from "react";
import { del, get, post } from "@jarly/api-client";
import { jars } from "../lib/jars";
import { formatCurrency } from "../lib/formatCurrency";
import useUserStore from "../store/userStore";
import useSpendsStore from "../store/spendsStore";
import SpendFormModal from "../components/spendFormModal";
import { useNetInfo } from "@react-native-community/netinfo";

export default function SpendLogs() {
  const router = useRouter();
  const { budget } = useUserStore();
  const { spends, fetchSpends } = useSpendsStore();
  const netInfo = useNetInfo();

  const [spendEditing, setSpendEditing] = useState(null);

  const totalSpent = _.sumBy(spends, "amountCents") / 100;
  const totalRemaining = budget?.incomeCents / 100 - totalSpent;

  if (!spends?.length) {
    return (
      <View style={styles.spendLogWrapper}>
        <Text style={styles.nothingLabel}>Nothing logged yet</Text>
        <Text style={styles.nothingHint}>
          Tap the + button to log your first spend
        </Text>
      </View>
    );
  }

  const handleDelete = async (spendId) => {
    try {
      await del(`/api/v1/spends/${spendId}`);
      fetchSpends();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.spendLogWrapper}>
      <Text style={styles.label}>Spend Log</Text>

      <View style={styles.spendsWrapper}>
        {spends?.map((spend, i) => {
          const jarBelongsTo = jars.find((jar) => jar.name === spend.jar);

          return (
            <Swipeable
              key={`spend-${i}`}
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
                  onPress={() => handleDelete(spend.id)}
                >
                  <Text style={styles.deleteActionText}>Delete</Text>
                </TouchableOpacity>
              )}
            >
              <TouchableOpacity
                style={styles.spendCard}
                disabled={!netInfo.isConnected}
                onPress={() => {
                  setSpendEditing(spend);
                }}
              >
                <View style={styles.spendTypeWrapper}>
                  <View
                    style={[
                      styles.iconWrapper,
                      { backgroundColor: jarBelongsTo.color },
                    ]}
                  >
                    <View style={styles.icon}>{jarBelongsTo.icon}</View>
                  </View>

                  <Text style={styles.spendLabel}>{spend.label}</Text>
                </View>

                <Text style={styles.amountSpent}>
                  ${formatCurrency(spend.amountCents / 100)}
                </Text>
              </TouchableOpacity>
            </Swipeable>
          );
        })}
      </View>

      <View style={styles.summaryWrapper}>
        <View style={styles.spendsSummary}>
          <Text style={[styles.label, { textAlign: "left" }]}>Total Spent</Text>
          <Text style={[styles.totalSpent, { color: colors.needs }]}>
            -${formatCurrency(totalSpent)}
          </Text>
        </View>

        <View style={styles.spendsSummary}>
          <Text style={[styles.label, { textAlign: "left" }]}>Remaining</Text>
          <Text style={[styles.totalSpent]}>
            ${formatCurrency(totalRemaining)}
          </Text>
        </View>
      </View>

      <SpendFormModal
        visible={spendEditing !== null}
        onClose={() => setSpendEditing(null)}
        onSaved={() => {
          setSpendEditing(null);
          fetchSpends();
        }}
        prefilledData={spendEditing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  spendLogWrapper: { marginTop: 16 },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textMid,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textAlign: "center",
  },
  spendsWrapper: {
    gap: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 16,
  },
  spendCard: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    padding: 16,
  },
  iconWrapper: {
    justifyContent: "center",
    padding: 10,
    margin: "auto",
    marginLeft: 0,
    marginRight: 16,
    borderRadius: 10,
  },
  icon: {
    height: 20,
    width: 20,
  },
  spendTypeWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  spendLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textMid,
    letterSpacing: 1.2,
    textTransform: "capitalize",
  },
  amountSpent: {
    fontFamily: fonts.display,
    fontSize: 14,
  },
  summaryWrapper: {
    borderTopColor: colors.border,
    borderTopWidth: 2,
    paddingTop: 8,
    marginTop: 8,
  },
  spendsSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalSpent: {
    fontFamily: fonts.display,
    fontSize: 14,
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
