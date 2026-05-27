import { View, StyleSheet } from "react-native";

import { colors, fonts } from "../constants/colors";

export const Steps = ({ currentStep }) => {
  const steps = [1, 2, 3, 4, 5];
  return (
    <View style={styles.stepsWrapper}>
      {steps.map((step) => (
        <View
          key={step}
          style={[
            styles.step,
            currentStep == step && styles.activeStep,
            step <= currentStep && { backgroundColor: colors.needs },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  stepsWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 6,
    marginTop: "auto",
    marginBottom: 16,
  },
  step: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: colors.border,
  },
  activeStep: {
    width: 30,
    height: 10,
    borderRadius: 10,
  },
});
