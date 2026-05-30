import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../constants/colors";

// Note this is just for those without cellular OR wifi
export default function OfflineBanner({ text }) {
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerText}>
        {text ?? `You're offline - some features may not work`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.needsLight,
    padding: 16,
    position: "absolute",
    top: 60,
    zIndex: 100,
    alignSelf: "center",
    borderRadius: 20,
    width: "auto",
    marginHorizontal: 32,
  },
  bannerText: {
    color: colors.textDark,
    fontFamily: fonts.extra,
  },
});
