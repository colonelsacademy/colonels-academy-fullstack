import { Queue } from "bullmq";
import type { FastifyPluginAsync } from "fastify";

import { defaultJobOptions, queueNames } from "@colonels-academy/config";
import type { ProgressRecalcJob } from "@colonels-academy/contracts";

import { assertLessonAccess } from "../../lib/access-guard";

// ── Params / Body types ───────────────────────────────────────────────────────

type LessonProgressParams = { Params: { lessonId: string } };
type LessonProgressBody = { Body: { status: "IN_PROGRESS" | "COMPLETED" } };

const learningRoutes: FastifyPluginAsync = async (fastify) => {
  // Lazy-init queue — only created on first request that needs it
  let progressRecalcQueue: Queue<ProgressRecalcJob> | null = null;

  function getProgressQueue() {
    if (!progressRecalcQueue) {
      const env = fastify.redis
        ? undefined
        : (() => {
            try {
              const { loadApiEnv } = require("@colonels-academy/config");
              return loadApiEnv();
            } catch {
              return null;
            }
          })();

      // Use the infrastructure Redis connection if available
      const connection = fastify.redis ?? { url: env?.REDIS_URL ?? "redis://localhost:6379" };
      progressRecalcQueue = new Queue<ProgressRecalcJob>(queueNames.progressRecalc, {
        connection,
        defaultJobOptions
      });
    }
    return progressRecalcQueue;
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
          await getProgressQueue().add(
            "progress-recalc",
            { userId: dbUser.id, courseId: lesson.courseId, triggeredBy: "lesson-completion" },
            defaultJobOptions
          );
        } catch (queueErr) {
          request.log.warn({ err: queueErr }, "learning.progress: failed to enqueue recalc job");
        }
      }

      return { ok: true, lessonId: lesson.id, status };
    }
  );

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
