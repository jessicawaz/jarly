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

export default function SpendHistoryRow({ spend }) {
  const router = useRouter();

  const jarBelongsTo = jars.find((jar) => jar.name === spend.jar);

  return (
    <View style={styles.spendCard}>
      <View style={styles.spendTypeWrapper}>
        <View
          style={[styles.iconWrapper, { backgroundColor: jarBelongsTo.color }]}
        >
          <View style={styles.icon}>{jarBelongsTo.icon}</View>
        </View>

        <Text style={styles.spendLabel}>{spend.label}</Text>
      </View>

      <Text style={styles.amountSpent}>
        ${formatCurrency(spend.amountCents / 100)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textMid,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textAlign: "center",
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
