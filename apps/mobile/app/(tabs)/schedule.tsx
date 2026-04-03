import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { upcomingSessions } from "@colonels-academy/contracts";
import { mobileTheme } from "@colonels-academy/design-tokens";

import { ScreenShell } from "../../src/components/screen-shell";
import { useAsyncResource } from "../../src/hooks/use-async-resource";
import { mobileApiClient } from "../../src/lib/api";

function formatDateRange(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);

  return `${start.toLocaleDateString()} • ${start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

export default function ScheduleScreen() {
  const { data, error, loading } = useAsyncResource(() => mobileApiClient.getLiveSessions(), [], {
    items: upcomingSessions,
    transport:
      "HTTP with revalidation first; native realtime only when classroom behavior truly needs it."
  });

  return (
    <ScreenShell
      eyebrow="Sessions"
      title="Live schedule and replay policy"
      subtitle="The mobile schedule stays aligned with the same learning contracts as web, while keeping the realtime policy intentionally conservative."
    >
      <View style={styles.card}>
        <Text style={styles.transportLabel}>Transport policy</Text>
        <Text style={styles.transportText}>{data.transport}</Text>
      </View>
      {loading ? <ActivityIndicator color={mobileTheme.colors.accentStrong} /> : null}
      {error ? <Text style={styles.warning}>{error}</Text> : null}
      {data.items.map((session) => (
        <View key={session.id} style={styles.card}>
          <Text style={styles.sessionTitle}>{session.title}</Text>
          <Text style={styles.caption}>{session.courseSlug}</Text>
          <Text style={styles.body}>{formatDateRange(session.startsAt, session.endsAt)}</Text>
          <Text style={styles.caption}>
            {session.deliveryMode} • {session.replayAvailable ? "Replay available" : "Live only"}
          </Text>
        </View>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  body: {
    color: mobileTheme.colors.textPrimary,
    fontSize: mobileTheme.typography.body
  },
  caption: {
    color: mobileTheme.colors.textSecondary,
    fontSize: mobileTheme.typography.caption
  },
  card: {
    backgroundColor: mobileTheme.colors.card,
    borderColor: mobileTheme.colors.border,
    borderRadius: mobileTheme.radii.md,
    borderWidth: 1,
    gap: mobileTheme.spacing.xs,
    padding: mobileTheme.spacing.md
  },
  sessionTitle: {
    color: mobileTheme.colors.textPrimary,
    fontSize: mobileTheme.typography.section,
    fontWeight: "800"
  },
  transportLabel: {
    color: mobileTheme.colors.accentStrong,
    fontSize: mobileTheme.typography.caption,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  transportText: {
    color: mobileTheme.colors.textPrimary,
    fontSize: mobileTheme.typography.body,
    lineHeight: 22
  },
  warning: {
    color: mobileTheme.colors.danger,
    fontSize: mobileTheme.typography.caption
  }
});
