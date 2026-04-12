import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LogIn } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useTheme } from "../src/contexts/ThemeContext";
import { useAuth } from "../src/providers/auth-provider";

export default function LoginScreen() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, error, user } = useAuth();
  const { isDark, colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between login/signup

  // Auto-navigate when user is authenticated
  useEffect(() => {
    if (user) {
      console.log("✅ User authenticated, navigating to home...");
      router.replace("/(tabs)");
    }
  }, [user]);

  // Show error alert when auth error occurs
  useEffect(() => {
    if (error && !error.includes("DEVELOPER_ERROR")) {
      console.error("🔴 Auth error:", error);
      Alert.alert("Authentication Error", error);
    }
  }, [error]);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        Alert.alert("Success", "Account created successfully!");
      } else {
        await signInWithEmail(email, password);
      }
      router.replace("/(tabs)");
    } catch (_err) {
      Alert.alert(isSignUp ? "Signup Failed" : "Login Failed", error || "Please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      // Don't navigate immediately - let the auth state change handle it
    } catch (err) {
      console.error("Login screen error:", err);
      Alert.alert("Google Sign-In Failed", error || "Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background.secondary }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={isDark ? ["#1e1e1e", "#0B1120", "#1e1e1e"] : ["#F8F9FB", "#1e293b", "#F8F9FB"]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.logoContainer}>
            <LogIn size={48} color="#D4AF37" strokeWidth={2} />
          </View>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {isSignUp ? "Create Account" : "Welcome Back"}
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0.9)" }
            ]}
          >
            {isSignUp ? "Sign up to get started" : "Sign in to continue"}
          </Text>
        </View>

        {/* Form */}
        <View style={[styles.form, { backgroundColor: colors.background.secondary }]}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background.primary,
                  color: colors.text.primary,
                  borderColor: colors.border.primary
                }
              ]}
              placeholder="Enter your email"
              placeholderTextColor={colors.text.tertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Password</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background.primary,
                  color: colors.text.primary,
                  borderColor: colors.border.primary
                }
              ]}
              placeholder="Enter your password"
              placeholderTextColor={colors.text.tertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          {/* Email Login/Signup Button */}
          <TouchableOpacity
            onPress={handleEmailLogin}
            disabled={loading}
            style={styles.loginButton}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <LogIn size={20} color="#fff" strokeWidth={2.5} />
                <Text style={styles.loginText}>{isSignUp ? "SIGN UP" : "LOGIN"}</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Toggle Login/Signup */}
          <TouchableOpacity
            onPress={() => setIsSignUp(!isSignUp)}
            style={styles.toggleButton}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, { color: colors.text.secondary }]}>
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <Text style={styles.toggleTextBold}>{isSignUp ? "Login" : "Sign Up"}</Text>
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border.primary }]} />
            <Text style={[styles.dividerText, { color: colors.text.secondary }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border.primary }]} />
          </View>

          {/* Google Sign-In Button */}
          <TouchableOpacity
            onPress={handleGoogleLogin}
            disabled={loading}
            style={[
              styles.googleButton,
              { backgroundColor: colors.background.primary, borderColor: colors.border.primary }
            ]}
            activeOpacity={0.85}
          >
            <Text style={[styles.googleText, { color: colors.text.primary }]}>
              🔍 Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={[styles.backText, { color: colors.text.secondary }]}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1
  },
  header: {
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    overflow: "hidden"
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#D4AF37",
    marginBottom: 20,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: "center"
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "400",
    textAlign: "center"
  },
  form: {
    flex: 1,
    padding: 20,
    paddingTop: 32
  },
  inputContainer: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1
  },
  loginButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#D4AF37",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    gap: 8,
    marginTop: 12,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  loginText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.5
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24
  },
  dividerLine: {
    flex: 1,
    height: 1
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: "700"
  },
  googleButton: {
    width: "100%",
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 2
  },
  googleText: {
    fontSize: 16,
    fontWeight: "700"
  },
  backButton: {
    marginTop: 20,
    alignItems: "center",
    padding: 12
  },
  backText: {
    fontSize: 14,
    fontWeight: "600"
  },
  toggleButton: {
    marginTop: 16,
    alignItems: "center",
    padding: 12
  },
  toggleText: {
    fontSize: 14
  },
  toggleTextBold: {
    fontWeight: "700",
    color: "#D4AF37"
  }
});
