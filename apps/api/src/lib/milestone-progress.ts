import {
  type PhaseMilestoneCriterion,
  phaseMilestoneCriterionSchema
} from "@colonels-academy/contracts";
import type { DatabaseClient } from "@colonels-academy/database";

import { SUBJECT_LABELS, computeWeightedCoursePerformance } from "./assessment-weighting";
import { getMockExamAttemptContext } from "./mock-exam";

type MilestoneDefinition = {
  id: string;
  phaseNumber: number;
  title: string;
  description: string;
  criteria: PhaseMilestoneCriterion[];
};

type CriterionEvaluation = {
  criterion: PhaseMilestoneCriterion;
  satisfied: boolean;
  detail: string;
};

export class MilestoneProgressError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "MilestoneProgressError";
    this.statusCode = statusCode;
  }
}

export interface MilestoneProgressSnapshot {
  milestoneId: string;
  phaseNumber: number;
  title: string;
  description: string;
  completionStatus: "PENDING_REVIEW" | "PASSED" | null;
  autoCriteriaSatisfied: boolean;
  manualReviewRequired: boolean;
  evaluation: CriterionEvaluation[];
  passedAt?: string;
  approvedByUserId?: string;
  notes?: string;
}

export function parseCriteria(
  criteria: unknown,
  fallback: PhaseMilestoneCriterion[] = []
): PhaseMilestoneCriterion[] {
  const parsed = phaseMilestoneCriterionSchema.array().safeParse(criteria);

  if (!parsed.success) {
    return fallback;
  }

  return parsed.data.map((criterion) => ({
    kind: criterion.kind,
    label: criterion.label,
    manualReview: criterion.manualReview,
    ...(criterion.threshold !== undefined ? { threshold: criterion.threshold } : {}),
    ...(criterion.unit !== undefined ? { unit: criterion.unit } : {}),
    ...(criterion.subjectArea !== undefined ? { subjectArea: criterion.subjectArea } : {})
  }));
}

async function getMilestoneDefinition(
  prisma: DatabaseClient,
  courseId: string,
  phaseNumber: number
): Promise<MilestoneDefinition | null> {
  const milestone = await prisma.phaseMilestone.findUnique({
    where: {
      courseId_phaseNumber: {
        courseId,
        phaseNumber
      }
    },
    select: {
      id: true,
      phaseNumber: true,
      title: true,
      description: true,
      criteria: true
    }
  });

  if (!milestone) {
    return null;
  }

  return {
    ...milestone,
    criteria: parseCriteria(milestone.criteria)
  };
}

async function evaluateQuizScoreCriterion(
  prisma: DatabaseClient,
  userId: string,
  courseId: string,
  phaseNumber: number,
  criterion: PhaseMilestoneCriterion
): Promise<CriterionEvaluation> {
  const [totalQuestions, attempts] = await Promise.all([
    prisma.quizQuestion.count({
      where: {
        lesson: {
          courseId,
          phaseNumber
        }
      }
    }),
    prisma.quizAttempt.findMany({
      where: {
        userId,
        courseId,
        lesson: {
          phaseNumber
        }
      },
      select: {
        questionId: true,
        isCorrect: true,
        attemptedAt: true
      },
      orderBy: {
        attemptedAt: "desc"
      }
    })
  ]);

  if (totalQuestions === 0) {
    return {
      criterion,
      satisfied: false,
      detail: "No quiz questions have been configured for this phase yet."
    };
  }

  const latestAttemptByQuestion = new Map<string, boolean>();

  for (const attempt of attempts) {
    if (!latestAttemptByQuestion.has(attempt.questionId)) {
      latestAttemptByQuestion.set(attempt.questionId, attempt.isCorrect);
    }
  }

  const attemptedQuestions = latestAttemptByQuestion.size;
  const correctCount = Array.from(latestAttemptByQuestion.values()).filter(Boolean).length;
  const scorePercent =
    attemptedQuestions > 0 ? Math.round((correctCount / attemptedQuestions) * 100) : 0;
  const threshold = criterion.threshold ?? 0;

  const satisfied = attemptedQuestions >= totalQuestions && scorePercent >= threshold;

  return {
    criterion,
    satisfied,
    detail:
      attemptedQuestions < totalQuestions
        ? `Attempt ${totalQuestions} quiz questions in this phase to unlock evaluation (${attemptedQuestions}/${totalQuestions} completed).`
        : `Latest phase quiz score: ${scorePercent}% (${correctCount}/${attemptedQuestions})`
  };
}

