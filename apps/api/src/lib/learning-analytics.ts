import type { LearningAnalyticsResponse } from "@colonels-academy/contracts";
import type { DatabaseClient } from "@colonels-academy/database";

import { computeWeightedCoursePerformance } from "./assessment-weighting";
import { LessonSubmissionError } from "./lesson-submissions";

function minutesBetween(startedAt: Date, endedAt?: Date | null) {
  const end = endedAt ?? new Date();
  const diffMs = Math.max(0, end.getTime() - startedAt.getTime());

  return Math.max(0, Math.round(diffMs / 60_000));
}

export async function getLearningAnalytics(
  prisma: DatabaseClient,
  userId: string,
  courseSlug: string
): Promise<LearningAnalyticsResponse> {
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: { id: true, slug: true, assessmentWeighting: true }
  });

  if (!course) {
    throw new LessonSubmissionError("Course not found.", 404);
  }

  const [attempts, studySessions, submissions] = await Promise.all([
    prisma.quizAttempt.findMany({
      where: {
        userId,
        courseId: course.id,
        lesson: {
          subjectArea: {
            not: null
          }
        }
      },
      select: {
        questionId: true,
        isCorrect: true,
        difficultySnapshot: true,
        attemptedAt: true,
        lesson: {
          select: {
            title: true,
            subjectArea: true,
            componentCode: true,
            componentLabel: true
          }
        }
      }
    }),
    prisma.studySession.findMany({
      where: {
        userId,
        courseId: course.id
      },
      select: {
        startedAt: true,
        endedAt: true
      }
    }),
    prisma.lessonSubmission.findMany({
      where: {
        userId,
        courseId: course.id
      },
      select: {
        status: true
      }
    })
  ]);

  const weightedPerformance = computeWeightedCoursePerformance({
    courseSlug: course.slug,
    assessmentWeighting: course.assessmentWeighting,
    attempts: attempts.map((attempt) => ({
      questionId: attempt.questionId,
      isCorrect: attempt.isCorrect,
      difficulty: Math.max(1, attempt.difficultySnapshot),
      attemptedAt: attempt.attemptedAt,
      lessonTitle: attempt.lesson.title,
      subjectArea: attempt.lesson.subjectArea,
      componentCode: attempt.lesson.componentCode,
      componentLabel: attempt.lesson.componentLabel
    }))
  });

  return {
    courseSlug: course.slug,
    summary: {
      totalStudyMinutes: studySessions.reduce(
        (sum, session) => sum + minutesBetween(session.startedAt, session.endedAt),
        0
      ),
      submissionCount: submissions.length,
      pendingSubmissionReviews: submissions.filter((submission) => submission.status !== "REVIEWED")
        .length,
      ...(weightedPerformance.weightingMode !== "none"
        ? { weightingMode: weightedPerformance.weightingMode }
        : {}),
      ...(weightedPerformance.overallWeightedReadinessPercent !== undefined
        ? { overallWeightedReadinessPercent: weightedPerformance.overallWeightedReadinessPercent }
        : {}),
      ...(weightedPerformance.weightingLabel
        ? { weightingLabel: weightedPerformance.weightingLabel }
        : {})
    },
    subjects: weightedPerformance.subjects
  };
}
