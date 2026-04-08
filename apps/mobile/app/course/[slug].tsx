import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, Pressable, StyleSheet, Text, View } from "react-native";

import { type CourseDetail, courseCatalog, type LessonDetail } from "@colonels-academy/contracts";
import { mobileTheme } from "@colonels-academy/design-tokens";

import { ScreenShell } from "../../src/components/screen-shell";
import { useAsyncResource } from "../../src/hooks/use-async-resource";
import { mobileApiClient } from "../../src/lib/api";
import { useAuth } from "../../src/providers/auth-provider";

const STUDY_SESSION_HEARTBEAT_MS = 60_000;

type MobileLesson = {
  id: string;
  title: string;
  synopsis: string;
  contentType: LessonDetail["contentType"];
  durationLabel: string;
  isLocked: boolean;
  unlockRequirement?: string;
  phaseNumber?: number;
  subjectArea?: LessonDetail["subjectArea"];
};

type MobileModule = {
  id: string;
  title: string;
  lessons: MobileLesson[];
};

function formatDurationLabel(durationMinutes?: number) {
  if (!durationMinutes || durationMinutes <= 0) {
    return "Self-paced";
  }

  if (durationMinutes < 60) {
    return `${durationMinutes} min`;
  }

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
}

function formatSubjectArea(subjectArea?: LessonDetail["subjectArea"]) {
  if (!subjectArea) {
    return null;
  }

  return subjectArea
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function mapLesson(lesson: LessonDetail): MobileLesson {
  return {
    id: lesson.id,
    title: lesson.title,
    synopsis: lesson.synopsis,
    contentType: lesson.contentType,
    durationLabel: formatDurationLabel(lesson.durationMinutes),
    isLocked: lesson.isLocked,
    ...(lesson.unlockRequirement ? { unlockRequirement: lesson.unlockRequirement } : {}),
    ...(lesson.phaseNumber ? { phaseNumber: lesson.phaseNumber } : {}),
    ...(lesson.subjectArea ? { subjectArea: lesson.subjectArea } : {})
  };
}

function pickDefaultLesson(modules: MobileModule[]) {
  for (const module of modules) {
    const unlockedLesson = module.lessons.find((lesson) => !lesson.isLocked);
    if (unlockedLesson) {
      return unlockedLesson;
    }
  }

  return modules[0]?.lessons[0] ?? null;
}

function noop() {}

export default function CourseDetailScreen() {
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const fallbackCourse = courseCatalog.find((course) => course.slug === slug) ?? null;
  const { accessToken, user } = useAuth();
  const [activeLesson, setActiveLesson] = useState<MobileLesson | null>(null);
  const [appStateStatus, setAppStateStatus] = useState(AppState.currentState);
  const [deviceSessionId] = useState(
    () => `mobile-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  );
  const sessionIdRef = useRef<string | null>(null);

  const {
    data: course,
    error,
    loading
  } = useAsyncResource<CourseDetail | null>(
    () => mobileApiClient.getCourseBySlug(slug),
    [slug],
    fallbackCourse
  );

  const {
    data: lessonResponse,
    error: lessonError,
    loading: lessonsLoading
  } = useAsyncResource(
    () => mobileApiClient.getCourseLessons(slug, accessToken ? { accessToken } : undefined),
    [slug, accessToken],
    {
      courseSlug: slug,
      modules: [],
      unorganisedLessons: []
    }
  );

  const { data: analytics } = useAsyncResource(
    () => mobileApiClient.getLearningAnalytics(slug, accessToken ? { accessToken } : undefined),
    [slug, accessToken],
    {
      courseSlug: slug,
      summary: {
        totalStudyMinutes: 0,
        submissionCount: 0,
        pendingSubmissionReviews: 0
      },
      subjects: []
    }
  );

  const { data: submissions } = useAsyncResource(
    () => mobileApiClient.getCourseSubmissions(slug, accessToken ? { accessToken } : undefined),
    [slug, accessToken],
    {
      courseSlug: slug,
      items: []
    }
  );

  const modules: MobileModule[] = [
    ...lessonResponse.modules.map((module) => ({
      id: module.id,
      title: module.title,
      lessons: module.lessons.map(mapLesson)
    })),
    ...(lessonResponse.unorganisedLessons.length > 0
      ? [
          {
            id: "independent-lessons",
            title: "Independent Lessons",
            lessons: lessonResponse.unorganisedLessons.map(mapLesson)
          }
        ]
      : [])
  ];

  useEffect(() => {
    setActiveLesson((current) => {
      if (modules.length === 0) {
        return null;
      }

      if (current) {
        const nextLesson = modules
          .flatMap((module) => module.lessons)
          .find((lesson) => lesson.id === current.id);

        if (nextLesson) {
          return nextLesson;
        }
      }

      return pickDefaultLesson(modules);
    });
  }, [lessonResponse]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      setAppStateStatus(nextState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (
      !course ||
      !accessToken ||
      appStateStatus !== "active" ||
      !activeLesson ||
      activeLesson.isLocked
    ) {
      const sessionId = sessionIdRef.current;
      sessionIdRef.current = null;

      if (sessionId && accessToken) {
        void mobileApiClient
          .endStudySession(sessionId, { deviceSessionId }, { accessToken })
          .catch(noop);
      }

      return;
    }

    let isCancelled = false;
    let heartbeatTimer: ReturnType<typeof setInterval> | undefined;
    const trackedCourseSlug = course.slug;
    const trackedLessonId = activeLesson.id;
    const authToken = accessToken ?? undefined;

    async function beginTracking() {
      const previousSessionId = sessionIdRef.current;
      sessionIdRef.current = null;

      if (previousSessionId) {
        await mobileApiClient
          .endStudySession(previousSessionId, { deviceSessionId }, { accessToken: authToken })
          .catch(noop);
      }

      try {
        const response = await mobileApiClient.startStudySession(
          {
            courseSlug: trackedCourseSlug,
            lessonId: trackedLessonId,
            source: "MOBILE",
            deviceSessionId
          },
          { accessToken: authToken }
        );

        if (isCancelled) {
          await mobileApiClient
            .endStudySession(response.session.id, { deviceSessionId }, { accessToken: authToken })
            .catch(noop);
          return;
        }

        sessionIdRef.current = response.session.id;
        heartbeatTimer = setInterval(() => {
          const sessionId = sessionIdRef.current;

          if (!sessionId) {
            return;
          }

          void mobileApiClient
            .heartbeatStudySession(sessionId, { deviceSessionId }, { accessToken: authToken })
            .catch(noop);
        }, STUDY_SESSION_HEARTBEAT_MS);
      } catch (trackingError) {
        console.warn("Mobile study session tracking unavailable:", trackingError);
      }
    }

    void beginTracking();

    return () => {
      isCancelled = true;

      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
      }

      const sessionId = sessionIdRef.current;
      sessionIdRef.current = null;

      if (sessionId) {
        void mobileApiClient
          .endStudySession(sessionId, { deviceSessionId }, { accessToken: authToken })
          .catch(noop);
      }
    };
  }, [accessToken, activeLesson, appStateStatus, course, deviceSessionId]);

  const lessonSubject = formatSubjectArea(activeLesson?.subjectArea);
  const latestLecturetteSubmission =
    activeLesson?.subjectArea === "LECTURETTE"
      ? submissions.items.find(
          (submission) =>
            submission.lessonId === activeLesson.id ||
            (submission.subjectArea === activeLesson.subjectArea &&
              submission.phaseNumber === activeLesson.phaseNumber)
        )
      : null;

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: course?.title ?? "Course" }} />
      <ScreenShell
        eyebrow="Course Detail"
        title={course?.title ?? "Course not found"}
        subtitle={
          course?.summary ?? "This course could not be loaded from the API or starter catalog."
        }
        footer={
          <Text style={styles.footerNote}>
            {user?.email
              ? "Study sessions are tracked while this screen stays active."
              : "Sign in on mobile to send study-session heartbeats and end events."}
          </Text>
        }
      >
        {loading ? <ActivityIndicator color={mobileTheme.colors.accentStrong} /> : null}
        {error ? <Text style={styles.warning}>{error}</Text> : null}
        {lessonError ? <Text style={styles.warning}>{lessonError}</Text> : null}
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
              <Text style={styles.sectionTitle}>Lesson player</Text>
              {lessonsLoading ? (
                <ActivityIndicator color={mobileTheme.colors.accentStrong} />
              ) : null}
              {activeLesson ? (
                <>
                  <Text style={styles.lessonTitle}>{activeLesson.title}</Text>
                  <Text style={styles.body}>{activeLesson.synopsis}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaChip}>{activeLesson.contentType}</Text>
                    <Text style={styles.metaChip}>{activeLesson.durationLabel}</Text>
                    {activeLesson.phaseNumber ? (
                      <Text style={styles.metaChip}>Phase {activeLesson.phaseNumber}</Text>
                    ) : null}
                    {lessonSubject ? <Text style={styles.metaChip}>{lessonSubject}</Text> : null}
                  </View>
                  {activeLesson.unlockRequirement ? (
                    <Text style={styles.lockNote}>{activeLesson.unlockRequirement}</Text>
                  ) : null}
                </>
              ) : (
                <Text style={styles.body}>No lesson detail is available for this course yet.</Text>
              )}
            </View>

            {analytics.subjects.length > 0 ? (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Subject readiness</Text>
                {analytics.subjects.slice(0, 5).map((subject) => (
                  <View key={subject.subjectArea} style={styles.analyticsRow}>
                    <View style={styles.analyticsCopy}>
                      <Text style={styles.analyticsLabel}>{subject.label}</Text>
                      <Text style={styles.analyticsMeta}>
                        {subject.latestAttemptCount} latest questions
                        {subject.configuredWeightPercent
                          ? ` • exam weight ${subject.configuredWeightPercent}%`
                          : ""}
                        {" • "}practice fluency {subject.weightedAccuracyPercent}%
                      </Text>
                    </View>
                    <Text style={styles.analyticsValue}>
                      {subject.examWeightedReadinessPercent}%
                    </Text>
                  </View>
                ))}
                <Text style={styles.caption}>
                  Study tracked: {analytics.summary.totalStudyMinutes} min • submissions:{" "}
                  {analytics.summary.submissionCount}
                </Text>
                {analytics.summary.overallWeightedReadinessPercent !== undefined ? (
                  <Text style={styles.caption}>
                    Exam-weighted readiness: {analytics.summary.overallWeightedReadinessPercent}%
                  </Text>
                ) : null}
              </View>
            ) : null}

            {activeLesson?.subjectArea === "LECTURETTE" ? (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Lecturette review</Text>
                {latestLecturetteSubmission ? (
                  <>
                    <Text style={styles.lessonTitle}>
                      {latestLecturetteSubmission.status.replaceAll("_", " ")}
                    </Text>
                    <Text style={styles.caption}>
                      Submitted {new Date(latestLecturetteSubmission.submittedAt).toLocaleString()}
                    </Text>
                    {latestLecturetteSubmission.reviewNotes ? (
                      <Text style={styles.body}>{latestLecturetteSubmission.reviewNotes}</Text>
                    ) : null}
                    {latestLecturetteSubmission.score !== undefined &&
                    latestLecturetteSubmission.maxScore !== undefined ? (
                      <Text style={styles.body}>
                        Score: {latestLecturetteSubmission.score}/
                        {latestLecturetteSubmission.maxScore}
                      </Text>
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.body}>
                    No lecturette submission has been uploaded for this lesson yet. Web upload
                    updates will appear here once submitted.
                  </Text>
                )}
              </View>
            ) : null}

            {modules.length > 0 ? (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Curriculum</Text>
                {modules.map((module) => (
                  <View key={module.id} style={styles.moduleBlock}>
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                    {module.lessons.map((lesson) => {
                      const isActive = activeLesson?.id === lesson.id;

                      return (
                        <Pressable
                          key={lesson.id}
                          onPress={() => {
                            if (lesson.isLocked) {
                              return;
                            }

                            setActiveLesson(lesson);
                          }}
                          style={[
                            styles.lessonButton,
                            isActive ? styles.lessonButtonActive : null,
                            lesson.isLocked ? styles.lessonButtonLocked : null
                          ]}
                        >
                          <Text
                            style={[
                              styles.lessonButtonTitle,
                              isActive ? styles.lessonButtonTitleActive : null
                            ]}
                          >
                            {lesson.title}
                          </Text>
                          <Text style={styles.lessonButtonMeta}>
                            {lesson.durationLabel} • {lesson.contentType}
                          </Text>
                          {lesson.isLocked && lesson.unlockRequirement ? (
                            <Text style={styles.lessonButtonLockNote}>
                              {lesson.unlockRequirement}
                            </Text>
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </View>
            ) : null}

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
  analyticsCopy: {
    flex: 1,
    gap: mobileTheme.spacing.xs
  },
  analyticsLabel: {
    color: mobileTheme.colors.textPrimary,
    fontSize: mobileTheme.typography.body,
    fontWeight: "700"
  },
  analyticsMeta: {
    color: mobileTheme.colors.textSecondary,
    fontSize: mobileTheme.typography.caption
  },
  analyticsRow: {
    alignItems: "center",
    borderTopColor: mobileTheme.colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: mobileTheme.spacing.sm,
    paddingTop: mobileTheme.spacing.sm
  },
  analyticsValue: {
    color: mobileTheme.colors.textPrimary,
    fontSize: mobileTheme.typography.body,
    fontWeight: "800"
  },
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
  footerNote: {
    color: mobileTheme.colors.textSecondary,
    fontSize: mobileTheme.typography.caption,
    lineHeight: 18
  },
  lessonButton: {
    borderColor: mobileTheme.colors.border,
    borderRadius: mobileTheme.radii.md,
    borderWidth: 1,
    gap: mobileTheme.spacing.xs,
    padding: mobileTheme.spacing.sm
  },
  lessonButtonActive: {
    borderColor: mobileTheme.colors.accentStrong,
    backgroundColor: mobileTheme.colors.surfaceMuted
  },
  lessonButtonLocked: {
    opacity: 0.65
  },
  lessonButtonLockNote: {
    color: mobileTheme.colors.danger,
    fontSize: mobileTheme.typography.caption,
    lineHeight: 18
  },
  lessonButtonMeta: {
    color: mobileTheme.colors.textSecondary,
    fontSize: mobileTheme.typography.caption
  },
  lessonButtonTitle: {
    color: mobileTheme.colors.textPrimary,
    fontSize: mobileTheme.typography.body,
    fontWeight: "700"
  },
  lessonButtonTitleActive: {
    color: mobileTheme.colors.accentStrong
  },
  lessonTitle: {
    color: mobileTheme.colors.textPrimary,
    fontSize: mobileTheme.typography.section,
    fontWeight: "800"
  },
  lockNote: {
    color: mobileTheme.colors.danger,
    fontSize: mobileTheme.typography.caption,
    lineHeight: 18
  },
  metaChip: {
    color: mobileTheme.colors.textSecondary,
    fontSize: mobileTheme.typography.caption,
    fontWeight: "700"
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: mobileTheme.spacing.sm
  },
  moduleBlock: {
    gap: mobileTheme.spacing.sm
  },
  moduleTitle: {
    color: mobileTheme.colors.textPrimary,
    fontSize: mobileTheme.typography.body,
    fontWeight: "800"
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
