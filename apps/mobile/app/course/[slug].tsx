import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { courseCatalog, type CourseDetail } from "@colonels-academy/contracts";
import { mobileTheme } from "@colonels-academy/design-tokens";

import { ScreenShell } from "../../src/components/screen-shell";
import { useAsyncResource } from "../../src/hooks/use-async-resource";
import { mobileApiClient } from "../../src/lib/api";

export default function CourseDetailScreen() {
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const fallbackCourse = courseCatalog.find((course) => course.slug === slug) ?? null;
  const {
    data: course,
    error,
    loading
  } = useAsyncResource<CourseDetail | null>(
    () => mobileApiClient.getCourseBySlug(slug),
    [slug],
    fallbackCourse
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: course?.title ?? "Course" }} />
      <ScreenShell
        eyebrow="Course Detail"
        title={course?.title ?? "Course not found"}
        subtitle={
          course?.summary ?? "This course could not be loaded from the API or starter catalog."
        }
      >
        {loading ? <ActivityIndicator color={mobileTheme.colors.accentStrong} /> : null}
        {error ? <Text style={styles.warning}>{error}</Text> : null}
        {course ? (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Delivery snapshot</Text>
              <Text style={styles.body}>{course.liveSupport}</Text>
              <Text style={styles.caption}>
                {course.level} • {course.durationLabel} • {course.lessonCount} lessons
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Outcomes</Text>
              {course.outcomeBullets.map((bullet) => (
                <Text key={bullet} style={styles.body}>
                  • {bullet}
                </Text>
              ))}
            </View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Syllabus</Text>
              {course.syllabus.map((item) => (
                <Text key={item} style={styles.body}>
                  • {item}
                </Text>
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.body}>No course detail is available for this route yet.</Text>
        )}
      </ScreenShell>
    </>
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
    fontSize: mobileTheme.typography.caption
  },
  card: {
    backgroundColor: mobileTheme.colors.card,
    borderColor: mobileTheme.colors.border,
    borderRadius: mobileTheme.radii.md,
    borderWidth: 1,
    gap: mobileTheme.spacing.sm,
    padding: mobileTheme.spacing.md
  },
  sectionTitle: {
    color: mobileTheme.colors.textPrimary,
    fontSize: mobileTheme.typography.section,
    fontWeight: "800"
  },
  warning: {
    color: mobileTheme.colors.danger,
    fontSize: mobileTheme.typography.caption
  }
});
