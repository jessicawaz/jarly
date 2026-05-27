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
import zxcvbn from "zxcvbn";
import { BlurView } from "expo-blur";
import { colors, fonts } from "../../constants/colors";

export default function PasswordChangeModal({ visible, onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordScore, setPasswordScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleNewPassword = (val) => {
    setNewPassword(val);
    setPasswordScore(val.length > 0 ? zxcvbn(val).score : null);
  };

  const handleSave = async () => {
    if (!currentPassword) {
      setError("Enter your current password.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const { post } = await import("@jarly/api-client");
      await post("/api/v1/auth/change-password", {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordScore(null);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const barColor =
    passwordScore === null
      ? colors.border
      : passwordScore <= 1
        ? "#E05C5C"
        : passwordScore === 2
          ? colors.fun
          : colors.goals;

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
            <Text style={styles.title}>Change password</Text>

            <Text style={styles.inputLabel}>Current password</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={(v) => {
                setCurrentPassword(v);
                setError(null);
              }}
              secureTextEntry
              autoComplete="current-password"
              placeholder="••••••••"
              placeholderTextColor={colors.textLight}
            />

            <Text style={styles.inputLabel}>New password</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={handleNewPassword}
              secureTextEntry
              autoComplete="new-password"
              placeholder="••••••••"
              placeholderTextColor={colors.textLight}
            />

            {passwordScore !== null && (
              <View style={styles.strengthBars}>
                {[0, 1, 2, 3].map((s) => (
                  <View
                    key={s}
                    style={[
                      styles.strengthBar,
                      s <= passwordScore && { backgroundColor: barColor },
                    ]}
                  />
                ))}
              </View>
            )}

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
              style={[styles.saveBtn, loading && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveBtnText}>
                {loading ? "Updating..." : "Update password"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  input: {
    backgroundColor: "#FDFAF7",
    borderRadius: 12,
    padding: 13,
    borderWidth: 2,
    borderColor: colors.border,
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textDark,
    marginBottom: 16,
  },
  strengthBars: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 20,
    marginTop: -8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
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
