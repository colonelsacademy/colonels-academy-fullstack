import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { mobileTheme } from "@colonels-academy/design-tokens";

import { ScreenShell } from "../../src/components/screen-shell";
import { useAsyncResource } from "../../src/hooks/use-async-resource";
import { mobileApiClient } from "../../src/lib/api";
import { useAuth } from "../../src/providers/auth-provider";

export default function AccountScreen() {
  const { accessToken, error, isConfigured, isReady, signInWithEmail, signOutUser, user } =
    useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { data: session, loading } = useAsyncResource(
    () => mobileApiClient.getDashboardOverview(accessToken ? { accessToken } : undefined),
    [accessToken],
    {
      authenticated: false,
      user: null,
      overview: {
        completionTarget: "Connect Firebase mobile auth",
        enrolledCourses: 0,
        pendingTasks: 0,
        progressPercent: 0,
        upcomingSessionCount: 0
      },
      note: "Mobile auth uses Firebase ID tokens over HTTPS. Web keeps server-managed session cookies."
    }
  );

  return (
    <ScreenShell
      eyebrow="Identity"
      title="Mobile auth stays native."
      subtitle="The app keeps Firebase auth on-device and sends bearer tokens to Fastify, while the Next.js web app keeps the session-cookie flow."
    >
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Runtime status</Text>
        {!isReady ? <ActivityIndicator color={mobileTheme.colors.accentStrong} /> : null}
        <Text style={styles.body}>
          {isConfigured ? "Firebase mobile auth is configured." : "Firebase mobile env is missing."}
        </Text>
        <Text style={styles.caption}>
          {user?.email ? `Signed in as ${user.email}` : "No learner is signed in yet."}
        </Text>
        <Text style={styles.caption}>{session.note}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Email sign-in starter</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="cadet@example.com"
          placeholderTextColor={mobileTheme.colors.textSecondary}
          style={styles.input}
          value={email}
        />
        <TextInput
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={mobileTheme.colors.textSecondary}
          secureTextEntry
          style={styles.input}
          value={password}
        />
        <Pressable
          onPress={() => {
            void signInWithEmail(email, password);
          }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonLabel}>Sign in with Firebase</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            void signOutUser();
          }}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonLabel}>Sign out</Text>
        </Pressable>
        {loading ? <ActivityIndicator color={mobileTheme.colors.accentStrong} /> : null}
        {error ? <Text style={styles.warning}>{error}</Text> : null}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  body: {
    color: mobileTheme.colors.textPrimary,
    fontSize: mobileTheme.typography.body,
    lineHeight: 22
  },
  caption: {
    color: mobileTheme.colors.textSecondary,
    fontSize: mobileTheme.typography.caption,
    lineHeight: 18
  },
  card: {
    backgroundColor: mobileTheme.colors.card,
    borderColor: mobileTheme.colors.border,
    borderRadius: mobileTheme.radii.md,
    borderWidth: 1,
    gap: mobileTheme.spacing.sm,
    padding: mobileTheme.spacing.md
  },
  input: {
    backgroundColor: mobileTheme.colors.surface,
    borderColor: mobileTheme.colors.border,
    borderRadius: mobileTheme.radii.sm,
    borderWidth: 1,
    color: mobileTheme.colors.textPrimary,
    fontSize: mobileTheme.typography.body,
    paddingHorizontal: mobileTheme.spacing.md,
    paddingVertical: mobileTheme.spacing.sm
  },
  primaryButton: {
    backgroundColor: mobileTheme.colors.accentStrong,
    borderRadius: mobileTheme.radii.sm,
    paddingHorizontal: mobileTheme.spacing.md,
    paddingVertical: mobileTheme.spacing.sm
  },
  primaryButtonLabel: {
    color: mobileTheme.colors.textInverse,
    fontSize: mobileTheme.typography.body,
    fontWeight: "700",
    textAlign: "center"
  },
  secondaryButton: {
    borderColor: mobileTheme.colors.border,
    borderRadius: mobileTheme.radii.sm,
    borderWidth: 1,
    paddingHorizontal: mobileTheme.spacing.md,
    paddingVertical: mobileTheme.spacing.sm
  },
  secondaryButtonLabel: {
    color: mobileTheme.colors.textPrimary,
    fontSize: mobileTheme.typography.body,
    fontWeight: "700",
    textAlign: "center"
  },
  sectionTitle: {
    color: mobileTheme.colors.textPrimary,
    fontSize: mobileTheme.typography.section,
    fontWeight: "800"
  },
  warning: {
    color: mobileTheme.colors.danger,
    fontSize: mobileTheme.typography.caption,
    lineHeight: 18
  }
});
