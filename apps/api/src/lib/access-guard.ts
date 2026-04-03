/**
 * Iron Guard — Access Guard
 *
 * Chain of Command (evaluated top-to-bottom, first match wins):
 *   1. ADMIN or DS role → global bypass, no DB queries needed
 *   2. User not enrolled in the course → 403 "Not enrolled"
 *   3. Lesson has no prerequisiteId → allow (first lesson in a chain)
 *   4. Prerequisite NOT completed in UserProgress → 403 with unlockRequirement
 *   5. Otherwise → allow
 */

import type { FastifyInstance } from "fastify";

export interface AccessGuardOptions {
  fastify: FastifyInstance;
  userId: string;
  userRole: string | undefined;
  courseId: string;
  lesson: {
    id: string;
    prerequisiteId?: string | null;
    title: string;
    prerequisite?: { title: string } | null;
  };
}

export interface AccessAllowed {
  allowed: true;
  bypass: boolean; // true when ADMIN/DS skipped all checks
}

/**
 * Throws a Fastify 403 from @fastify/sensible if access is denied.
 * Returns AccessAllowed on success.
 */
export async function assertLessonAccess(opts: AccessGuardOptions): Promise<AccessAllowed> {
  const { fastify, userId, userRole, courseId, lesson } = opts;
  const prisma = fastify.prisma;

  // ── Step 1: DS / ADMIN bypass ─────────────────────────────────────────────
  const normalizedRole = userRole?.toLowerCase();
  if (normalizedRole === "admin" || normalizedRole === "ds") {
    return { allowed: true, bypass: true };
  }

  // ── Step 2: Enrollment check ──────────────────────────────────────────────
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId }
    },
    select: { status: true }
  });

  if (!enrollment || enrollment.status !== "ACTIVE") {
    throw fastify.httpErrors.forbidden("You are not enrolled in this course.");
  }

  // ── Step 3: No prerequisite → open lesson ─────────────────────────────────
  if (!lesson.prerequisiteId) {
    return { allowed: true, bypass: false };
  }

  // ── Step 4: Prerequisite completion check ─────────────────────────────────
  const prereqProgress = await prisma.userProgress.findUnique({
    where: {
      userId_lessonId: { userId, lessonId: lesson.prerequisiteId }
    },
    select: { status: true }
  });

  if (prereqProgress?.status !== "COMPLETED") {
    const prereqTitle = lesson.prerequisite?.title ?? "the previous lesson";
    throw fastify.httpErrors.createError(403, "Lesson is locked.", {
      // @fastify/sensible doesn't type extra fields, so cast is needed
      ...({
        statusCode: 403,
        message: "Lesson is locked.",
        unlockRequirement: `Complete '${prereqTitle}' first`,
        prerequisiteLessonId: lesson.prerequisiteId
      } as Record<string, unknown>)
    });
  }

  return { allowed: true, bypass: false };
}
