import { Queue } from "bullmq";
import type { FastifyPluginAsync } from "fastify";

import { defaultJobOptions, queueNames } from "@colonels-academy/config";
import type { ProgressRecalcJob, QuizAttemptJob } from "@colonels-academy/contracts";

import { assertLessonAccess } from "../../lib/access-guard";

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

const learningRoutes: FastifyPluginAsync = async (fastify) => {
  // Lazy-init queues — only created on first request that needs them
  let progressRecalcQueue: Queue<ProgressRecalcJob> | null = null;
  let quizMasteryQueue: Queue<QuizAttemptJob> | null = null;

  function getRedisConnection() {
    if (fastify.redis) return fastify.redis;
    try {
      const { loadApiEnv } = require("@colonels-academy/config");
      const env = loadApiEnv();
      return { url: env?.REDIS_URL ?? "redis://localhost:6379" };
    } catch {
      return { url: "redis://localhost:6379" };
    }
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
          request.log.warn({ err: queueErr }, "learning.progress: failed to enqueue recalc job");
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
        lesson: { select: { courseId: true } },
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
      lesson: { id: lessonId, prerequisiteId: null, title: "" }
    });

    const isCorrect = selectedOptionIndex === question.correctOptionIndex;

    await fastify.prisma.quizAttempt.create({
      data: {
        userId: dbUser.id,
        questionId,
        lessonId,
        courseId,
        sessionId: sessionId ?? null,
        selectedOptionIndex,
        isCorrect,
        timeTakenMs,
        difficultySnapshot: question.difficulty
      }
    });

    try {
      await getQuizMasteryQueue().add(
        "quiz-mastery",
        { userId: dbUser.id, courseId, questionId, lessonId },
        defaultJobOptions
      );
    } catch (queueErr) {
      request.log.warn({ err: queueErr }, "learning.quiz.attempt: failed to enqueue mastery job");
    }

    return {
      ok: true,
      isCorrect,
      explanation: isCorrect ? null : (question.explanation ?? null)
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
};

export default learningRoutes;
