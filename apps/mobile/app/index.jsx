import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

import { getToken } from "@jarly/api-client/auth";
import { patch } from "@jarly/api-client";
import { colors } from "../constants/colors";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const token = await getToken();
      if (token) {
        await registerForPushNotifications();
        router.replace("/home");
      } else {
        router.replace("/onboarding/welcome");
      }
    }
    checkAuth();
  }, []);

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

async function registerForPushNotifications() {
  try {
    // Check/request notif permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Declined push notifs
    if (finalStatus !== "granted") {
      return;
    }
    // Get expo push token & send to backend (patch to push-token)
    const { data: pushToken } = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    });

    await patch("/api/v1/users/push-token", { pushToken });
  } catch (err) {
    console.error(err);
  }
}
