import { Stack } from "expo-router";
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
import { View, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { colors } from "../constants/colors";

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
    <Suspense fallback={<Loading />}>
      <GestureHandlerRootView>
        <Stack screenOptions={{ headerShown: false }} />
      </GestureHandlerRootView>
    </Suspense>
  );
}
