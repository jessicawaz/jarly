import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import Slider from "@react-native-community/slider";
import { BlurView } from "expo-blur";
import { colors, fonts } from "../../constants/colors";
import { del, patch } from "@jarly/api-client";
import { signOut } from "@jarly/api-client/auth";
import { router } from "expo-router";

export default function DeleteAccountModal({ visible, onClose }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await del("/api/v1/auth/delete", { method: "DELETE" });
      await signOut();
      onClose();
      router.replace("/onboarding/welcome");
    } catch (err) {
      setError("Failed to delete account. Please try again.");
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
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.container}>
            <Text style={styles.title}>
              Are you sure you want to delete your account?
            </Text>
            <Text style={styles.subtitle}>This cannot be undone.</Text>
            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
              style={[styles.saveBtn, loading && { opacity: 0.6 }]}
              onPress={handleDeleteAccount}
              disabled={loading}
            >
              <Text style={styles.saveBtnText}>
                {loading ? "Deleting..." : "Yes, Delete"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={onClose}>
              <Text style={styles.saveBtnText}>No, Go Back</Text>
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
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.semi,
    fontSize: 13,
    color: colors.textMid,
    marginBottom: 20,
  },
  jarsList: {
    marginBottom: 20,
    gap: 12,
  },
  jarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  jarInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  jarDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  jarDotInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  jarName: {
    fontFamily: fonts.extra,
    fontSize: 14,
    color: colors.textDark,
  },
  jarDesc: {
    fontFamily: fonts.semi,
    fontSize: 11,
    color: colors.textMid,
  },
  jarPct: {
    fontFamily: fonts.display,
    fontSize: 18,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  sliderLabel: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    width: 56,
    alignItems: "center",
  },
  sliderLabelText: {
    fontFamily: fonts.extra,
    fontSize: 11,
  },
  sliderWrapper: {
    flex: 1,
    height: 30,
    justifyContent: "center",
  },
  sliderTrack: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: "#F0EBE3",
    borderRadius: 4,
    overflow: "hidden",
  },
  sliderFill: {
    height: "100%",
    borderRadius: 4,
  },
  slider: {
    width: "100%",
    height: 30,
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
