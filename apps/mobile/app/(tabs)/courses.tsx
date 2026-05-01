import { Link } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { courseCatalog } from "@colonels-academy/contracts";
import { mobileTheme } from "@colonels-academy/design-tokens";

import { ScreenShell } from "../../src/components/screen-shell";
import { useAsyncResource } from "../../src/hooks/use-async-resource";
import { mobileApiClient } from "../../src/lib/api";

export default function CoursesScreen() {
  const { data, error, loading } = useAsyncResource(
    () => mobileApiClient.getCourses(),
    [],
    {
      items: courseCatalog
    }
  );

  return (
    <ScreenShell
      eyebrow="Courses"
      title="Native catalog browsing"
      subtitle="The course list uses the same contract package as web, but the browsing experience is mobile-first."
    >
      {loading ? <ActivityIndicator color={mobileTheme.colors.accentStrong} /> : null}
      {error ? <Text style={styles.warning}>{error}</Text> : null}
      {data.items.map((course) => (
        <Link key={course.slug} asChild href={`/course/${course.slug}`}>
          <Pressable style={styles.card}>
            <Text style={styles.track}>{course.track.toUpperCase()}</Text>
            <Text style={styles.title}>{course.title}</Text>
            <Text style={styles.summary}>{course.summary}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>{course.durationLabel}</Text>
              <Text style={styles.meta}>{course.lessonCount} lessons</Text>
              <Text style={styles.meta}>NPR {course.priceNpr}</Text>
            </View>
          </Pressable>
        </Link>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: mobileTheme.colors.card,
    borderColor: mobileTheme.colors.border,
    borderRadius: mobileTheme.radii.md,
    borderWidth: 1,
    gap: mobileTheme.spacing.xs,
    padding: mobileTheme.spacing.md
  },
  meta: {
    color: mobileTheme.colors.textSecondary,
    fontSize: mobileTheme.typography.caption,
    fontWeight: "600"
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: mobileTheme.spacing.sm,
    marginTop: mobileTheme.spacing.sm
  },
  summary: {
    color: mobileTheme.colors.textSecondary,
    fontSize: mobileTheme.typography.body,
    lineHeight: 22
  },
  title: {
    color: mobileTheme.colors.textPrimary,
    fontSize: mobileTheme.typography.section,
    fontWeight: "800"
  },
  track: {
    color: mobileTheme.colors.accentStrong,
    fontSize: mobileTheme.typography.caption,
    fontWeight: "700"
  },
  warning: {
    color: mobileTheme.colors.danger,
    fontSize: mobileTheme.typography.caption
  }
});
