import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Entypo from "@expo/vector-icons/Entypo";

import { colors, fonts } from "../constants/colors";
import { useEffect, useState } from "react";
import { get } from "@jarly/api-client";
import { jars } from "../lib/jars";

export default function SpendForm({
  onSave,
  onClose,
  prefilledData = {},
  loading,
  visible,
}) {
  const [amount, setAmount] = useState("");
  const [spendLabel, setSpendLabel] = useState("");
  const [jarSelected, setJarSelected] = useState(null);
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (jarSelected === "Goals") {
      get("/api/v1/goals").then(({ data }) => setGoals(data));
    }
  }, [jarSelected]);

  useEffect(() => {
    if (prefilledData?.id) {
      setAmount(
        prefilledData.amountCents
          ? String(prefilledData.amountCents / 100)
          : "",
      );
      setSpendLabel(prefilledData.label ?? "");
      setJarSelected(prefilledData.jar ?? null);
      setSelectedGoal(prefilledData.goalId ?? null);
    } else {
      setAmount("");
      setSpendLabel("");
      setJarSelected(null);
      setSelectedGoal(null);
      setError(null);
    }
  }, [visible]);

  const handleSave = () => {
    if (!jarSelected) {
      setError("Select a jar.");
      return;
    }
    if (!amount) {
      setError("Enter an amount.");
      return;
    }
    onSave({
      amount,
      label: spendLabel,
      jar: jarSelected,
      goalId: selectedGoal,
    });
  };

  return (
    <ScrollView>
      <View style={styles.content}>
        <View style={styles.topContent}>
          <Text style={styles.welcomeMsg}>I spent...</Text>
          <View style={styles.close}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.dollar}>$</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={amount ? String(amount) : amount}
            onChangeText={setAmount}
            placeholder="0"
          />
        </View>

        <Text style={styles.label}>How much did you spend?</Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            keyboardType="default"
            value={spendLabel}
            onChangeText={setSpendLabel}
            placeholder="Rent"
          />
        </View>
        <Text style={styles.label}>Name this spend?</Text>

        <View style={styles.jarsWrapper}>
          <Text style={styles.jarChoiceText}>
            Which jar does this come from?
          </Text>

          {jars.map((jar, i) => {
            return (
              <TouchableOpacity
                key={`jar-${i}`}
                style={[
                  styles.jarCard,
                  jarSelected === jar.name && {
                    backgroundColor: jar.light,
                    borderColor: jar.color,
                    borderWidth: 3,
                  },
                  jarSelected !== jar.name && {
                    borderColor: "transparent",
                    borderWidth: 3,
                  },
                ]}
                onPress={() => setJarSelected(jar.name)}
              >
                <View style={styles.jarContent}>
                  <View style={styles.jarTypeWrapper}>
                    <View
                      style={[
                        styles.iconWrapper,
                        { backgroundColor: jar.color },
                      ]}
                    >
                      <View style={styles.icon}>{jar.icon}</View>
                    </View>

                    <View style={styles.nameAndIndicatorWrapper}>
                      <Text
                        style={[
                          styles.jarLabel,
                          jarSelected === jar.name && {
                            color: jar.color,
                          },
                        ]}
                      >
                        {jar.name} Jar
                      </Text>

                      <Text style={styles.jarDesc}>{jar.desc}</Text>
                    </View>
                  </View>

                  <Text style={styles.checkmark}>
                    {jarSelected === jar.name ? (
                      <Entypo name="check" size={24} color={jar.color} />
                    ) : (
                      ""
                    )}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {jarSelected === "Goals" && goals.length > 0 && (
          <View style={styles.goalPickerWrapper}>
            <Text style={styles.goalPickerLabel}>Which goal?</Text>
            {goals.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                onPress={() => setSelectedGoal(goal.id)}
                style={[
                  styles.goalPickerItem,
                  selectedGoal === goal.id && {
                    borderColor: colors.goals,
                    borderWidth: 2,
                  },
                ]}
              >
                <Text style={styles.goalPickerName}>{goal.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Log it</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    marginTop: 60,
    padding: 32,
    paddingTop: 0,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 32,
    backgroundColor: colors.bg,
  },
  topContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  welcomeMsg: {
    fontFamily: fonts.black,
    fontSize: 32,
    lineHeight: 38,
    marginBottom: 8,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.textMid,
  },
  spentWrapper: {
    alignItems: "center",
  },
  spentInput: {
    fontWeight: 600,
    fontSize: 30,
    color: colors.textMid,
    fontFamily: fonts.black,
  },
  inputCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 28,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginBottom: 8,
  },
  dollar: {
    fontSize: 30,
    color: colors.textMid,
    fontFamily: fonts.display,
  },
  input: {
    fontSize: 52,
    color: colors.textDark,
    fontFamily: fonts.display,
    minWidth: 80,
    textAlign: "left",
  },
  textInput: {
    fontSize: 30,
    color: colors.textDark,
    fontFamily: fonts.display,
    minWidth: 80,
    textAlign: "center",
    marginTop: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textMid,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 8,
  },
  jarsWrapper: {
    gap: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  jarCard: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.white,
  },
  jarContent: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },
  iconWrapper: {
    justifyContent: "center",
    padding: 10,
    margin: "auto",
    marginLeft: 0,
    marginRight: 16,
    borderRadius: 10,
  },
  icon: {
    height: 20,
    width: 20,
  },
  jarLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textMid,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  jarDesc: {
    color: colors.textMid,
    marginTop: 4,
    fontFamily: fonts.display,
  },
  checkmark: {
    textAlign: "right",
    fontFamily: fonts.black,
    color: colors.textMid,
    marginTop: "auto",
    marginBottom: "auto",
  },
  jarTypeWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  jarChoiceText: {
    fontWeight: 800,
    fontSize: 11,
    color: colors.textMid,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  goalPickerWrapper: {
    marginTop: 8,
    marginBottom: 16,
  },
  goalPickerLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textMid,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  goalPickerItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  goalPickerName: {
    fontFamily: fonts.extra,
    fontSize: 14,
    color: colors.textDark,
  },
  button: {
    backgroundColor: colors.needs,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: { color: colors.white, fontSize: 17, fontWeight: "800" },
  errorText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: "#E05C5C",
    textAlign: "center",
    marginBottom: 8,
  },
});
