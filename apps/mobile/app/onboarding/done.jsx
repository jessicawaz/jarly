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

import { colors, fonts } from "../../constants/colors";
import { Steps } from "../../components/steps";
import { post } from "@jarly/api-client";
import { signIn as mobileSignIn } from "@jarly/api-client/auth";
import useOnboardingStore from "@jarly/store";
import OfflineBanner from "../../components/offlineBanner";
import { useNetInfo } from "@react-native-community/netinfo";

export default function Goal() {
  const router = useRouter();

  const income = useOnboardingStore((s) => s.income);
  const needsPct = useOnboardingStore((s) => s.needsPct);
  const goalsPct = useOnboardingStore((s) => s.goalsPct);
  const funPct = useOnboardingStore((s) => s.funPct);
  const goal = useOnboardingStore((s) => s.goal);
  const netInfo = useNetInfo();

  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [passwordFeedback, setPasswordFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testPassStrength = async (pass) => {
    if (!pass || pass.length === 0) {
      setPasswordFeedback(null);
      return;
    }
    const { default: zxcvbn } = await import("zxcvbn");
    setPassword(pass);
    setPasswordFeedback(zxcvbn(pass).score);
  };

  const validateAccount = () => {
    if (!firstName) {
      return "First name is required.";
    }
    if (!lastName) {
      return "Last name is required.";
    }
    if (!email) {
      return "Email is required.";
    }
    if (!password) {
      return "Password is required.";
    }

    return null;
  };

  const handleCreateAccount = async () => {
    const err = validateAccount();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    try {
      // Register user: sign up, create budget, add goal (if applicable)
      await post("/api/v1/auth/register", {
        firstName,
        lastName,
        email,
        password,
        income,
        needsPct,
        goalsPct,
        funPct,
        goal: goal?.goalName
          ? {
              name: goal.goalName,
              targetCents: goal.targetCents,
              targetDate: goal.targetDate,
              category: goal.category,
            }
          : null,
      });

      // Sign in
      await mobileSignIn(email, password);

      // Done
      router.push("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#FFF0E8", "#FFF8F0", "#E8F7F0"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {!netInfo.isConnected && (
        <OfflineBanner
          text={"You need an internet connection to create your account."}
        />
      )}

      <View style={styles.content}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <Text style={styles.title}>Save Your Budget</Text>
          <Text style={styles.subtitle}>
            Create a free account to keep your jars sage - no credit card needed
          </Text>

          {/* First name */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={styles.inputText}
              placeholderTextColor={colors.textLight}
              value={firstName}
              onChangeText={setFirstName}
              maxLength={60}
              autoComplete="given-name"
            />
          </View>

          {/* Last name */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={styles.inputText}
              placeholderTextColor={colors.textLight}
              value={lastName}
              onChangeText={setLastName}
              maxLength={60}
              autoComplete="family-name"
            />
          </View>

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
              onChangeText={testPassStrength}
              maxLength={60}
              autoCapitalize="none"
              autoComplete="new-password"
            />

            {passwordFeedback !== null && (
              <View style={styles.passwordFeedbackWrapper}>
                {[0, 1, 2, 3].map((s) => (
                  <View
                    key={s}
                    style={[
                      styles.passwordFeedbackBar,
                      s <= passwordFeedback &&
                        passwordFeedback <= 1 &&
                        styles.barBad,
                      s <= passwordFeedback &&
                        passwordFeedback === 2 &&
                        styles.barOk,
                      s <= passwordFeedback &&
                        passwordFeedback >= 3 &&
                        styles.barGood,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>

          {error && <Text style={styles.errorMessage}>{error}</Text>}

          <TouchableOpacity
            style={[styles.ctaButton, !netInfo.isConnected && { opacity: 0.5 }]}
            disabled={!netInfo.isConnected}
            onPress={handleCreateAccount}
          >
            <Text style={styles.ctaButtonText}>
              {loading ? "Creating account..." : "Create account →"}
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push("/onboarding/jars")}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>

      <Steps currentStep={5} />
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

  // Category picker
  categoriesWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  categoryText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textMid,
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
  twoColRow: {
    flexDirection: "row",
    gap: 12,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dollarSign: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textMid,
    marginRight: 4,
  },
  amountInput: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.textDark,
    flex: 1,
  },
  dateInput: {
    fontFamily: fonts.extra,
    fontSize: 16,
    color: colors.textDark,
  },
  dateFormatted: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textDark,
    marginTop: 4,
  },

  // Calc card
  calcCard: {
    backgroundColor: colors.goalsLight,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  calcLeft: {
    flex: 1,
  },
  calcLabel: {
    fontFamily: fonts.extra,
    fontSize: 11,
    color: colors.goals,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  calcAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  calcAmount: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.textDark,
  },
  calcPerMonth: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.textMid,
  },
  calcSub: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textMid,
    lineHeight: 18,
  },
  calcRight: {
    alignItems: "center",
    marginLeft: 16,
  },
  calcMonths: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.goals,
    lineHeight: 40,
  },
  calcMonthsLabel: {
    fontFamily: fonts.extra,
    fontSize: 10,
    color: colors.textMid,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },

  // Placeholder card
  placeholderCard: {
    backgroundColor: "#F0EBE3",
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
  },
  placeholderTitle: {
    fontFamily: fonts.extra,
    fontSize: 11,
    color: colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  placeholderSub: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.textLight,
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
  skipText: {
    fontFamily: fonts.extra,
    fontSize: 14,
    color: colors.textLight,
  },
  passwordFeedbackWrapper: {
    flexDirection: "row",
    gap: 6,
    marginTop: 16,
    marginBottom: 0,
  },
  passwordFeedbackBar: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  barBad: {
    backgroundColor: "#E05C5C",
  },
  barOk: {
    backgroundColor: colors.fun,
  },
  barGood: {
    backgroundColor: colors.goals,
  },
});
