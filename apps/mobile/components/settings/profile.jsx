import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../../constants/colors";

export default function ProfileCard({
  displayName,
  email,
  setEditNameVisible,
  setChangePasswordVisible,
  connected,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.label}>Profile</Text>
        <View style={styles.topWrapper}>
          <View>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.email}>{email}</Text>
          </View>

          <Text
            onPress={() => connected && setEditNameVisible(true)}
            style={[styles.actionButton, !connected && { opacity: 0.5 }]}
          >
            Edit
          </Text>
        </View>

        <View style={styles.bottomWrapper}>
          <View>
            <Text>Password</Text>
            <Text>••••••••</Text>
          </View>
          <Text
            onPress={() => connected && setChangePasswordVisible(true)}
            style={[styles.actionButton, !connected && { opacity: 0.5 }]}
          >
            Change
          </Text>
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
  displayName: {
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  email: {
    fontFamily: fonts.semi,
    fontSize: 14,
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
});
