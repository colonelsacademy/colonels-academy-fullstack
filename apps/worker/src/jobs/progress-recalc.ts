import type { Job } from "bullmq";

import type { ProgressRecalcJob } from "@colonels-academy/contracts";
import { db } from "@colonels-academy/database";

/**
 * Progress Recalculation Worker Job
 *
 * Formula:
 *   progressPercent = round( completedLessons / totalLessons * 100 )
 *
 * Upserts the computed value into Enrollment.progressPercent.
 */
export async function handleProgressRecalc(job: Job<ProgressRecalcJob>): Promise<void> {
  const { userId, courseId, triggeredBy } = job.data;

  // Count total published lessons in the course
  const totalLessons = await db.lesson.count({
    where: { courseId }
  });

  if (totalLessons === 0) {
    // Nothing to compute — mark as 0 and bail early
    await db.enrollment.updateMany({
      where: { userId, courseId },
      data: { progressPercent: 0 }
    });
    return;
  }

  // Count completed lessons for this user in this course
  const completedLessons = await db.userProgress.count({
    where: { userId, courseId, status: "COMPLETED" }
  });

  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  await db.enrollment.updateMany({
    where: { userId, courseId },
    data: { progressPercent }
  });

  // Structured log — the worker wrapper will pick this up
  console.info(
    JSON.stringify({
      level: "info",
      event: "progress-recalc.completed",
      service: "worker",
      time: new Date().toISOString(),
      userId,
      courseId,
      triggeredBy,
      totalLessons,
      completedLessons,
      progressPercent
    })
  );
}
