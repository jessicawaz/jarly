import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
// import { GoogleSignin } from "@react-native-google-signin/google-signin";

import { signIn as mobileSignIn } from "@jarly/api-client/auth";
import { colors, fonts } from "../constants/colors";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState({ google: false, creds: false });
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    if (!password || !email) {
      setError("Email and password required.");
      return;
    }
    setLoading({ google: false, creds: true });
    try {
      await mobileSignIn(email, password);

      router.push("/home");
    } catch (err) {
      setError("Login failed. Please try again later.");
    } finally {
      setLoading({ google: false, creds: false });
    }
  };

  const handleGoogleLogin = async () => {
    // setLoading({ creds: false, google: true });

    // try {
    //   const { data } = await GoogleSignin.signIn();
    //   const credential = await GoogleAuthProvider.credential(data.idToken);
    //   await signInWithCredential(auth, credential);
    // } catch (err) {
    //   setError("Login failed. Please try again later.");
    //   console.log(err);
    // } finally {
    //   setLoading({ creds: false, google: false });
    // }
  };

  return (
    <LinearGradient
      colors={["#FFF0E8", "#FFF8F0", "#E8F7F0"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <View style={styles.formWrapper}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Your jars are waiting for you.</Text>

          {/* Email */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.inputText}
              placeholderTextColor={colors.textLight}
              value={email}
              onChangeText={setEmail}
              maxLength={60}
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* PW */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.inputText}
              placeholderTextColor={colors.textLight}
              value={password}
              onChangeText={setPassword}
              maxLength={60}
              autoCapitalize="none"
              autoComplete="current-password"
            />
          </View>

          {error && <Text style={styles.errorMessage}>{error}</Text>}

          <TouchableOpacity style={styles.ctaButton} onPress={handleLogin}>
            <Text style={styles.ctaButtonText}>
              {loading?.creds ? "Finding account..." : "Log in →"}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
          >
            <Text style={styles.googleButtonText}>
              {loading?.google ? "Finding account..." : "Continue with Google"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.alreadyAccount}>
            Need an account?{" "}
            <Text
              style={styles.alreadyAccountLink}
              onPress={() => router.push("/onboarding/welcome")}
            >
              Sign up
            </Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.black,
    fontSize: 32,
    color: colors.textDark,
    lineHeight: 38,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.semi,
    fontSize: 14,
    color: colors.textMid,
    lineHeight: 22,
    marginBottom: 24,
  },

  // Input cards
  inputCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  inputLabel: {
    fontFamily: fonts.extra,
    fontSize: 11,
    color: colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  inputText: {
    fontFamily: fonts.extra,
    fontSize: 18,
    color: colors.textDark,
  },

  // Error
  errorMessage: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: "#E05C5C",
    marginTop: 8,
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
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: fonts.extra,
    fontSize: 11,
    color: colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  googleButton: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 13,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  googleButtonText: {
    fontFamily: fonts.extra,
    fontSize: 14,
    color: colors.textDark,
  },
  alreadyAccount: {
    textAlign: "center",
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textMid,
  },
  alreadyAccountLink: {
    color: colors.needs,
    fontFamily: fonts.extra,
  },
});
