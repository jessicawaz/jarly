import Octicons from "@expo/vector-icons/Octicons";
import { LinearGradient } from "expo-linear-gradient";
import { DateTime } from "luxon";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { del, get } from "@jarly/api-client";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { colors, fonts } from "../constants/colors";
import useUserStore from "../store/userStore";
import BottomNav from "../components/bottomNav";
import { getCurrentMonthYear } from "../lib/dates";
import { jars } from "../lib/jars";
import NotificationsCard from "../components/settings/notifications";
import BudgetCard from "../components/settings/budget";
import ProfileCard from "../components/settings/profile";
import IncomeEditModal from "../components/settings/incomeEditModal";
import NameEditModal from "../components/settings/nameEditModal";
import PasswordChangeModal from "../components/settings/passwordChangeModal";
import JarSplitModal from "../components/settings/jarSplitEditModal";
import { signOut } from "@jarly/api-client/auth";
import { useRouter } from "expo-router";
import DeleteAccountModal from "../components/settings/deleteAccountModal";
import { useNetInfo } from "@react-native-community/netinfo";
import OfflineBanner from "../components/offlineBanner";

export default function Settings() {
  const router = useRouter();
  const netInfo = useNetInfo();

  const { user, fetchUser, budget } = useUserStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyRecapEnabled, setMonthlyRecapEnabled] = useState(true);
  const [jarWarningsEnabled, setJarWarningsEnabled] = useState(true);
  const [goalMilestonesEnabled, setGoalMilestonesEnabled] = useState(true);
  const [editNameVisible, setEditNameVisible] = useState(false);
  const [editIncomeVisible, setEditIncomeVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [editJarSplitVisible, setEditJarSplitVisible] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    async function load() {
      await fetchUser();
    }
    load();
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <>
      <ScrollView>
        <LinearGradient
          colors={["#FFF0E8", "#FFF8F0", "#E8F7F0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.container}
        >
          {!netInfo.isConnected && <OfflineBanner />}

          <View style={styles.content}>
            <Text style={styles.title}>Your Account</Text>

            <View style={styles.cardsWrapper}>
              <ProfileCard
                displayName={user.displayName}
                email={user.email}
                setEditNameVisible={setEditNameVisible}
                setChangePasswordVisible={setChangePasswordVisible}
                connected={netInfo.isConnected}
              />

              <BudgetCard
                budget={budget}
                setEditIncomeVisible={setEditIncomeVisible}
                setEditJarSplitVisible={setEditJarSplitVisible}
                connected={netInfo.isConnected}
              />

              <NotificationsCard
                jarWarningsEnabled={jarWarningsEnabled}
                setJarWarningsEnabled={setJarWarningsEnabled}
                monthlyRecapEnabled={monthlyRecapEnabled}
                setMonthlyRecapEnabled={setMonthlyRecapEnabled}
                goalMilestonesEnabled={goalMilestonesEnabled}
                setGoalMilestonesEnabled={setGoalMilestonesEnabled}
                connected={netInfo.isConnected}
              />

              {/* Log out button */}
              <TouchableOpacity
                style={[
                  styles.logoutButton,
                  !netInfo.isConnected && { opacity: 0.5 },
                ]}
                disabled={!netInfo.isConnected}
                onPress={handleLogout}
              >
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>

              {/* Delete account button */}
              <TouchableOpacity
                style={[
                  styles.deleteAccountButton,
                  !netInfo.isConnected && { opacity: 0.5 },
                ]}
                disabled={!netInfo.isConnected}
                onPress={() => setShowDeleteModal(true)}
              >
                <Text style={styles.deleteAccountText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>

      <NameEditModal
        visible={editNameVisible}
        onClose={() => setEditNameVisible(false)}
        onSaved={() => fetchUser()}
        currentName={user?.displayName}
      />
      <IncomeEditModal
        visible={editIncomeVisible}
        onClose={() => setEditIncomeVisible(false)}
        onSaved={() => fetchUser()}
        currentIncome={(budget?.incomeCents || 0) / 100}
      />
      <PasswordChangeModal
        visible={changePasswordVisible}
        onClose={() => setChangePasswordVisible(false)}
      />
      <JarSplitModal
        visible={editJarSplitVisible}
        onClose={() => setEditJarSplitVisible(false)}
        onSaved={() => fetchUser()}
        currentNeedsPct={budget?.needsPct}
        currentGoalsPct={budget?.goalsPct}
        currentFunPct={budget?.funPct}
      />

      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />

      <BottomNav currentPage={"Settings"} />
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
    fontSize: 28,
    color: colors.textDark,
    lineHeight: 38,
    marginBottom: 8,
  },
  cardsWrapper: {
    gap: 16,
    marginBottom: 16,
  },
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
  budgetLabel: {
    fontFamily: fonts.extra,
    color: colors.textMid,
    fontSize: 14,
  },
  income: {
    fontFamily: fonts.extra,
    fontSize: 18,
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
  logoutButton: {
    backgroundColor: `${colors.needs}25`,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: `${colors.needs}25`,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 4,
  },
  logoutText: {
    color: colors.needs,
    fontSize: 18,
    fontFamily: fonts.extra,
    letterSpacing: 1.1,
  },
  deleteAccountButton: {
    backgroundColor: "transparent",
    alignItems: "center",
  },
  deleteAccountText: {
    color: colors.textLight,
    fontSize: 14,
    fontFamily: fonts.extra,
    letterSpacing: 1.1,
  },
});
