import type { Job } from "bullmq";

import type { QuizAttemptJob } from "@colonels-academy/contracts";
import { db } from "@colonels-academy/database";

const WINDOW = 10; // last N attempts used to compute mastery
const RECENCY_SPLIT = 5; // first half vs. second half of window
const SPEED_MIN = 0.7;
const SPEED_MAX = 1.2;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Quiz Mastery Recalculation Job
 *
 * Formula (last 10 attempts for userId × courseId):
 *   masteryScore = (correctCount / totalCount) * 100
 *                * recencyWeight               // later 5 attempts weighted 1.3×, earlier 0.7×
 *                * speedConfidenceMultiplier   // clamp(avgMs / studentMs, 0.7, 1.2)
 *
 * speedConfidenceMultiplier: answering faster than peers → up to 1.2× boost;
 * slower than 2× avg → 0.7× penalty.
 *
 * The computed score is logged as a structured event. Persistent storage (e.g. a
 * MasteryScore table or Enrollment.quizMasteryPercent) will be added in the next
 * migration once the UX requirements for surfacing the score are confirmed.
 */
export async function handleQuizMastery(job: Job<QuizAttemptJob>): Promise<void> {
  const { userId, courseId, questionId, lessonId } = job.data;

  // Fetch last WINDOW attempts for this user × course, newest first
  const attempts = await db.quizAttempt.findMany({
    where: { userId, courseId },
    orderBy: { attemptedAt: "desc" },
    take: WINDOW,
    select: { isCorrect: true, timeTakenMs: true }
  });

  if (attempts.length === 0) {
    return;
  }

  const totalCount = attempts.length;
  const correctCount = attempts.filter((a) => a.isCorrect).length;
  const baseAccuracy = correctCount / totalCount;

  // Recency weight: later half of the window (index 0..RECENCY_SPLIT-1, i.e. most recent)
  // counts more than the earlier half.
  const recentCorrect = attempts.slice(0, RECENCY_SPLIT).filter((a) => a.isCorrect).length;
  const olderCorrect = attempts.slice(RECENCY_SPLIT).filter((a) => a.isCorrect).length;
  const recentTotal = Math.min(totalCount, RECENCY_SPLIT);
  const olderTotal = Math.max(0, totalCount - RECENCY_SPLIT);

  // Weighted accuracy: recent attempts get 1.3×, older get 0.7×
  const weightedNumerator = recentCorrect * 1.3 + olderCorrect * 0.7;
  const weightedDenominator = recentTotal * 1.3 + olderTotal * 0.7;
  const recencyWeight = weightedDenominator > 0 ? weightedNumerator / weightedDenominator : 1;

  // Speed confidence: compare student's avg time against cohort avg for this course
  const studentAvgMs = attempts.reduce((sum, a) => sum + a.timeTakenMs, 0) / totalCount;

  const cohortAgg = await db.quizAttempt.aggregate({
    where: { courseId },
    _avg: { timeTakenMs: true }
  });
  const cohortAvgMs = cohortAgg._avg.timeTakenMs ?? studentAvgMs;

  // ratio > 1 means student is faster than average → boost; < 1 means slower → penalty
  const speedRatio = cohortAvgMs / studentAvgMs;
  const speedConfidenceMultiplier = clamp(speedRatio, SPEED_MIN, SPEED_MAX);

  const masteryScore = Math.round(baseAccuracy * 100 * recencyWeight * speedConfidenceMultiplier);

  console.info(
    JSON.stringify({
      level: "info",
      event: "quiz-mastery.computed",
      service: "worker",
      time: new Date().toISOString(),
      userId,
      courseId,
      lessonId,
      questionId,
      totalAttempts: totalCount,
      correctCount,
      studentAvgMs: Math.round(studentAvgMs),
      cohortAvgMs: Math.round(cohortAvgMs),
      speedConfidenceMultiplier,
      recencyWeight,
      masteryScore
    })
  );
}