async function evaluateAssessmentCriterion(
  prisma: DatabaseClient,
  userId: string,
  courseId: string,
  phaseNumber: number,
  criterion: PhaseMilestoneCriterion
): Promise<CriterionEvaluation> {
  const [course, attemptContext] = await Promise.all([
    prisma.course.findUnique({
      where: { id: courseId },
      select: {
        slug: true,
        assessmentWeighting: true
      }
    }),
    getMockExamAttemptContext({
      prisma,
      userId,
      courseId,
      phaseNumber
    })
  ]);

  if (!attemptContext || attemptContext.totalQuestions === 0) {
    return {
      criterion,
      satisfied: false,
      detail: "No mock exam has been configured for this phase yet."
    };
  }

  if (attemptContext.attempts.length === 0) {
    return {
      criterion,
      satisfied: false,
      detail: "No mock exam attempts are available for this phase yet."
    };
  }

  if (attemptContext.attemptedQuestions < attemptContext.totalQuestions) {
    return {
      criterion,
      satisfied: false,
      detail: `Complete all ${attemptContext.totalQuestions} mock exam questions before this milestone can be evaluated (${attemptContext.attemptedQuestions}/${attemptContext.totalQuestions} attempted).`
    };
  }

  if (criterion.kind === "ASSESSMENT_ATTEMPT") {
    if (criterion.subjectArea) {
      const subjectAttempts = attemptContext.attempts.filter(
        (attempt) => attempt.lesson.subjectArea === criterion.subjectArea
      );

      return {
        criterion,
        satisfied: subjectAttempts.length > 0,
        detail:
          subjectAttempts.length > 0
            ? `Completed ${attemptContext.source === "session" ? "mock exam session" : "mock exam attempt set"} ${
                attemptContext.sessionId ?? "for this phase"
              } with ${subjectAttempts.length} ${SUBJECT_LABELS[
                criterion.subjectArea
              ].toLowerCase()} questions.`
            : `No ${SUBJECT_LABELS[criterion.subjectArea].toLowerCase()} questions were found in the latest completed mock exam session.`
      };
    }

    return {
      criterion,
      satisfied: true,
      detail:
        attemptContext.source === "session" && attemptContext.sessionId
          ? `Completed mock exam session ${attemptContext.sessionId}.`
          : "Completed the phase mock exam question set."
    };
  }

  const weightedPerformance = computeWeightedCoursePerformance({
    courseSlug: course?.slug ?? "",
    assessmentWeighting: course?.assessmentWeighting,
    attempts: attemptContext.attempts.map((attempt) => ({
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

  const subjectPerformance = criterion.subjectArea
    ? weightedPerformance.subjects.find((subject) => subject.subjectArea === criterion.subjectArea)
    : null;
  const scorePercent = subjectPerformance
    ? subjectPerformance.examWeightedReadinessPercent
    : (weightedPerformance.overallWeightedReadinessPercent ?? weightedPerformance.rawScorePercent);
  const threshold = criterion.threshold ?? 0;
  const detailPrefix = criterion.subjectArea
    ? `${SUBJECT_LABELS[criterion.subjectArea]} weighted mock exam score`
    : "Latest completed mock exam score";
  const detailSuffix = subjectPerformance
    ? weightedPerformance.weightingMode !== "none"
      ? `weighted ${scorePercent}% across ${subjectPerformance.latestAttemptCount} subject questions`
      : `${scorePercent}% across ${subjectPerformance.latestAttemptCount} subject questions`
    : weightedPerformance.weightingMode !== "none"
      ? `weighted ${scorePercent}% (raw ${weightedPerformance.rawScorePercent}% from ${weightedPerformance.rawCorrectCount}/${attemptContext.totalQuestions})`
      : `${scorePercent}% (${weightedPerformance.rawCorrectCount}/${attemptContext.totalQuestions})`;

  return {
    criterion,
    satisfied: scorePercent >= threshold,
    detail: `${detailPrefix}: ${detailSuffix}`
  };
}

async function evaluateCriterion(
  prisma: DatabaseClient,
  userId: string,
  courseId: string,
  phaseNumber: number,
  criterion: PhaseMilestoneCriterion
): Promise<CriterionEvaluation> {
  switch (criterion.kind) {
    case "QUIZ_SCORE":
      return evaluateQuizScoreCriterion(prisma, userId, courseId, phaseNumber, criterion);
    case "ASSESSMENT_ATTEMPT":
    case "ASSESSMENT_SCORE":
      return evaluateAssessmentCriterion(prisma, userId, courseId, phaseNumber, criterion);
    case "SUBMISSION_REVIEW": {
      const reviewedSubmission = await prisma.lessonSubmission.findFirst({
        where: {
          userId,
          courseId,
          status: "REVIEWED",
          ...(criterion.subjectArea ? { subjectArea: criterion.subjectArea } : {}),
          OR: [{ phaseNumber }, { lesson: { phaseNumber } }]
        },
        orderBy: [{ reviewedAt: "desc" }, { submittedAt: "desc" }],
        select: {
          id: true,
          reviewedAt: true,
          score: true,
          maxScore: true
        }
      });

      if (!reviewedSubmission) {
        return {
          criterion,
          satisfied: false,
          detail: criterion.subjectArea
            ? `No reviewed ${criterion.subjectArea.toLowerCase().replaceAll("_", " ")} submission is available for this phase yet.`
            : "No reviewed submission is available for this phase yet."
        };
      }

      const threshold = criterion.threshold ?? 0;
      const scorePercent =
        reviewedSubmission.score !== null &&
        reviewedSubmission.maxScore !== null &&
        reviewedSubmission.maxScore > 0
          ? Math.round((reviewedSubmission.score / reviewedSubmission.maxScore) * 100)
          : null;
      const satisfied = scorePercent !== null ? scorePercent >= threshold : true;

      return {
        criterion,
        satisfied,
        detail:
          scorePercent !== null
            ? `Reviewed submission ${reviewedSubmission.id} scored ${scorePercent}%.`
            : `Reviewed submission ${reviewedSubmission.id} is available.`
      };
    }
    case "DS_APPROVAL":
    case "COUNSELLING":
      return {
        criterion,
        satisfied: false,
        detail: "Requires manual review and approval."
      };
    default:
      return {
        criterion,
        satisfied: false,
        detail: "Unsupported milestone criterion."
      };
  }
}

function buildSnapshot(
  milestone: MilestoneDefinition,
  completion: {
    status: "PENDING_REVIEW" | "PASSED";
    passedAt: Date | null;
    approvedByUserId: string | null;
    notes: string | null;
  } | null,
  evaluation: CriterionEvaluation[]
): MilestoneProgressSnapshot {
  const autoCriteria = evaluation.filter((entry) => !entry.criterion.manualReview);
  const manualReviewRequired = evaluation.some((entry) => entry.criterion.manualReview);

  return {
    milestoneId: milestone.id,
    phaseNumber: milestone.phaseNumber,
    title: milestone.title,
    description: milestone.description,
    completionStatus: completion?.status ?? null,
    autoCriteriaSatisfied:
      autoCriteria.length > 0
        ? autoCriteria.every((entry) => entry.satisfied)
        : manualReviewRequired,
    manualReviewRequired,
    evaluation,
    ...(completion?.passedAt ? { passedAt: completion.passedAt.toISOString() } : {}),
    ...(completion?.approvedByUserId ? { approvedByUserId: completion.approvedByUserId } : {}),
    ...(completion?.notes ? { notes: completion.notes } : {})
  };
}

export async function evaluateAndRecordAutoMilestone(
  prisma: DatabaseClient,
  userId: string,
  courseId: string,
  phaseNumber: number
): Promise<MilestoneProgressSnapshot | null> {
  const milestone = await getMilestoneDefinition(prisma, courseId, phaseNumber);

  if (!milestone) {
    return null;
  }

  const existing = await prisma.phaseMilestoneCompletion.findUnique({
    where: {
      userId_milestoneId: {
        userId,
        milestoneId: milestone.id
      }
    },
    select: {
      status: true,
      passedAt: true,
      approvedByUserId: true,
      notes: true
    }
  });

  if (existing?.status === "PASSED") {
    const evaluation = await Promise.all(
      milestone.criteria.map((criterion) =>
        evaluateCriterion(prisma, userId, courseId, phaseNumber, criterion)
      )
    );

    return buildSnapshot(milestone, existing, evaluation);
  }

  const evaluation = await Promise.all(
    milestone.criteria.map((criterion) =>
      evaluateCriterion(prisma, userId, courseId, phaseNumber, criterion)
    )
  );

  const autoCriteria = evaluation.filter((entry) => !entry.criterion.manualReview);

  if (autoCriteria.length === 0) {
    return buildSnapshot(milestone, existing, evaluation);
  }

  if (!autoCriteria.every((entry) => entry.satisfied)) {
    return buildSnapshot(milestone, existing, evaluation);
  }

  const manualReviewRequired = evaluation.some((entry) => entry.criterion.manualReview);

  const completion = await prisma.phaseMilestoneCompletion.upsert({
    where: {
      userId_milestoneId: {
        userId,
        milestoneId: milestone.id
      }
    },
    update: manualReviewRequired
      ? {
          status: "PENDING_REVIEW"
        }
      : {
          status: "PASSED",
          passedAt: new Date()
        },
    create: {
      userId,
      courseId,
      milestoneId: milestone.id,
      status: manualReviewRequired ? "PENDING_REVIEW" : "PASSED",
      ...(manualReviewRequired ? {} : { passedAt: new Date() })
    },
    select: {
      status: true,
      passedAt: true,
      approvedByUserId: true,
      notes: true
    }
  });

  return buildSnapshot(milestone, completion, evaluation);
}

export async function requestMilestoneReview(
  prisma: DatabaseClient,
  userId: string,
  courseId: string,
  phaseNumber: number,
  notes?: string
): Promise<MilestoneProgressSnapshot> {
  const milestone = await getMilestoneDefinition(prisma, courseId, phaseNumber);

  if (!milestone) {
    throw new MilestoneProgressError("Milestone not configured for this phase.", 404);
  }

  const evaluation = await Promise.all(
    milestone.criteria.map((criterion) =>
      evaluateCriterion(prisma, userId, courseId, phaseNumber, criterion)
    )
  );

  const manualCriteria = evaluation.filter((entry) => entry.criterion.manualReview);

  if (manualCriteria.length === 0) {
    throw new MilestoneProgressError("This milestone does not require manual review.", 400);
  }

  const autoCriteria = evaluation.filter((entry) => !entry.criterion.manualReview);

  if (autoCriteria.length > 0 && !autoCriteria.every((entry) => entry.satisfied)) {
    throw new MilestoneProgressError(
      "Complete the automatic milestone requirements before requesting DS review.",
      400
    );
  }

  const completion = await prisma.phaseMilestoneCompletion.upsert({
    where: {
      userId_milestoneId: {
        userId,
        milestoneId: milestone.id
      }
    },
    update: {
      status: "PENDING_REVIEW",
      ...(notes ? { notes } : {})
    },
    create: {
      userId,
      courseId,
      milestoneId: milestone.id,
      status: "PENDING_REVIEW",
      ...(notes ? { notes } : {})
    },
    select: {
      status: true,
      passedAt: true,
      approvedByUserId: true,
      notes: true
    }
  });

  return buildSnapshot(milestone, completion, evaluation);
}

export async function approveMilestoneReview(
  prisma: DatabaseClient,
  targetUserId: string,
  courseId: string,
  phaseNumber: number,
  approvedByUserId: string,
  notes?: string
): Promise<MilestoneProgressSnapshot> {
  const approver = await prisma.user.findUnique({
    where: { id: approvedByUserId },
    select: { role: true }
  });

  if (!approver) {
    throw new MilestoneProgressError("Approver not found.", 404);
  }

  const approverRole = approver.role.toLowerCase();

  if (approverRole !== "ds" && approverRole !== "admin") {
    throw new MilestoneProgressError("Only DS or admin can approve this milestone.", 403);
  }

  const milestone = await getMilestoneDefinition(prisma, courseId, phaseNumber);

  if (!milestone) {
    throw new MilestoneProgressError("Milestone not configured for this phase.", 404);
  }

  const completion = await prisma.phaseMilestoneCompletion.upsert({
    where: {
      userId_milestoneId: {
        userId: targetUserId,
        milestoneId: milestone.id
      }
    },
    update: {
      status: "PASSED",
      passedAt: new Date(),
      approvedByUserId,
      ...(notes ? { notes } : {})
    },
    create: {
      userId: targetUserId,
      courseId,
      milestoneId: milestone.id,
      status: "PASSED",
      passedAt: new Date(),
      approvedByUserId,
      ...(notes ? { notes } : {})
    },
    select: {
      status: true,
      passedAt: true,
      approvedByUserId: true,
      notes: true
    }
  });

  const evaluation = await Promise.all(
    milestone.criteria.map((criterion) =>
      evaluateCriterion(prisma, targetUserId, courseId, phaseNumber, criterion)
    )
  );

  return buildSnapshot(milestone, completion, evaluation);
}

export async function listPendingMilestoneReviews(prisma: DatabaseClient, courseId: string) {
  return prisma.phaseMilestoneCompletion.findMany({
    where: {
      courseId,
      status: "PENDING_REVIEW"
    },
    orderBy: [{ createdAt: "asc" }],
    select: {
      id: true,
      createdAt: true,
      notes: true,
      user: {
        select: {
          id: true,
          email: true,
          displayName: true
        }
      },
      milestone: {
        select: {
          phaseNumber: true,
          title: true,
          description: true
        }
      }
    }
  });
}
