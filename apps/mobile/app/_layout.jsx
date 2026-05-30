import { Stack } from "expo-router";
import * as Updates from "expo-updates";
import { useFonts } from "expo-font";
import { Suspense } from "react";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from "@expo-google-fonts/nunito";
import { FredokaOne_400Regular } from "@expo-google-fonts/fredoka-one";
import { VarelaRound_400Regular } from "@expo-google-fonts/varela-round";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as React from "react";
import { LinearGradient } from "expo-linear-gradient";

import ErrorBoundary from "../components/errorBoundary";
import { colors, fonts } from "../constants/colors";
import { JarIllustration } from "../components/jarIllustration";

function Loading() {
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

export default function Layout() {
  const [fontsLoaded] = useFonts({
    "Nunito-Regular": Nunito_400Regular,
    "Nunito-SemiBold": Nunito_600SemiBold,
    "Nunito-Bold": Nunito_700Bold,
    "Nunito-ExtraBold": Nunito_800ExtraBold,
    "Nunito-Black": Nunito_900Black,
    FredokaOne: FredokaOne_400Regular,
    VarelaRound: VarelaRound_400Regular,
  });

  if (!fontsLoaded) {
    return <Loading />;
  }

  return (
    <ErrorBoundary fallback={<FallbackComponent />}>
      <Suspense fallback={<Loading />}>
        <GestureHandlerRootView>
          <Stack screenOptions={{ headerShown: false }} />
        </GestureHandlerRootView>
      </Suspense>
    </ErrorBoundary>
  );
}

const FallbackComponent = () => {
  return (
    <LinearGradient
      colors={["#FFF0E8", "#FFF8F0", "#E8F7F0"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.wrongText}>Something went wrong</Text>

        <JarIllustration />

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={async () => await Updates.reloadAsync()}
        >
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: colors.bg,
  },
  wrongText: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.textMid,
    lineHeight: 38,
    textAlign: "center",
  },
  refreshButton: {
    backgroundColor: colors.needs,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  refreshText: {
    fontFamily: fonts.black,
    fontSize: 16,
    color: colors.textDark,
    textAlign: "center",
    textTransform: 'uppercase'
  },
});
