import { StyleSheet, Text, View } from "react-native";
import { fonts } from "../constants/colors";

export default function ErrorBanner() {
  return (
    <View style={styles.errorBanner}>
      <Text style={styles.errorBannerText}>
        Something went wrong. Pull down to try again.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorBanner: {
    backgroundColor: "#FDECEA",
    borderRadius: 10,
    padding: 12,
    marginTop: 60,
    marginHorizontal: 32,
    marginBottom: 8,
  },
  errorBannerText: {
    color: "#E05C5C",
    fontFamily: fonts.semi,
    fontSize: 13,
  },
});
