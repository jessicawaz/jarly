import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import Octicons from "@expo/vector-icons/Octicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

import useOnboardingStore from "@jarly/store";
import { colors, fonts } from "../../constants/colors";
import { Steps } from "../../components/steps";
import { formatCurrency } from "../../lib/formatCurrency";

const jars = [
  {
    name: "Needs",
    desc: "Stuff you have to pay",
    color: colors.needs,
    light: colors.needsLight,
    icon: <FontAwesome6 name="person-shelter" size={24} color="black" />,
  },
  {
    name: "Goals",
    desc: "What you're saving for",
    color: colors.goals,
    light: colors.goalsLight,
    icon: <Octicons name="goal" size={24} color="black" />,
  },
  {
    name: "Fun",
    desc: "Yours to spend freely",
    color: colors.fun,
    light: colors.funLight,
    icon: (
      <MaterialCommunityIcons name="party-popper" size={24} color="black" />
    ),
  },
];

export default function Jars() {
  const router = useRouter();
  const income = useOnboardingStore((s) => s.income);
  const suggestedGoalsPct = useOnboardingStore((s) => s.suggestedGoalsPct);

  const [split, setSplit] = useState(() => {
    const goalsPct = Number(suggestedGoalsPct) || 20;
    const remaining = 100 - goalsPct;
    const needsPct = Math.round(remaining * 0.63);
    const funPct = remaining - needsPct;
    return [needsPct, goalsPct, funPct];
  });

  const handleSliderChange = (index, newValue) => {
    const clamped = Math.min(100, Math.max(0, Math.round(newValue)));
    const delta = clamped - split[index];
    const others = [0, 1, 2].filter((i) => i !== index);
    const otherTotal = others.reduce((sum, i) => sum + split[i], 0);

    const newSplit = [...split];
    newSplit[index] = clamped;

    if (otherTotal === 0) {
      others.forEach((i) => {
        newSplit[i] = Math.max(0, Math.round(-delta / 2));
      });
    } else {
      others.forEach((i) => {
        const proportion = split[i] / otherTotal;
        newSplit[i] = Math.max(0, Math.round(split[i] - delta * proportion));
      });
    }

    const total = newSplit.reduce((a, b) => a + b, 0);
    const diff = 100 - total;
    if (diff !== 0) {
      const largestOther = others.reduce((a, b) =>
        newSplit[a] >= newSplit[b] ? a : b,
      );
      newSplit[largestOther] += diff;
    }

    setSplit(newSplit);
  };

  const handleContinue = () => {
    const needsAmt = Math.round((split[0] / 100) * income);
    const goalsAmt = Math.round((split[1] / 100) * income);
    const funAmt = Math.round((split[2] / 100) * income);

    useOnboardingStore.setState({
      needsPct: split[0],
      goalsPct: split[1],
      funPct: split[2],
      needsAmt,
      goalsAmt,
      funAmt,
    });

    router.push("/onboarding/done");
  };

  return (
    <LinearGradient
      colors={["#FFF0E8", "#FFF8F0", "#E8F7F0"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Split your money{"\n"}between the jars</Text>
        <Text style={styles.subtitle}>
          Slide to adjust. They always add up to 100%.
        </Text>

        <View style={styles.jarsList}>
          {jars.map((jar, i) => {
            const pct = split[i];
            const amount = Math.round((pct / 100) * income);

            return (
              <View key={i} style={styles.jarCard}>
                <View style={styles.jarTop}>
                  <View style={styles.jarInfo}>
                    <Text style={styles.jarName}>{jar.name} Jar</Text>
                    <Text style={styles.jarDesc}>{jar.desc}</Text>
                  </View>
                  <View style={styles.jarAmountWrapper}>
                    <Text style={[styles.jarAmount, { color: jar.color }]}>
                      ${formatCurrency(amount)}
                    </Text>
                    <Text style={styles.jarPct}>{pct}%</Text>
                  </View>
                </View>

                <View style={styles.sliderTrack}>
                  <View
                    style={[
                      styles.sliderFill,
                      { width: `${pct}%`, backgroundColor: jar.color },
                    ]}
                  />
                </View>

                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  step={1}
                  value={pct}
                  onValueChange={(val) => handleSliderChange(i, val)}
                  minimumTrackTintColor="transparent"
                  maximumTrackTintColor="transparent"
                  thumbTintColor={jar.color}
                />
              </View>
            );
          })}
        </View>

        {/* Bottom section */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.ctaButton} onPress={handleContinue}>
            <Text style={styles.ctaButtonText}>Looks good →</Text>
          </TouchableOpacity>

          <View style={styles.secondaryRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push("/onboarding/goal")}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Steps currentStep={4} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  stepTag: {
    fontFamily: fonts.extra,
    fontSize: 11,
    color: colors.needs,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 10,
  },
  title: {
    fontFamily: fonts.black,
    fontSize: 32,
    color: colors.textDark,
    lineHeight: 38,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textMid,
    lineHeight: 22,
    marginBottom: 24,
  },
  jarsList: {
    gap: 12,
  },
  jarCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  jarTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  jarInfo: {
    flex: 1,
  },
  jarName: {
    fontFamily: fonts.extra,
    fontSize: 16,
    color: colors.textDark,
  },
  jarDesc: {
    fontFamily: fonts.semi,
    fontSize: 12,
    color: colors.textMid,
    marginTop: 2,
  },
  jarAmountWrapper: {
    alignItems: "flex-end",
  },
  jarAmount: {
    fontFamily: fonts.display,
    fontSize: 20,
  },
  jarPct: {
    fontFamily: fonts.extra,
    fontSize: 12,
    color: colors.textMid,
    marginTop: 2,
  },
  sliderTrack: {
    height: 8,
    backgroundColor: "#F0EBE3",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  sliderFill: {
    height: "100%",
    borderRadius: 4,
  },
  slider: {
    width: "100%",
    height: 30,
    marginTop: -4,
  },
  // Bottom section
  bottomSection: {
    padding: 24,
    paddingBottom: 24,
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
    marginBottom: 12,
  },
  ctaButtonText: {
    color: colors.white,
    fontSize: 17,
    fontFamily: fonts.extra,
  },
  secondaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginBottom: 16,
  },
  backButton: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButtonText: {
    fontFamily: fonts.extra,
    fontSize: 14,
    color: colors.textMid,
  },
});
