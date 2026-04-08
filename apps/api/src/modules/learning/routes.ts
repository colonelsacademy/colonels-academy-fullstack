import { Queue } from "bullmq";
import type { FastifyPluginAsync } from "fastify";

import { defaultJobOptions, queueNames } from "@colonels-academy/config";
import type {
  ProgressRecalcJob,
  QuizAttemptJob,
  SubjectArea,
  SubmissionType
} from "@colonels-academy/contracts";

import { assertLessonAccess } from "../../lib/access-guard";
import { getCourseMilestones } from "../../lib/course-phase-plan";
import { getLearningAnalytics } from "../../lib/learning-analytics";
import {
  LessonSubmissionError,
  createLessonSubmission,
  listCourseSubmissions
} from "../../lib/lesson-submissions";
import {
  MilestoneProgressError,
  evaluateAndRecordAutoMilestone,
  requestMilestoneReview
} from "../../lib/milestone-progress";
import {
  finalizeMockExamSessionIfComplete,
  findOrCreateMockExamSession,
  listPhaseMockExamLessonIds
} from "../../lib/mock-exam";
import { StudySessionError, startStudySession, updateStudySession } from "../../lib/study-session";

// ── Params / Body types ───────────────────────────────────────────────────────

type LessonProgressParams = { Params: { lessonId: string } };
type LessonProgressBody = { Body: { status: "IN_PROGRESS" | "COMPLETED" } };

type QuizAttemptBody = {
  Body: {
    questionId: string;
    selectedOptionIndex: number;
    timeTakenMs: number;
    sessionId?: string;
  };
};

type MilestoneReviewRequestBody = {
  Body: {
    notes?: string;
  };
};

type StudySessionStartBody = {
  Body: {
    courseSlug: string;
    lessonId?: string;
    source?: "WEB" | "MOBILE" | "MANUAL";
    deviceSessionId?: string;
  };
};

type StudySessionUpdateBody = {
  Body: {
    deviceSessionId?: string;
  };
};

type SubmissionCreateBody = {
  Body: {
    courseSlug: string;
    lessonId?: string;
    phaseNumber?: number;
    subjectArea?: SubjectArea;
    submissionType: SubmissionType;
    title: string;
    body?: string;
    assetUrl?: string;
  };
};

