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
import { getCachedUserId } from "../../lib/user-cache";

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
  fastify.get("/enrollments", async (request, _reply) => {
    const authUser = await fastify.requireAuth(request);

    // ✅ OPTIMIZED: Use cached user lookup instead of database query
    const userId = await getCachedUserId(fastify, authUser);

    const enrollments = await fastify.prisma.enrollment.findMany({
      where: { userId, status: "ACTIVE" },
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
        userId,
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
    const now = new Date();
    const sessions = await fastify.prisma.liveSession.findMany({
      where: {
        endsAt: { gte: now } // Show sessions that haven't ended yet (includes live sessions)
      },
      include: { course: { select: { slug: true } } },
      orderBy: { startsAt: "asc" },
      take: 20
    });

    return {
      items: sessions.map((s) => ({
        id: s.id,
        courseSlug: s.course.slug,
        title: s.title,
        startsAt: s.startsAt.toISOString(),
        endsAt: s.endsAt.toISOString(),
        deliveryMode: s.deliveryMode as "zoom" | "in-app" | "hybrid",
        meetingUrl: s.meetingUrl ?? null,
        replayAvailable: Boolean(s.replayVideoAssetId)
      })),
      transport: "HTTP poll; add WebSockets only if chat/presence is required."
    };
  });

  // ── GET /v1/learning/chapters/purchase-status ──────────────────────────────
  fastify.get<{ Querystring: { courseSlug: string } }>(
    "/chapters/purchase-status",
    async (request, reply) => {
      const authUser = await fastify.requireAuth(request);
      const userId = await getCachedUserId(fastify, authUser);

      const { courseSlug } = request.query;

      if (!courseSlug) {
        return reply.badRequest("courseSlug is required");
      }

      // Get course
      const course = await fastify.prisma.course.findUnique({
        where: { slug: courseSlug },
        select: { id: true }
      });

      if (!course) {
        return reply.notFound("Course not found");
      }

      // Get user's chapter purchases
      const chapterPurchases = await fastify.prisma.chapterPurchase.findMany({
        where: {
          userId,
          courseId: course.id,
          paymentStatus: "COMPLETED"
        },
        include: {
          module: {
            select: {
              id: true,
              chapterNumber: true,
              title: true
            }
          }
        }
      });

      // Get user's bundle purchases
      const bundlePurchases = await fastify.prisma.bundlePurchase.findMany({
        where: {
          userId,
          courseId: course.id,
          paymentStatus: "COMPLETED"
        },
        include: {
          bundleOffer: {
            select: {
              bundleType: true,
              includedChapters: true
            }
          }
        }
      });

      // Get chapter progress
      const chapterProgress = await fastify.prisma.chapterProgress.findMany({
        where: {
          userId,
          courseId: course.id
        }
      });

      // Determine which chapters are unlocked
      const purchasedChapters = new Set<number>();

      // Add individually purchased chapters
      for (const purchase of chapterPurchases) {
        if (purchase.module.chapterNumber) {
          purchasedChapters.add(purchase.module.chapterNumber);
        }
      }

      // Add bundle-purchased chapters
      for (const purchase of bundlePurchases) {
        const chapters = purchase.bundleOffer.includedChapters as number[];
        for (const ch of chapters) {
          purchasedChapters.add(ch);
        }
      }

      // Build response
      return {
        hasBundlePurchase: bundlePurchases.length > 0,
        bundleType: bundlePurchases[0]?.bundleOffer.bundleType || null,
        purchasedChapters: Array.from(purchasedChapters).sort(),
        chapterProgress: chapterProgress.map((progress) => ({
          chapterNumber: progress.chapterNumber,
          completionPercentage: progress.completionPercentage,
          isCompleted: progress.isChapterCompleted,
          lessonsCompleted: progress.lessonsCompleted,
          totalLessons: progress.totalLessons
        }))
      };
    }
  );

  // ── GET /v1/learning/chapters/status ───────────────────────────────────────
  fastify.get<{ Querystring: { courseSlug: string } }>(
    "/chapters/status",
    async (request, reply) => {
      const authUser = await fastify.requireAuth(request);
      const userId = await getCachedUserId(fastify, authUser);

      const { courseSlug } = request.query;

      if (!courseSlug) {
        return reply.badRequest("courseSlug is required");
      }

      // Get course
      const course = await fastify.prisma.course.findUnique({
        where: { slug: courseSlug },
        select: { id: true, title: true }
      });

      if (!course) {
        return reply.notFound("Course not found");
      }

      // Get all modules (chapters)
      const modules = await fastify.prisma.module.findMany({
        where: { courseId: course.id },
        orderBy: { chapterNumber: "asc" },
        select: {
          id: true,
          chapterNumber: true,
          title: true,
          isLocked: true,
          isFreeIntro: true,
          chapterPrice: true
        }
      });

      // Get user's purchases
      const chapterPurchases = await fastify.prisma.chapterPurchase.findMany({
        where: {
          userId,
          courseId: course.id,
          paymentStatus: "COMPLETED"
        },
        select: {
          moduleId: true
        }
      });

      const bundlePurchases = await fastify.prisma.bundlePurchase.findMany({
        where: {
          userId,
          courseId: course.id,
          paymentStatus: "COMPLETED"
        },
        select: {
          bundleOffer: {
            select: {
              includedChapters: true
            }
          }
        }
      });

      // Get chapter progress
      const chapterProgress = await fastify.prisma.chapterProgress.findMany({
        where: {
          userId,
          courseId: course.id
        }
      });

      // Build purchased chapters set
      const purchasedModuleIds = new Set(chapterPurchases.map((p) => p.moduleId));
      const purchasedChapters = new Set<number>();

      for (const bp of bundlePurchases) {
        const chapters = bp.bundleOffer.includedChapters as number[];
        for (const ch of chapters) {
          purchasedChapters.add(ch);
        }
      }

      // Build progress map
      const progressMap = new Map(chapterProgress.map((cp) => [cp.chapterNumber, cp]));

      // Determine unlock status for each chapter
      const chapterStatuses = modules
        .map((module, index) => {
          const chapterNum = module.chapterNumber;
          if (!chapterNum) {
            return null;
          }
          const progress = progressMap.get(chapterNum);
          const isPurchased =
            purchasedModuleIds.has(module.id) || purchasedChapters.has(chapterNum);
          const isFreeIntro = module.isFreeIntro;

          let unlockStatus = "LOCKED";
          let unlockReason = "";
          let canUnlock = false;

          if (isFreeIntro) {
            unlockStatus = "UNLOCKED";
            unlockReason = "Free introduction module";
          } else if (!isPurchased) {
            unlockStatus = "LOCKED";
            unlockReason = "Not purchased";
            canUnlock = true;
          } else if (index === 0 || isFreeIntro) {
            // First chapter or free intro
            unlockStatus = "UNLOCKED";
            unlockReason = "Purchased";
          } else {
            // Check if previous chapter is completed
            const previousChapter = modules[index - 1];
            if (previousChapter?.chapterNumber) {
              const previousProgress = progressMap.get(previousChapter.chapterNumber);

              if (previousProgress?.isChapterCompleted) {
                unlockStatus = "UNLOCKED";
                unlockReason = "Previous chapter completed";
              } else {
                unlockStatus = "LOCKED";
                unlockReason = "Previous chapter not completed";
                canUnlock = false;
              }
            }
          }

          return {
            chapterNumber: chapterNum,
            title: module.title,
            price: module.chapterPrice,
            isPurchased,
            isFreeIntro,
            unlockStatus,
            unlockReason,
            canUnlock,
            progress: progress
              ? {
                  completionPercentage: progress.completionPercentage,
                  isCompleted: progress.isChapterCompleted,
                  lessonsCompleted: progress.lessonsCompleted,
                  totalLessons: progress.totalLessons,
                  videosWatched: progress.videosWatched,
                  totalVideos: progress.totalVideos,
                  quizzesCompleted: progress.quizzesCompleted,
                  totalQuizzes: progress.totalQuizzes
                }
              : null
          };
        })
        .filter(Boolean);

      return {
        course: {
          slug: courseSlug,
          title: course.title
        },
        chapters: chapterStatuses
      };
    }
  );

  // ── POST /v1/learning/chapters/:chapterNumber/check-unlock ─────────────────
  fastify.post<{ Params: { chapterNumber: string }; Querystring: { courseSlug: string } }>(
    "/chapters/:chapterNumber/check-unlock",
    async (request, reply) => {
      const authUser = await fastify.requireAuth(request);
      const userId = await getCachedUserId(fastify, authUser);

      const { courseSlug } = request.query;
      const { chapterNumber } = request.params;

      if (!courseSlug) {
        return reply.badRequest("courseSlug is required");
      }

      const chapterNum = Number.parseInt(chapterNumber);
      if (Number.isNaN(chapterNum)) {
        return reply.badRequest("Invalid chapter number");
      }

      // Get course
      const course = await fastify.prisma.course.findUnique({
        where: { slug: courseSlug },
        select: { id: true }
      });

      if (!course) {
        return reply.notFound("Course not found");
      }

      // Get current chapter progress
      const currentModule = await fastify.prisma.module.findFirst({
        where: {
          courseId: course.id,
          chapterNumber: chapterNum
        },
        select: { id: true }
      });

      if (!currentModule) {
        return reply.notFound("Chapter not found");
      }

      const currentProgress = await fastify.prisma.chapterProgress.findUnique({
        where: {
          userId_moduleId: {
            userId,
            moduleId: currentModule.id
          }
        }
      });

      if (!currentProgress) {
        return reply.notFound("Chapter progress not found");
      }

      // Check completion criteria
      const completionCriteria = {
        allVideosWatched: currentProgress.videosWatched >= currentProgress.totalVideos,
        allQuizzesPassed:
          currentProgress.quizzesCompleted >= currentProgress.totalQuizzes &&
          currentProgress.allQuizzesPassed,
        allLessonsCompleted: currentProgress.lessonsCompleted >= currentProgress.totalLessons,
        completionPercentage: currentProgress.completionPercentage >= 70
      };

      const isChapterComplete =
        completionCriteria.allVideosWatched &&
        completionCriteria.allQuizzesPassed &&
        completionCriteria.allLessonsCompleted;

      // Update chapter completion status if criteria met
      if (isChapterComplete && !currentProgress.isChapterCompleted) {
        await fastify.prisma.chapterProgress.update({
          where: { id: currentProgress.id },
          data: {
            isChapterCompleted: true,
            completionDate: new Date(),
            nextChapterUnlocked: true,
            unlockedDate: new Date()
          }
        });
      }

      // Check if next chapter should be unlocked
      let nextChapterUnlocked = false;
      const nextChapterNumber = chapterNum + 1;

      if (isChapterComplete) {
        // Get next chapter
        const nextModule = await fastify.prisma.module.findFirst({
          where: {
            courseId: course.id,
            chapterNumber: nextChapterNumber
          },
          select: { id: true, isLocked: true }
        });

        if (nextModule?.isLocked) {
          // Unlock next chapter
          await fastify.prisma.module.update({
            where: { id: nextModule.id },
            data: { isLocked: false }
          });

          // Initialize progress for next chapter
          const nextModuleWithLessons = await fastify.prisma.module.findUnique({
            where: { id: nextModule.id },
            select: {
              id: true,
              chapterNumber: true,
              courseId: true
            }
          });

          if (nextModuleWithLessons) {
            const totalLessons = await fastify.prisma.lesson.count({
              where: { moduleId: nextModule.id, isRequired: true }
            });

            const totalVideos = await fastify.prisma.lesson.count({
              where: { moduleId: nextModule.id, contentType: "VIDEO" }
            });

            const totalQuizzes = await fastify.prisma.lesson.count({
              where: { moduleId: nextModule.id, contentType: "QUIZ" }
            });

            const totalAssignments = await fastify.prisma.lesson.count({
              where: { moduleId: nextModule.id, learningMode: "PRACTICE" }
            });

            await fastify.prisma.chapterProgress.upsert({
              where: {
                userId_moduleId: {
                  userId,
                  moduleId: nextModule.id
                }
              },
              update: {},
              create: {
                userId,
                courseId: course.id,
                moduleId: nextModule.id,
                chapterNumber: nextChapterNumber,
                totalLessons,
                totalVideos,
                totalQuizzes,
                totalAssignments
              }
            });
          }

          nextChapterUnlocked = true;
        }
      }

      return {
        chapter: {
          number: chapterNum,
          isCompleted: isChapterComplete
        },
        completionCriteria,
        nextChapter: {
          number: nextChapterNumber,
          unlocked: nextChapterUnlocked
        },
        message: isChapterComplete
          ? nextChapterUnlocked
            ? `Chapter ${chapterNum} completed! Chapter ${nextChapterNumber} is now unlocked.`
            : `Chapter ${chapterNum} completed!`
          : `Chapter ${chapterNum} not yet complete. Keep working!`
      };
    }
  );

  // ── GET /v1/learning/chapters/:chapterNumber/unlock-requirements ───────────
  fastify.get<{ Params: { chapterNumber: string }; Querystring: { courseSlug: string } }>(
    "/chapters/:chapterNumber/unlock-requirements",
    async (request, reply) => {
      const authUser = await fastify.requireAuth(request);
      const userId = await getCachedUserId(fastify, authUser);

      const { courseSlug } = request.query;
      const { chapterNumber } = request.params;

      if (!courseSlug) {
        return reply.badRequest("courseSlug is required");
      }

      const chapterNum = Number.parseInt(chapterNumber);
      if (Number.isNaN(chapterNum)) {
        return reply.badRequest("Invalid chapter number");
      }

      // Get course
      const course = await fastify.prisma.course.findUnique({
        where: { slug: courseSlug },
        select: { id: true }
      });

      if (!course) {
        return reply.notFound("Course not found");
      }

      // Get the chapter module
      const module = await fastify.prisma.module.findFirst({
        where: {
          courseId: course.id,
          chapterNumber: chapterNum
        },
        select: {
          id: true,
          title: true,
          chapterNumber: true,
          isFreeIntro: true,
          chapterPrice: true,
          isLocked: true
        }
      });

      if (!module) {
        return reply.notFound("Chapter not found");
      }

      // If free intro, no requirements
      if (module.isFreeIntro) {
        return {
          chapter: {
            number: module.chapterNumber,
            title: module.title
          },
          requirements: {
            type: "FREE_INTRO",
            message: "This is a free introduction module - no requirements to unlock"
          }
        };
      }

      // Check if purchased
      const purchase = await fastify.prisma.chapterPurchase.findUnique({
        where: {
          userId_moduleId: {
            userId,
            moduleId: module.id
          }
        },
        select: {
          paymentStatus: true
        }
      });

      const bundlePurchase = await fastify.prisma.bundlePurchase.findFirst({
        where: {
          userId,
          courseId: course.id,
          paymentStatus: "COMPLETED"
        },
        select: {
          bundleOffer: {
            select: {
              includedChapters: true
            }
          }
        }
      });

      const isPurchased =
        purchase?.paymentStatus === "COMPLETED" ||
        (bundlePurchase &&
          (bundlePurchase.bundleOffer.includedChapters as number[]).includes(chapterNum));

      if (!isPurchased) {
        return {
          chapter: {
            number: module.chapterNumber,
            title: module.title,
            price: module.chapterPrice
          },
          requirements: {
            type: "PURCHASE_REQUIRED",
            message: "This chapter must be purchased before access",
            action: "PURCHASE"
          }
        };
      }

      // If first chapter, no prerequisites
      if (chapterNum === 1) {
        return {
          chapter: {
            number: module.chapterNumber,
            title: module.title
          },
          requirements: {
            type: "NO_PREREQUISITES",
            message: "This is the first chapter - no prerequisites required",
            canUnlock: true
          }
        };
      }

      // Get previous chapter progress
      const previousModule = await fastify.prisma.module.findFirst({
        where: {
          courseId: course.id,
          chapterNumber: chapterNum - 1
        },
        select: { id: true }
      });

      if (!previousModule) {
        return reply.notFound("Previous chapter not found");
      }

      const previousProgress = await fastify.prisma.chapterProgress.findUnique({
        where: {
          userId_moduleId: {
            userId,
            moduleId: previousModule.id
          }
        }
      });

      if (!previousProgress) {
        return {
          chapter: {
            number: module.chapterNumber,
            title: module.title
          },
          requirements: {
            type: "PREREQUISITE_NOT_STARTED",
            message: "Complete the previous chapter to unlock this one",
            prerequisite: {
              chapterNumber: chapterNum - 1,
              status: "NOT_STARTED"
            },
            action: "COMPLETE_PREVIOUS"
          }
        };
      }

      if (previousProgress.isChapterCompleted) {
        return {
          chapter: {
            number: module.chapterNumber,
            title: module.title
          },
          requirements: {
            type: "PREREQUISITES_MET",
            message: "All requirements met - chapter is unlocked",
            canUnlock: true,
            prerequisite: {
              chapterNumber: chapterNum - 1,
              status: "COMPLETED",
              completionPercentage: previousProgress.completionPercentage
            }
          }
        };
      }

      // Previous chapter in progress
      return {
        chapter: {
          number: module.chapterNumber,
          title: module.title
        },
        requirements: {
          type: "PREREQUISITE_IN_PROGRESS",
          message: "Complete the previous chapter to unlock this one",
          prerequisite: {
            chapterNumber: chapterNum - 1,
            status: "IN_PROGRESS",
            completionPercentage: previousProgress.completionPercentage,
            lessonsCompleted: previousProgress.lessonsCompleted,
            totalLessons: previousProgress.totalLessons
          },
          action: "COMPLETE_PREVIOUS"
        }
      };
    }
  );
};

export default learningRoutes;
