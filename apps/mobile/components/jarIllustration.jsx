import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "../constants/colors";

export const JarIllustration = () => {
  return (
    <View style={styles.jarsContainer}>
      <Jar
        color={colors.needs}
        lightColor={colors.needsLight}
        fillHeight="70%"
        label="NEEDS"
      />
      <Jar
        color={colors.goals}
        lightColor={colors.goalsLight}
        fillHeight="40%"
        label="GOALS"
      />
      <Jar
        color={colors.fun}
        lightColor={colors.funLight}
        fillHeight="55%"
        label="FUN"
      />
    </View>
  );
};

const Jar = ({ color, lightColor, fillHeight, label }) => {
  return (
    <View style={styles.jarWrapper}>
      {/* Lid */}
      <View style={[styles.jarLid, { backgroundColor: lightColor }]} />

      {/* Body */}
      <View style={[styles.jarBody, { backgroundColor: `${color}15` }]}>
        <View
          style={[
            styles.jarFill,
            { backgroundColor: color, height: fillHeight },
          ]}
        />
      </View>

      <Text style={styles.jarLabel}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  jarsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 20,
    marginVertical: 24,
  },
  jarWrapper: {
    alignItems: "center",
  },
  jarLid: {
    width: 70,
    height: 14,
    borderRadius: 7,
    marginBottom: 2,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.06)",
    zIndex: 1,
  },
  jarBody: {
    width: 60,
    height: 80,
    borderRadius: 10,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.06)",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  jarFill: {
    width: "100%",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  jarLabel: {
    fontFamily: fonts.extra,
    fontSize: 11,
    color: colors.textMid,
    letterSpacing: 1,
  },
});
