import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { colors, fonts } from "../../constants/colors";
import { BlurView } from "expo-blur";
import { formatCurrency } from "../../lib/formatCurrency";

export default function IncomeEditModal({
  visible,
  onClose,
  onSaved,
  currentIncome,
}) {
  const [income, setIncome] = useState(String(currentIncome || ""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    if (!income || Number(income) <= 0) {
      setError("Enter a valid income.");
      return;
    }
    setLoading(true);
    try {
      const { patch } = await import("@jarly/api-client");
      await patch("/api/v1/users/me", {
        monthlyIncomeCents: Number(income) * 100,
      });
      onSaved();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />

        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.container}>
            <View style={styles.handle} />
            <Text style={styles.title}>Monthly income</Text>
            <Text style={styles.subtitle}>Changes take effect next month</Text>

            <Text style={styles.inputLabel}>New amount</Text>
            <View style={styles.inputRow}>
              <Text style={styles.dollar}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={income}
                onChangeText={(v) => {
                  setIncome(v);
                  setError(null);
                }}
                keyboardType="numeric"
                onKeyPress={(e) => {
                  if (["e", "E", "+", "-", "."].includes(e.nativeEvent.key))
                    e.preventDefault?.();
                }}
                autoFocus
              />
            </View>
            <Text style={styles.currentLabel}>
              Currently ${formatCurrency(currentIncome)}/month
            </Text>

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
              style={[styles.saveBtn, loading && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveBtnText}>
                {loading ? "Updating..." : "Update income"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  sheetWrapper: {
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    padding: 24,
    paddingTop: 20,
    paddingBottom: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#E8E0D8",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    fontFamily: fonts.black,
    fontSize: 22,
    color: colors.textDark,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.semi,
    fontSize: 13,
    color: colors.textMid,
    marginBottom: 24,
  },
  inputLabel: {
    fontFamily: fonts.extra,
    fontSize: 11,
    color: colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  inputRow: {
    backgroundColor: "#FDFAF7",
    borderRadius: 12,
    padding: 13,
    borderWidth: 2,
    borderColor: colors.needs,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  dollar: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.textMid,
  },
  amountInput: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.textDark,
    flex: 1,
  },
  currentLabel: {
    fontFamily: fonts.semi,
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 24,
  },
  error: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: "#E05C5C",
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: colors.needs,
    borderRadius: 14,
    padding: 15,
    alignItems: "center",
    marginTop: 8,
    shadowColor: colors.needs,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  saveBtnText: {
    color: "#fff",
    fontFamily: fonts.extra,
    fontSize: 16,
  },
});
