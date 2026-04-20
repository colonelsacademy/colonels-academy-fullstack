import type { Prisma } from "@prisma/client";
import type { FastifyPluginAsync } from "fastify";

const adminRoutes: FastifyPluginAsync = async (fastify) => {
  // ── Auth guard helper ──────────────────────────────────────────────────────
  async function requireAdmin(
    request: Parameters<typeof fastify.authenticateRequest>[0],
    reply: { forbidden: (msg: string) => unknown }
  ) {
    const { user } = await fastify.authenticateRequest(request);
    if (!user) return reply.forbidden("Admin access required.");

    // Always check DB role - Firebase token claims may not have the role
    const dbUser = await fastify.prisma.user.findUnique({
      where: { firebaseUid: user.uid },
      select: { role: true }
    });

    if (!dbUser || dbUser.role.toLowerCase() !== "admin") {
      return reply.forbidden("Admin access required.");
    }

    return user;
  }

  // ── GET /v1/admin/stats ────────────────────────────────────────────────────
  fastify.get("/stats", async (request, reply) => {
    const user = await requireAdmin(request, reply);
    if (!user) return;

    const [userCount, courseCount, enrollmentCount, orderCount] = await Promise.all([
      fastify.prisma.user.count(),
      fastify.prisma.course.count(),
      fastify.prisma.enrollment.count({ where: { status: "ACTIVE" } }),
      fastify.prisma.purchaseOrder.count({ where: { status: "PAID" } })
    ]);

    return { userCount, courseCount, enrollmentCount, orderCount };
  });

  // ── GET /v1/admin/users ────────────────────────────────────────────────────
  fastify.get("/users", async (request, reply) => {
    const user = await requireAdmin(request, reply);
    if (!user) return;

    const users = await fastify.prisma.user.findMany({
      select: {
        id: true,
        firebaseUid: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
        _count: { select: { enrollments: true, orders: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 200
    });

    return { users };
  });

  // ── PATCH /v1/admin/users/:id/role ─────────────────────────────────────────
  fastify.patch<{ Params: { id: string }; Body: { role: string } }>(
    "/users/:id/role",
    async (request, reply) => {
      const user = await requireAdmin(request, reply);
      if (!user) return;

      const validRoles = ["STUDENT", "INSTRUCTOR", "DS", "ADMIN"];
      const newRole = request.body.role?.toUpperCase();
      if (!validRoles.includes(newRole)) {
        return reply.badRequest(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
      }

      const updated = await fastify.prisma.user.update({
        where: { id: request.params.id },
        data: { role: newRole as "STUDENT" | "INSTRUCTOR" | "DS" | "ADMIN" },
        select: { id: true, email: true, role: true }
      });

      return updated;
    }
  );

  // ── GET /v1/admin/courses ──────────────────────────────────────────────────
  fastify.get("/courses", async (request, reply) => {
    const user = await requireAdmin(request, reply);
    if (!user) return;

    const courses = await fastify.prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { enrollments: true, lessons: true } }
      }
    });

    return { courses };
  });

  // ── POST /v1/admin/courses ─────────────────────────────────────────────────
  fastify.post<{
    Body: {
      slug: string;
      title: string;
      track: string;
      summary: string;
      description: string;
      level: string;
      durationLabel: string;
      lessonCount: number;
      priceNpr: number;
      originalPriceNpr?: number;
      accentColor: string;
      heroImageUrl?: string;
      isFeatured?: boolean;
      isComingSoon?: boolean;
    };
  }>("/courses", async (request, reply) => {
    const user = await requireAdmin(request, reply);
    if (!user) return;

    const existing = await fastify.prisma.course.findUnique({
      where: { slug: request.body.slug }
    });
    if (existing) return reply.conflict("A course with this slug already exists.");

    const course = await fastify.prisma.course.create({
      data: {
        slug: request.body.slug,
        title: request.body.title,
        track: request.body.track,
        summary: request.body.summary,
        description: request.body.description,
        level: request.body.level,
        durationLabel: request.body.durationLabel,
        lessonCount: request.body.lessonCount ?? 0,
        priceNpr: request.body.priceNpr,
        originalPriceNpr: request.body.originalPriceNpr ?? null,
        accentColor: request.body.accentColor ?? "#D4AF37",
        heroImageUrl: request.body.heroImageUrl ?? null,
        isFeatured: request.body.isFeatured ?? false,
        isComingSoon: request.body.isComingSoon ?? false
      }
    });

    return course;
  });

  // ── PATCH /v1/admin/courses/:slug ──────────────────────────────────────────
  fastify.patch<{ Params: { slug: string }; Body: Record<string, unknown> }>(
    "/courses/:slug",
    async (request, reply) => {
      const user = await requireAdmin(request, reply);
      if (!user) return;

      const course = await fastify.prisma.course.update({
        where: { slug: request.params.slug },
        data: request.body
      });

      return course;
    }
  );

  // ── DELETE /v1/admin/courses/:slug ─────────────────────────────────────────
  fastify.delete<{ Params: { slug: string } }>("/courses/:slug", async (request, reply) => {
    const user = await requireAdmin(request, reply);
    if (!user) return;

    await fastify.prisma.course.delete({ where: { slug: request.params.slug } });
    return { ok: true };
  });

  // ── GET /v1/admin/enrollments ──────────────────────────────────────────────
  fastify.get("/enrollments", async (request, reply) => {
    const user = await requireAdmin(request, reply);
    if (!user) return;

    const enrollments = await fastify.prisma.enrollment.findMany({
      include: {
        user: { select: { email: true, displayName: true } },
        course: { select: { title: true, slug: true } }
      },
      orderBy: { purchasedAt: "desc" },
      take: 200
    });

    return { enrollments };
  });

  // ── POST /v1/admin/live-sessions ───────────────────────────────────────────
  fastify.post<{
    Body: {
      courseSlug: string;
      title: string;
      startsAt: string;
      endsAt: string;
      deliveryMode: string;
      meetingUrl?: string;
    };
  }>("/live-sessions", async (request, reply) => {
    const user = await requireAdmin(request, reply);
    if (!user) return;

    const course = await fastify.prisma.course.findUnique({
      where: { slug: request.body.courseSlug },
      select: { id: true }
    });
    if (!course) return reply.notFound("Course not found.");

    const session = await fastify.prisma.liveSession.create({
      data: {
        courseId: course.id,
        title: request.body.title,
        startsAt: new Date(request.body.startsAt),
        endsAt: new Date(request.body.endsAt),
        deliveryMode: request.body.deliveryMode,
        meetingUrl: request.body.meetingUrl ?? null
      }
    });

    return session;
  });

  // ── DELETE /v1/admin/live-sessions/:id ─────────────────────────────────────
  fastify.delete<{ Params: { id: string } }>("/live-sessions/:id", async (request, reply) => {
    const user = await requireAdmin(request, reply);
    if (!user) return;

    await fastify.prisma.liveSession.delete({ where: { id: request.params.id } });
    return { ok: true };
  });

  // ── GET /v1/admin/courses/:slug/lessons ────────────────────────────────────
  fastify.get<{ Params: { slug: string } }>("/courses/:slug/lessons", async (request, reply) => {
    const user = await requireAdmin(request, reply);
    if (!user) return;

    const course = await fastify.prisma.course.findUnique({
      where: { slug: request.params.slug },
      select: { id: true }
    });
    if (!course) return reply.notFound("Course not found.");

    const lessons = await fastify.prisma.lesson.findMany({
      where: { courseId: course.id },
      orderBy: { position: "asc" },
      select: {
        id: true,
        title: true,
        synopsis: true,
        position: true,
        durationMinutes: true,
        contentType: true,
        learningMode: true,
        accessKind: true,
        bunnyVideoId: true,
        lessonContent: true,
        moduleId: true
      }
    });

    return { lessons };
  });

  // ── POST /v1/admin/courses/:slug/lessons ───────────────────────────────────
  fastify.post<{
    Params: { slug: string };
    Body: {
      title: string;
      synopsis?: string;
      bunnyVideoId?: string;
      durationMinutes?: number;
      accessKind?: string;
      contentType?: string;
      learningMode?: string;
      lessonContent?: unknown;
    };
  }>("/courses/:slug/lessons", async (request, reply) => {
    const user = await requireAdmin(request, reply);
    if (!user) return;

    const course = await fastify.prisma.course.findUnique({
      where: { slug: request.params.slug },
      select: { id: true }
    });
    if (!course) return reply.notFound("Course not found.");

    const lastLesson = await fastify.prisma.lesson.findFirst({
      where: { courseId: course.id },
      orderBy: { position: "desc" },
      select: { position: true }
    });

    const position = (lastLesson?.position ?? 0) + 1;

    const lesson = await fastify.prisma.lesson.create({
      data: {
        courseId: course.id,
        title: request.body.title,
        synopsis: request.body.synopsis ?? "",
        position,
        bunnyVideoId: request.body.bunnyVideoId ?? null,
        durationMinutes: request.body.durationMinutes ?? null,
        contentType:
          (request.body.contentType as "VIDEO" | "PDF" | "LIVE" | "QUIZ" | "TEXT") ?? "VIDEO",
        learningMode:
          (request.body.learningMode as
            | "LESSON"
            | "PRACTICE"
            | "QUIZ"
            | "LIVE"
            | "FEEDBACK"
            | "RESOURCE") ?? "LESSON",
        accessKind: (request.body.accessKind as "PREVIEW" | "STANDARD") ?? "STANDARD",
        ...(request.body.lessonContent !== undefined
          ? { lessonContent: request.body.lessonContent as Prisma.InputJsonValue }
          : {})
      }
    });

    // Update lessonCount on course
    await fastify.prisma.course.update({
      where: { id: course.id },
      data: { lessonCount: { increment: 1 } }
    });

    return lesson;
  });

  // ── PATCH /v1/admin/lessons/:id ────────────────────────────────────────────
  fastify.patch<{
    Params: { id: string };
    Body: {
      title?: string;
      synopsis?: string;
      bunnyVideoId?: string;
      durationMinutes?: number;
      accessKind?: string;
      contentType?: string;
      learningMode?: string;
      position?: number;
      lessonContent?: unknown;
    };
  }>("/lessons/:id", async (request, reply) => {
    const user = await requireAdmin(request, reply);
    if (!user) return;

    const lesson = await fastify.prisma.lesson.update({
      where: { id: request.params.id },
      data: {
        ...(request.body.title ? { title: request.body.title } : {}),
        ...(request.body.synopsis !== undefined ? { synopsis: request.body.synopsis } : {}),
        ...(request.body.bunnyVideoId !== undefined
          ? { bunnyVideoId: request.body.bunnyVideoId || null }
          : {}),
        ...(request.body.durationMinutes !== undefined
          ? { durationMinutes: request.body.durationMinutes }
          : {}),
        ...(request.body.accessKind
          ? { accessKind: request.body.accessKind as "PREVIEW" | "STANDARD" }
          : {}),
        ...(request.body.contentType
          ? {
              contentType: request.body.contentType as "VIDEO" | "PDF" | "LIVE" | "QUIZ" | "TEXT"
            }
          : {}),
        ...(request.body.learningMode
          ? {
              learningMode: request.body.learningMode as
                | "LESSON"
                | "PRACTICE"
                | "QUIZ"
                | "LIVE"
                | "FEEDBACK"
                | "RESOURCE"
            }
          : {}),
        ...(request.body.lessonContent !== undefined
          ? { lessonContent: request.body.lessonContent as Prisma.InputJsonValue }
          : {}),
        ...(request.body.position !== undefined ? { position: request.body.position } : {})
      }
    });

    return lesson;
  });

  // ── DELETE /v1/admin/lessons/:id ───────────────────────────────────────────
  fastify.delete<{ Params: { id: string } }>("/lessons/:id", async (request, reply) => {
    const user = await requireAdmin(request, reply);
    if (!user) return;

    const lesson = await fastify.prisma.lesson.findUnique({
      where: { id: request.params.id },
      select: { courseId: true }
    });
    if (!lesson) return reply.notFound("Lesson not found.");

    await fastify.prisma.lesson.delete({ where: { id: request.params.id } });

    // Update lessonCount
    await fastify.prisma.course.update({
      where: { id: lesson.courseId },
      data: { lessonCount: { decrement: 1 } }
    });

    return { ok: true };
  });
};

export default adminRoutes;
