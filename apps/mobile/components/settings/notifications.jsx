import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { colors, fonts } from "../../constants/colors";
import { useEffect } from "react";
import { get, patch } from "@jarly/api-client";

export default function NotificationsCard({
  monthlyRecapEnabled,
  setMonthlyRecapEnabled,
  connected,
}) {
  useEffect(() => {
    async function getNotifs() {
      // get notif preferences & set toggle states
      try {
        const { data } = await get("/api/v1/users/notifications");

        setMonthlyRecapEnabled(data?.monthlyRecap);
      } catch (err) {
        console.error(err);
      }
    }

    getNotifs();
  }, []);

  const handleToggleNotif = async (notif, state) => {
    // patch with new states
    try {
      let body;

      switch (notif) {
        case "monthly-recap":
          setMonthlyRecapEnabled(state);
          body = { monthlyRecap: state };
          break;
      }

      await patch("/api/v1/users/notifications", body);
    } catch (err) {
      switch (notif) {
        case "monthly-recap":
          setMonthlyRecapEnabled(!state);
          break;
      }
      console.error(err);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.label}>Notifications</Text>
        <View style={styles.notifsWrapper}>
          <View style={styles.notifWrapper}>
            <View>
              <Text style={styles.notifLabel}>Monthly Recap</Text>
              <Text style={styles.notifDesc}>End of month summary</Text>
            </View>

            <Switch
              trackColor={{ false: "#767577", true: colors.needs }}
              thumbColor={"#fff"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() =>
                connected &&
                handleToggleNotif("monthly-recap", !monthlyRecapEnabled)
              }
              value={monthlyRecapEnabled}
            />
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
  notifsWrapper: {
    gap: 8,
  },
  notifWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomColor: colors.textLight,
    borderBottomWidth: 0.3,
  },
  notifLabel: {
    fontFamily: fonts.extra,
    color: colors.textMid,
    fontSize: 16,
  },
  notifDesc: {
    fontFamily: fonts.semi,
    color: colors.textMid,
    fontSize: 13,
  },
});
