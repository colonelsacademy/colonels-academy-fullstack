import { Link } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { architectureDecisions, dashboardSnapshot } from "@colonels-academy/contracts";
import { mobileTheme } from "@colonels-academy/design-tokens";

import { ScreenShell } from "../../src/components/screen-shell";
import { useAsyncResource } from "../../src/hooks/use-async-resource";
import { mobileApiClient } from "../../src/lib/api";
import { useAuth } from "../../src/providers/auth-provider";

export default function OverviewScreen() {
  const { accessToken, isConfigured, user } = useAuth();
  const { data, error, loading } = useAsyncResource(
    () => mobileApiClient.getDashboardOverview(accessToken ? { accessToken } : undefined),
    [accessToken],
    {
      authenticated: false,
      user: null,
      overview: dashboardSnapshot,
      note: "Mobile starts with the same typed contracts as web, then grows into native-first experiences."
    }
  );

  return (
    <ScreenShell
      eyebrow="Mobile Academy"
      title="Native delivery, same platform core."
      subtitle="This Expo app shares contracts and API behavior with Next.js, while keeping native navigation, native auth, and native release flows."
      footer={
        <Text style={styles.footerNote}>
          {isConfigured
            ? "Firebase mobile auth is configured. Bearer tokens will be sent to Fastify for protected requests."
            : "Add EXPO_PUBLIC Firebase values to connect mobile auth and protected learner flows."}
        </Text>
      }
    >
      <View style={styles.cardRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{data.overview.enrolledCourses}</Text>
          <Text style={styles.metricLabel}>Enrolled tracks</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{data.overview.progressPercent}%</Text>
          <Text style={styles.metricLabel}>Progress</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Learner state</Text>
        {loading ? <ActivityIndicator color={mobileTheme.colors.accentStrong} /> : null}
        <Text style={styles.cardBody}>
          {user?.email
            ? `Signed in as ${user.email}.`
            : data.authenticated
              ? "Authenticated with a Firebase bearer token."
              : "Public preview mode until a learner signs in."}
        </Text>
        <Text style={styles.note}>{data.note}</Text>
        {error ? <Text style={styles.warning}>{error}</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Platform decisions</Text>
        {architectureDecisions.slice(0, 4).map((decision) => (
          <View key={decision.layer} style={styles.decisionRow}>
            <Text style={styles.decisionLayer}>{decision.layer}</Text>
            <Text style={styles.decisionChoice}>{decision.choice}</Text>
            <Text style={styles.decisionNote}>{decision.note}</Text>
          </View>
        ))}
      </View>

      <Link asChild href="/(tabs)/courses">
        <Pressable style={styles.linkCard}>
          <Text style={styles.linkCardLabel}>Browse courses and native detail screens</Text>
        </Pressable>
      </Link>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: mobileTheme.colors.card,
    borderColor: mobileTheme.colors.border,
    borderRadius: mobileTheme.radii.md,
    borderWidth: 1,
    gap: mobileTheme.spacing.sm,
    padding: mobileTheme.spacing.md
  },
  cardBody: {
    color: mobileTheme.colors.textPrimary,
    fontSize: mobileTheme.typography.body,
    lineHeight: 22
  },
  cardRow: {
    flexDirection: "row",
    gap: mobileTheme.spacing.md
  },
  cardTitle: {
    color: mobileTheme.colors.textPrimary,
    fontSize: mobileTheme.typography.section,
    fontWeight: "800"
  },
  decisionChoice: {
    color: mobileTheme.colors.textPrimary,
    fontSize: mobileTheme.typography.body,
    fontWeight: "700"
  },
  decisionLayer: {
    color: mobileTheme.colors.accentStrong,
    fontSize: mobileTheme.typography.caption,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  decisionNote: {
    color: mobileTheme.colors.textSecondary,
    fontSize: mobileTheme.typography.caption,
    lineHeight: 18
  },
  decisionRow: {
    borderTopColor: mobileTheme.colors.border,
    borderTopWidth: 1,
    gap: mobileTheme.spacing.xs,
    paddingTop: mobileTheme.spacing.sm
  },
  footerNote: {
    color: mobileTheme.colors.textSecondary,
    fontSize: mobileTheme.typography.caption,
    lineHeight: 18
  },
  linkCard: {
    backgroundColor: mobileTheme.colors.accentStrong,
    borderRadius: mobileTheme.radii.md,
    paddingHorizontal: mobileTheme.spacing.md,
    paddingVertical: mobileTheme.spacing.md
  },
  linkCardLabel: {
    color: mobileTheme.colors.textInverse,
    fontSize: mobileTheme.typography.body,
    fontWeight: "700"
  },
  metricCard: {
    backgroundColor: mobileTheme.colors.card,
    borderColor: mobileTheme.colors.border,
    borderRadius: mobileTheme.radii.md,
    borderWidth: 1,
    flex: 1,
    gap: mobileTheme.spacing.xs,
    padding: mobileTheme.spacing.md
  },
  metricLabel: {
    color: mobileTheme.colors.textSecondary,
    fontSize: mobileTheme.typography.caption,
    textTransform: "uppercase"
  },
  metricValue: {
    color: mobileTheme.colors.textPrimary,
    fontSize: mobileTheme.typography.title,
    fontWeight: "800"
  },
  note: {
    color: mobileTheme.colors.textSecondary,
    fontSize: mobileTheme.typography.caption,
    lineHeight: 18
  },
  warning: {
    color: mobileTheme.colors.danger,
    fontSize: mobileTheme.typography.caption,
    lineHeight: 18
  }
});