const learningRoutes: FastifyPluginAsync = async (fastify) => {
  // Lazy-init queues — only created on first request that needs them
  let progressRecalcQueue: Queue<ProgressRecalcJob> | null = null;
  let quizMasteryQueue: Queue<QuizAttemptJob> | null = null;

  function getRedisConnection() {
    if (!fastify.redis) {
      throw fastify.httpErrors.serviceUnavailable("Redis-backed queues are not configured.");
    }

    return fastify.redis;
  }

  function getProgressQueue() {
    if (!progressRecalcQueue) {
      progressRecalcQueue = new Queue<ProgressRecalcJob>(queueNames.progressRecalc, {
        connection: getRedisConnection(),
        defaultJobOptions
      });
    }
    return progressRecalcQueue;
  }

  // ── GET /v1/learning/enrollments ───────────────────────────────────────────
  fastify.get("/enrollments", async (request, reply) => {
    const authUser = await fastify.requireAuth(request);

    const dbUser = await fastify.prisma.user.findUnique({
      where: { firebaseUid: authUser.uid },
      select: { id: true }
    });

    if (!dbUser) {
      return reply.notFound("User not found in database.");
    }

    const enrollments = await fastify.prisma.enrollment.findMany({
      where: { userId: dbUser.id, status: "ACTIVE" },
      include: {
        course: {
          select: {
            slug: true,
            title: true,
            heroImageUrl: true,
            accentColor: true,
            _count: { select: { lessons: true } }
          }
        }
      },
      orderBy: { purchasedAt: "desc" }
    });

    // Get completed lesson counts per course
    const completedCounts = await fastify.prisma.userProgress.groupBy({
      by: ["courseId"],
      where: {
        userId: dbUser.id,
        status: "COMPLETED",
        courseId: { in: enrollments.map((e) => e.courseId) }
      },
      _count: { lessonId: true }
    });

    const completedMap = new Map(completedCounts.map((c) => [c.courseId, c._count.lessonId]));

    return {
      items: enrollments.map((e) => ({
        enrollmentId: e.id,
        courseSlug: e.course.slug,
        courseTitle: e.course.title,
        heroImageUrl: e.course.heroImageUrl ?? undefined,
        accentColor: e.course.accentColor ?? "#D4AF37",
        progressPercent: e.progressPercent,
        completedLessons: completedMap.get(e.courseId) ?? 0,
        totalLessons: e.course._count.lessons,
        enrolledAt: e.purchasedAt.toISOString(),
        status: e.status as "ACTIVE" | "PENDING" | "EXPIRED" | "REFUNDED",
        lastAccessedAt: e.updatedAt?.toISOString()
      }))
    };
  });
  function getQuizMasteryQueue() {
    if (!quizMasteryQueue) {
      quizMasteryQueue = new Queue<QuizAttemptJob>(queueNames.quizMastery, {
        connection: getRedisConnection(),
        defaultJobOptions
      });
    }
    return quizMasteryQueue;
  }

  // ── GET /v1/learning/dashboard/overview ────────────────────────────────────
  fastify.get("/dashboard/overview", async (request) => {
    const { user: authUser } = await fastify.authenticateRequest(request);

    if (!authUser) {
      return {
        authenticated: false,
        user: null,
        overview: {
          progressPercent: 0,
          enrolledCourses: 0,
          upcomingSessionCount: 0,
          pendingTasks: 0,
          completionTarget: "N/A"
        },
        note: "Not authenticated."
      };
    }

    // Look up the user's DB record via firebaseUid
    const dbUser = await fastify.prisma.user.findUnique({
      where: { firebaseUid: authUser.uid },
      select: { id: true, role: true }
    });

    if (!dbUser) {
      return {
        authenticated: true,
        user: { uid: authUser.uid, email: authUser.email, role: authUser.role },
        overview: {
          progressPercent: 0,
          enrolledCourses: 0,
          upcomingSessionCount: 0,
          pendingTasks: 0,
          completionTarget: "TBD"
        },
        note: "User exists in Firebase but not yet in the database."
      };
    }

    // Aggregate progress across all active enrollments
    const enrollments = await fastify.prisma.enrollment.findMany({
      where: { userId: dbUser.id, status: "ACTIVE" },
      select: { progressPercent: true }
    });

    const enrolledCourses = enrollments.length;
    const progressPercent =
      enrolledCourses > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + e.progressPercent, 0) / enrolledCourses)
        : 0;

    // Count upcoming live sessions
    const upcomingSessionCount = await fastify.prisma.liveSession.count({
      where: { startsAt: { gt: new Date() } }
    });

    return {
      authenticated: true,
      user: { uid: authUser.uid, email: authUser.email, role: authUser.role },
      overview: {
        progressPercent,
        enrolledCourses,
        upcomingSessionCount,
        pendingTasks: 0,
        completionTarget: "On track"
      },
      note: null
    };
  });

  // ── POST /v1/learning/progress/:lessonId ───────────────────────────────────
  fastify.get<{ Params: { courseSlug: string } }>(
    "/milestones/:courseSlug",
    async (request, reply) => {
      const { user: authUser } = await fastify.authenticateRequest(request);

      let dbUserId: string | undefined;
      if (authUser) {
        const dbUser = await fastify.prisma.user.findUnique({
          where: { firebaseUid: authUser.uid },
          select: { id: true }
        });
        dbUserId = dbUser?.id;
      }

      const response = await getCourseMilestones(
        fastify.prisma,
        request.log,
        request.params.courseSlug,
        dbUserId,
        authUser?.role
      );

      if (!response) {
        return reply.notFound("Milestones not found for this course.");
      }

      return response;
    }
  );

  fastify.get<{ Params: { courseSlug: string } }>(
    "/analytics/:courseSlug",
    async (request, reply) => {
      const authUser = await fastify.requireAuth(request);

      const dbUser = await fastify.prisma.user.findUnique({
        where: { firebaseUid: authUser.uid },
        select: { id: true }
      });

      if (!dbUser) {
        return reply.notFound("User not found in database.");
      }

      try {
        return await getLearningAnalytics(fastify.prisma, dbUser.id, request.params.courseSlug);
      } catch (error) {
        if (error instanceof LessonSubmissionError) {
          return reply.status(error.statusCode).send({
            message: error.message,
            statusCode: error.statusCode
          });
        }

        throw error;
      }
    }
  );

  fastify.get<{ Params: { courseSlug: string } }>(
    "/submissions/:courseSlug",
    async (request, reply) => {
      const authUser = await fastify.requireAuth(request);

      const dbUser = await fastify.prisma.user.findUnique({
        where: { firebaseUid: authUser.uid },
        select: { id: true }
      });

      if (!dbUser) {
        return reply.notFound("User not found in database.");
      }

      try {
        const items = await listCourseSubmissions(
          fastify.prisma,
          dbUser.id,
          request.params.courseSlug
        );

        return {
          courseSlug: request.params.courseSlug,
          items
        };
      } catch (error) {
        if (error instanceof LessonSubmissionError) {
          return reply.status(error.statusCode).send({
            message: error.message,
            statusCode: error.statusCode
          });
        }

        throw error;
      }
    }
  );

  fastify.post<SubmissionCreateBody>("/submissions", async (request, reply) => {
    const authUser = await fastify.requireAuth(request);

    const dbUser = await fastify.prisma.user.findUnique({
      where: { firebaseUid: authUser.uid },
      select: { id: true }
    });

    if (!dbUser) {
      return reply.notFound("User not found in database.");
    }

    if (!request.body.title?.trim()) {
      return reply.badRequest("A submission title is required.");
    }

    try {
      const submission = await createLessonSubmission({
        fastify,
        auth: {
          userId: dbUser.id,
          ...(authUser.role ? { userRole: authUser.role } : {})
        },
        courseSlug: request.body.courseSlug,
        submissionType: request.body.submissionType,
        title: request.body.title,
        ...(request.body.lessonId ? { lessonId: request.body.lessonId } : {}),
        ...(request.body.phaseNumber ? { phaseNumber: request.body.phaseNumber } : {}),
        ...(request.body.subjectArea ? { subjectArea: request.body.subjectArea } : {}),
        ...(request.body.body ? { body: request.body.body } : {}),
        ...(request.body.assetUrl ? { assetUrl: request.body.assetUrl } : {})
      });

      return {
        ok: true,
        submission,
        note: "Submission received."
      };
    } catch (error) {
      if (error instanceof LessonSubmissionError) {
        return reply.status(error.statusCode).send({
          message: error.message,
          statusCode: error.statusCode
        });
      }

      throw error;
    }
  });

  fastify.post<
    { Params: { courseSlug: string; phaseNumber: string } } & MilestoneReviewRequestBody
  >("/milestones/:courseSlug/:phaseNumber/request-review", async (request, reply) => {
    const authUser = await fastify.requireAuth(request);

    const dbUser = await fastify.prisma.user.findUnique({
      where: { firebaseUid: authUser.uid },
      select: { id: true }
    });

    if (!dbUser) {
      return reply.notFound("User not found in database.");
    }

    const phaseNumber = Number.parseInt(request.params.phaseNumber, 10);

    if (!Number.isInteger(phaseNumber) || phaseNumber < 1) {
      return reply.badRequest("A valid phase number is required.");
    }

    const course = await fastify.prisma.course.findUnique({
      where: { slug: request.params.courseSlug },
      select: { id: true }
    });

    if (!course) {
      return reply.notFound("Course not found.");
    }

    const enrollment = await fastify.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: dbUser.id,
          courseId: course.id
        }
      },
      select: { status: true }
    });

    if (!enrollment || enrollment.status !== "ACTIVE") {
      return reply.forbidden("You are not enrolled in this course.");
    }

    try {
      const milestone = await requestMilestoneReview(
        fastify.prisma,
        dbUser.id,
        course.id,
        phaseNumber,
        request.body?.notes?.trim() || undefined
      );

      return {
        ok: true,
        requestedReview: true,
        milestone
      };
    } catch (error) {
      if (error instanceof MilestoneProgressError) {
        return reply.status(error.statusCode).send({
          message: error.message,
          statusCode: error.statusCode
        });
      }

      throw error;
    }
  });

  fastify.post<StudySessionStartBody>("/study-sessions/start", async (request, reply) => {
    const authUser = await fastify.requireAuth(request);

    const dbUser = await fastify.prisma.user.findUnique({
      where: { firebaseUid: authUser.uid },
      select: { id: true }
    });

    if (!dbUser) {
      return reply.notFound("User not found in database.");
    }

    try {
      const session = await startStudySession({
        fastify,
        auth: {
          userId: dbUser.id,
          ...(authUser.role ? { userRole: authUser.role } : {})
        },
        courseSlug: request.body.courseSlug,
        source: request.body.source ?? "WEB",
        ...(request.body.lessonId ? { lessonId: request.body.lessonId } : {}),
        ...(request.body.deviceSessionId ? { deviceSessionId: request.body.deviceSessionId } : {})
      });

      return {
        ok: true,
        session,
        note: "Study session started."
      };
    } catch (error) {
      if (error instanceof StudySessionError) {
        return reply.status(error.statusCode).send({
          message: error.message,
          statusCode: error.statusCode
        });
      }

      throw error;
    }
  });

  fastify.post<{ Params: { sessionId: string } } & StudySessionUpdateBody>(
    "/study-sessions/:sessionId/heartbeat",
    async (request, reply) => {
      const authUser = await fastify.requireAuth(request);

      const dbUser = await fastify.prisma.user.findUnique({
        where: { firebaseUid: authUser.uid },
        select: { id: true }
      });

      if (!dbUser) {
        return reply.notFound("User not found in database.");
      }

      try {
        const session = await updateStudySession({
          prisma: fastify.prisma,
          userId: dbUser.id,
          sessionId: request.params.sessionId,
          action: "heartbeat",
          ...(request.body?.deviceSessionId
            ? { deviceSessionId: request.body.deviceSessionId }
            : {})
        });

        return {
          ok: true,
          session,
          note: "Study session heartbeat recorded."
        };
      } catch (error) {
        if (error instanceof StudySessionError) {
          return reply.status(error.statusCode).send({
            message: error.message,
            statusCode: error.statusCode
          });
        }

        throw error;
      }
    }
  );

  fastify.post<{ Params: { sessionId: string } } & StudySessionUpdateBody>(
    "/study-sessions/:sessionId/end",
    async (request, reply) => {
      const authUser = await fastify.requireAuth(request);

      const dbUser = await fastify.prisma.user.findUnique({
        where: { firebaseUid: authUser.uid },
        select: { id: true }
      });

      if (!dbUser) {
        return reply.notFound("User not found in database.");
      }

      try {
        const session = await updateStudySession({
          prisma: fastify.prisma,
          userId: dbUser.id,
          sessionId: request.params.sessionId,
          action: "end",
          ...(request.body?.deviceSessionId
            ? { deviceSessionId: request.body.deviceSessionId }
            : {})
        });

        return {
          ok: true,
          session,
          note: "Study session ended."
        };
      } catch (error) {
        if (error instanceof StudySessionError) {
          return reply.status(error.statusCode).send({
            message: error.message,
            statusCode: error.statusCode
          });
        }

        throw error;
      }
    }
  );

  // ── POST /v1/learning/progress/:lessonId ───────────────────────────────────
  fastify.post<LessonProgressParams & LessonProgressBody>(
    "/progress/:lessonId",
    async (request, reply) => {
      const authUser = await fastify.requireAuth(request);

      const dbUser = await fastify.prisma.user.findUnique({
        where: { firebaseUid: authUser.uid },
        select: { id: true }
      });

      if (!dbUser) {
        return reply.notFound("User not found in database.");
      }

      const lesson = await fastify.prisma.lesson.findUnique({
        where: { id: request.params.lessonId },
        select: {
          id: true,
          courseId: true,
          phaseNumber: true,
          prerequisiteId: true,
          title: true,
          prerequisite: { select: { title: true } }
        }
      });

      if (!lesson) {
        return reply.notFound("Lesson not found.");
      }

      // Enforce Iron Guard before allowing progress writes
      await assertLessonAccess({
        fastify,
        userId: dbUser.id,
        userRole: authUser.role,
        courseId: lesson.courseId,
        lesson
      });

      const status = request.body?.status ?? "IN_PROGRESS";
      const now = new Date();

      await fastify.prisma.userProgress.upsert({
        where: { userId_lessonId: { userId: dbUser.id, lessonId: lesson.id } },
        create: {
          userId: dbUser.id,
          lessonId: lesson.id,
          courseId: lesson.courseId,
          status,
          startedAt: now,
          completedAt: status === "COMPLETED" ? now : null
        },
        update: {
          status,
          ...(status === "COMPLETED" ? { completedAt: now } : {}),
          ...(status === "IN_PROGRESS" ? { startedAt: now } : {})
        }
      });

      // Enqueue background recalculation if lesson was completed
      if (status === "COMPLETED") {
        try {
          const queue = getProgressQueue();
          if (queue) {
            await queue.add(
              "progress-recalc",
              { userId: dbUser.id, courseId: lesson.courseId, triggeredBy: "lesson-completion" },
              defaultJobOptions
            );
          }
        } catch (queueErr) {
          request.log.error({ err: queueErr }, "learning.progress: failed to enqueue recalc job");
        }
      }

      return { ok: true, lessonId: lesson.id, status };
    }
  );

  // ── POST /v1/learning/quiz/attempt ────────────────────────────────────────
  fastify.post<QuizAttemptBody>("/quiz/attempt", async (request, reply) => {
    const authUser = await fastify.requireAuth(request);

    const dbUser = await fastify.prisma.user.findUnique({
      where: { firebaseUid: authUser.uid },
      select: { id: true }
    });

    if (!dbUser) {
      return reply.notFound("User not found in database.");
    }

    const { questionId, selectedOptionIndex, timeTakenMs, sessionId } = request.body;

    const question = await fastify.prisma.quizQuestion.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        lessonId: true,
        lesson: { select: { courseId: true, phaseNumber: true } },
        correctOptionIndex: true,
        explanation: true,
        difficulty: true
      }
    });

    if (!question) {
      return reply.notFound("Quiz question not found.");
    }

    const { lessonId } = question;
    const courseId = question.lesson.courseId;

    // Enforce enrollment before recording attempts (prerequisiteId: null → enrollment-only check)
    await assertLessonAccess({
      fastify,
      userId: dbUser.id,
      userRole: authUser.role,
      courseId,
      lesson: {
        id: lessonId,
        phaseNumber: question.lesson.phaseNumber,
        prerequisiteId: null,
        title: ""
      }
    });

    const isCorrect = selectedOptionIndex === question.correctOptionIndex;
    let resolvedQuizSessionId = sessionId ?? null;
    let isPhaseMockExamQuestion = false;

    if (question.lesson.phaseNumber) {
      const mockExamLessonIds = await listPhaseMockExamLessonIds(
        fastify.prisma,
        courseId,
        question.lesson.phaseNumber
      );

      isPhaseMockExamQuestion = mockExamLessonIds.includes(lessonId);

      if (isPhaseMockExamQuestion) {
        resolvedQuizSessionId = await findOrCreateMockExamSession({
          prisma: fastify.prisma,
          userId: dbUser.id,
          courseId,
          phaseNumber: question.lesson.phaseNumber,
          ...(sessionId !== undefined ? { requestedSessionId: sessionId } : {})
        });
      }
    }

    await fastify.prisma.quizAttempt.create({
      data: {
        userId: dbUser.id,
        questionId,
        lessonId,
        courseId,
        sessionId: resolvedQuizSessionId,
        selectedOptionIndex,
        isCorrect,
        timeTakenMs,
        difficultySnapshot: question.difficulty
      }
    });

    let mockExamProgress:
      | { totalQuestions: number; attemptedQuestions: number; finished: boolean }
      | undefined;

    if (resolvedQuizSessionId && question.lesson.phaseNumber && isPhaseMockExamQuestion) {
      mockExamProgress = await finalizeMockExamSessionIfComplete({
        prisma: fastify.prisma,
        sessionId: resolvedQuizSessionId,
        courseId,
        phaseNumber: question.lesson.phaseNumber
      });
    }

    try {
      await getQuizMasteryQueue().add(
        "quiz-mastery",
        { userId: dbUser.id, courseId, questionId, lessonId },
        defaultJobOptions
      );
    } catch (queueErr) {
      request.log.error({ err: queueErr }, "learning.quiz.attempt: failed to enqueue mastery job");
    }

    let milestone = null;
    if (question.lesson.phaseNumber) {
      try {
        milestone = await evaluateAndRecordAutoMilestone(
          fastify.prisma,
          dbUser.id,
          courseId,
          question.lesson.phaseNumber
        );
      } catch (milestoneErr) {
        request.log.warn(
          { err: milestoneErr, userId: dbUser.id, courseId, lessonId },
          "learning.quiz.attempt: failed to evaluate milestone progress"
        );
      }
    }

    return {
      ok: true,
      isCorrect,
      explanation: isCorrect ? null : (question.explanation ?? null),
      milestone,
      ...(resolvedQuizSessionId ? { quizSessionId: resolvedQuizSessionId } : {}),
      ...(mockExamProgress ? { mockExamProgress } : {})
    };
  });

  // ── GET /v1/learning/live-sessions ─────────────────────────────────────────
  fastify.get("/live-sessions", async () => {
    const sessions = await fastify.prisma.liveSession.findMany({
      where: { startsAt: { gt: new Date() } },
      include: { course: { select: { slug: true } } },
      orderBy: { startsAt: "asc" },
      take: 10
    });

    return {
      items: sessions.map((s) => ({
        id: s.id,
        courseSlug: s.course.slug,
        title: s.title,
        startsAt: s.startsAt.toISOString(),
        endsAt: s.endsAt.toISOString(),
        deliveryMode: s.deliveryMode as "zoom" | "in-app" | "hybrid",
        replayAvailable: Boolean(s.replayVideoAssetId)
      })),
      transport: "HTTP poll; add WebSockets only if chat/presence is required."
    };
  });
};

export default learningRoutes;
