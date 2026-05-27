import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { colors, fonts } from "../../constants/colors";
import { JarIllustration } from "../../components/jarIllustration";
import { Steps } from "../../components/steps";
import { LinearGradient } from "expo-linear-gradient";

export default function Welcome() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#FFF0E8", "#FFF8F0", "#E8F7F0"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <JarIllustration />

        <Text style={styles.title}>Budgeting,{"\n"}finally easy.</Text>
        <Text style={styles.subtitle}>
          No spreadsheets. No jargon. Just 3 jars and your money.
        </Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push("/onboarding/income")}
        >
          <Text style={styles.ctaButtonText}>Let's go →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ghostButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.ghostButtonText}>I already have an account</Text>
        </TouchableOpacity>
      </View>

      <Steps currentStep={1} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 32,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 36,
    color: colors.textDark,
    marginBottom: 8,
    fontFamily: fonts.bold,
    textAlign: "center",
    lineHeight: 38,
  },
  subtitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.textMid,
    marginBottom: 36,
    textAlign: "center",
    maxWidth: "75%",
    marginLeft: "auto",
    marginRight: "auto",
    lineHeight: 25,
  },
  ctaButton: {
    backgroundColor: colors.needs,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: colors.needs,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    width: 280,
  },
  ctaButtonText: {
    color: "white",
    fontSize: 17,
    fontFamily: fonts.extra,
  },
  ghostButton: {
    background: "transparent",
    border: "none",
    padding: 0,
    marginTop: 16,
  },
  ghostButtonText: {
    fontFamily: fonts.display,
    color: colors.textMid,
    fontSize: 14,
    textAlign: "center",
  },
});
