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
import { BlurView } from "expo-blur";

import { colors, fonts } from "../../constants/colors";
import { patch } from '@jarly/api-client';

export default function NameEditModal({
  visible,
  onClose,
  onSaved,
  currentName,
}) {
  const [firstName, setFirstName] = useState(currentName?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(
    currentName?.split(" ").slice(1).join(" ") || "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    if (!firstName) {
      setError("First name is required.");
      return;
    }
    setLoading(true);
    try {
      await patch("/api/v1/users/me", {
        displayName: `${firstName} ${lastName}`.trim(),
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
            <Text style={styles.title}>Edit name</Text>

            <Text style={styles.inputLabel}>First name</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.needs }]}
              value={firstName}
              onChangeText={(v) => {
                setFirstName(v);
                setError(null);
              }}
              autoComplete="given-name"
              autoFocus
            />

            <Text style={styles.inputLabel}>Last name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              autoComplete="family-name"
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
              style={[styles.saveBtn, loading && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveBtnText}>
                {loading ? "Saving..." : "Save changes"}
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
