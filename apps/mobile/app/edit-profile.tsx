import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { updateProfile } from "firebase/auth";
import { ArrowLeft, Check, Mail, User } from "lucide-react-native";
import { useState } from "react";
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
  View,
} from "react-native";
import { useTheme } from "../src/contexts/ThemeContext";
import { useAuth } from "../src/providers/auth-provider";
import { readPublicMobileEnv } from "@colonels-academy/config";

const env = readPublicMobileEnv();

export default function EditProfileScreen() {
  const { user, accessToken } = useAuth();
  const { isDark, colors } = useTheme();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [loading, setLoading] = useState(false);

  const topInset = Platform.OS === "android" ? 0 : 0;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.primary },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: topInset + 56,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.primary,
      backgroundColor: colors.background.primary,
    },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: "700", color: colors.text.primary },
    headerRight: { width: 40 },
    scrollContent: { flexGrow: 1, padding: 24 },
    avatarSection: { alignItems: "center", marginBottom: 32 },
    avatarContainer: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: "#D4AF37",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "#FFFFFF",
      marginBottom: 8,
    },
    avatarHint: { fontSize: 12, color: colors.text.tertiary },
    form: { width: "100%" },
    inputGroup: { marginBottom: 20 },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.secondary,
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background.secondary,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.border.primary,
      paddingHorizontal: 16,
      height: 56,
    },
    inputDisabled: {
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#F3F4F6",
      opacity: 0.7,
    },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, color: colors.text.primary, padding: 0 },
    inputTextDisabled: { color: colors.text.tertiary },
    hint: { fontSize: 12, color: colors.text.tertiary, marginTop: 6 },
    saveButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#D4AF37",
      borderRadius: 12,
      height: 56,
      marginTop: 32,
      gap: 8,
    },
    saveButtonDisabled: { opacity: 0.6 },
    saveButtonText: { color: "#0B1120", fontSize: 16, fontWeight: "700" },
  });

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    if (!user || !accessToken) {
      Alert.alert("Error", "Not authenticated");
      return;
    }

    setLoading(true);
    try {
      // Update display name in Firebase using the standalone function
      await updateProfile(user, { displayName: displayName.trim() });

      // Force token refresh so the updated displayName is reflected immediately
      await user.getIdToken(true);

      // Sync updated name to Postgres
      await fetch(`${env.EXPO_PUBLIC_API_BASE_URL}/v1/auth/mobile-sync`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error("Error updating profile:", err);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <User size={40} color="#FFFFFF" strokeWidth={2.5} />
          </View>
          <Text style={styles.avatarHint}>
            {user?.displayName || user?.email?.split("@")[0] || "Cadet"}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Display Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <User
                size={20}
                color={colors.text.tertiary}
                strokeWidth={2}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={colors.text.tertiary}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
          </View>

          {/* Email (read-only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputContainer, styles.inputDisabled]}>
              <Mail
                size={20}
                color={colors.text.tertiary}
                strokeWidth={2}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.inputTextDisabled]}
                value={user?.email || ""}
                editable={false}
                placeholderTextColor={colors.text.tertiary}
              />
            </View>
            <Text style={styles.hint}>Email cannot be changed</Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#0B1120" />
            ) : (
              <>
                <Check size={20} color="#0B1120" strokeWidth={2.5} />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
