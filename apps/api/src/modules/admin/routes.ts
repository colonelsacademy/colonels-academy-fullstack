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
        select: { id: true, email: true, role: true, firebaseUid: true }
      });

      // ✅ OPTIMIZED: Invalidate user cache when role changes
      await fastify.cache.del(`user:${updated.firebaseUid}`);
      fastify.log.info({ userId: updated.id, newRole }, "User cache invalidated after role change");

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

    // ✅ OPTIMIZED: Invalidate course list cache
    await fastify.cache.del("courses:list");
    fastify.log.info({ slug: course.slug }, "Course list cache invalidated after creation");

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

      // ✅ OPTIMIZED: Invalidate course caches
      await fastify.cache.del(`course:${request.params.slug}`, "courses:list");
      fastify.log.info({ slug: request.params.slug }, "Course cache invalidated");

      return course;
    }
  );

  // ── DELETE /v1/admin/courses/:slug ─────────────────────────────────────────
  fastify.delete<{ Params: { slug: string } }>("/courses/:slug", async (request, reply) => {
    const user = await requireAdmin(request, reply);
    if (!user) return;

    await fastify.prisma.course.delete({ where: { slug: request.params.slug } });

    // ✅ OPTIMIZED: Invalidate course caches
    await fastify.cache.del(`course:${request.params.slug}`, "courses:list");
    fastify.log.info({ slug: request.params.slug }, "Course cache invalidated after deletion");

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

    const body = request.body || {};

    // Debug: Log the raw request body
    fastify.log.info(
      {
        lessonId: request.params.id,
        rawBody: body,
        bunnyVideoId: body.bunnyVideoId,
        bunnyVideoIdType: typeof body.bunnyVideoId,
        bunnyVideoIdUndefined: body.bunnyVideoId === undefined
      },
      "PATCH lesson - raw request body"
    );

    // Build update data object explicitly
    const updateData: Record<string, unknown> = {};

    if (body.title) updateData.title = body.title;
    if (body.synopsis !== undefined) updateData.synopsis = body.synopsis;
    if (body.bunnyVideoId !== undefined) {
      updateData.bunnyVideoId = body.bunnyVideoId || null;
    }
    if (body.durationMinutes !== undefined) updateData.durationMinutes = body.durationMinutes;
    if (body.accessKind) updateData.accessKind = body.accessKind;
    if (body.contentType) updateData.contentType = body.contentType;
    if (body.learningMode) updateData.learningMode = body.learningMode;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.lessonContent !== undefined) {
      updateData.lessonContent = body.lessonContent as Prisma.InputJsonValue;
    }

    // Debug logging
    fastify.log.info(
      {
        lessonId: request.params.id,
        updateData,
        bodyBunnyVideoId: body.bunnyVideoId
      },
      "Updating lesson"
    );

    const lesson = await fastify.prisma.lesson.update({
      where: { id: request.params.id },
      data: updateData
    });

    // Debug: Log what was actually saved
    fastify.log.info(
      {
        lessonId: lesson.id,
        savedBunnyVideoId: lesson.bunnyVideoId,
        requestedBunnyVideoId: body.bunnyVideoId
      },
      "Lesson updated successfully"
    );

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

  // ── GET /v1/admin/bunny-videos ─────────────────────────────────────────────
  fastify.get("/bunny-videos", async (request, reply) => {
    const user = await requireAdmin(request, reply);
    if (!user) return;

    const apiKey = process.env.BUNNY_STREAM_API_KEY;
    const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;

    if (!apiKey || !libraryId) {
      return reply.internalServerError(
        "Bunny Stream API key or library ID not configured. Please set BUNNY_STREAM_API_KEY and BUNNY_STREAM_LIBRARY_ID in environment variables."
      );
    }

    try {
      const response = await fetch(
        `https://video.bunnycdn.com/library/${libraryId}/videos?page=1&itemsPerPage=100&orderBy=date`,
        {
          headers: {
            AccessKey: apiKey,
            accept: "application/json"
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        fastify.log.error({ status: response.status, error: errorText }, "Bunny Stream API error");
        return reply.internalServerError(`Bunny Stream API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      fastify.log.error({ error }, "Failed to fetch Bunny videos");
      return reply.internalServerError("Failed to fetch videos from Bunny Stream");
    }
  });

  // ── GET /v1/admin/purchases ────────────────────────────────────────────────
  fastify.get<{
    Querystring: {
      courseSlug?: string;
      limit?: string;
      offset?: string;
      status?: string;
      type?: string;
    };
  }>("/purchases", async (request, reply) => {
    const user = await requireAdmin(request, reply);
    if (!user) return;

    const { courseSlug, limit: limitStr, offset: offsetStr, status, type } = request.query;
    const limit = Math.min(Number.parseInt(limitStr || "50"), 100);
    const offset = Number.parseInt(offsetStr || "0");

    let courseId: string | undefined;
    if (courseSlug) {
      const course = await fastify.prisma.course.findUnique({
        where: { slug: courseSlug },
        select: { id: true }
      });
      if (!course) {
        return reply.notFound("Course not found");
      }
      courseId = course.id;
    }

    // Build filters
    const chapterFilter: Record<string, unknown> = {};
    const bundleFilter: Record<string, unknown> = {};

    if (courseId) {
      chapterFilter.courseId = courseId;
      bundleFilter.courseId = courseId;
    }

    if (status) {
      chapterFilter.paymentStatus = status;
      bundleFilter.paymentStatus = status;
    }

    // Fetch chapter purchases
    const chapterPurchases = !type || type === "CHAPTER"
      ? await fastify.prisma.chapterPurchase.findMany({
          where: chapterFilter,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                displayName: true
              }
            },
            module: {
              select: {
                chapterNumber: true,
                title: true
              }
            }
          },
          orderBy: { purchaseDate: "desc" },
          take: limit,
          skip: offset
        })
      : [];

    // Fetch bundle purchases
    const bundlePurchases = !type || type === "BUNDLE"
      ? await fastify.prisma.bundlePurchase.findMany({
          where: bundleFilter,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                displayName: true
              }
            },
            bundleOffer: {
              select: {
                bundleType: true,
                title: true,
                includedChapters: true
              }
            }
          },
          orderBy: { purchaseDate: "desc" },
          take: limit,
          skip: offset
        })
      : [];

    // Format response
    const purchases = [
      ...chapterPurchases.map((p) => ({
        id: p.id,
        type: "CHAPTER",
        userId: p.userId,
        user: p.user,
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        paymentStatus: p.paymentStatus,
        transactionId: p.transactionId,
        purchaseDate: p.purchaseDate,
        chapter: {
          number: p.module.chapterNumber,
          title: p.module.title
        }
      })),
      ...bundlePurchases.map((p) => ({
        id: p.id,
        type: "BUNDLE",
        userId: p.userId,
        user: p.user,
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        paymentStatus: p.paymentStatus,
        transactionId: p.transactionId,
        purchaseDate: p.purchaseDate,
        bundle: {
          type: p.bundleOffer.bundleType,
          title: p.bundleOffer.title,
          chaptersIncluded: p.bundleOffer.includedChapters as number[]
        }
      }))
    ].sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

    // Get total counts
    const totalChapters = await fastify.prisma.chapterPurchase.count({
      where: chapterFilter
    });

    const totalBundles = await fastify.prisma.bundlePurchase.count({
      where: bundleFilter
    });

    const total = totalChapters + totalBundles;

    return {
      purchases: purchases.slice(0, limit),
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total
      },
      summary: {
        totalChapterPurchases: totalChapters,
        totalBundlePurchases: totalBundles
      }
    };
  });

  // ── GET /v1/admin/purchases/:id ────────────────────────────────────────────
  fastify.get<{ Params: { id: string } }>("/purchases/:id", async (request, reply) => {
    const user = await requireAdmin(request, reply);
    if (!user) return;

    const { id } = request.params;

    // Try to find as chapter purchase first
    const purchase = await fastify.prisma.chapterPurchase.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            role: true
          }
        },
        module: {
          select: {
            id: true,
            chapterNumber: true,
            title: true,
            chapterPrice: true
          }
        },
        course: {
          select: {
            id: true,
            slug: true,
            title: true
          }
        }
      }
    });

    if (purchase) {
      return {
        id: purchase.id,
        type: "CHAPTER",
        user: purchase.user,
        course: purchase.course,
        amount: purchase.amount,
        paymentMethod: purchase.paymentMethod,
        paymentStatus: purchase.paymentStatus,
        transactionId: purchase.transactionId,
        purchaseDate: purchase.purchaseDate,
        createdAt: purchase.createdAt,
        updatedAt: purchase.updatedAt,
        chapter: {
          id: purchase.module.id,
          number: purchase.module.chapterNumber,
          title: purchase.module.title,
          price: purchase.module.chapterPrice
        },
        isBundle: purchase.isBundle,
        bundleId: purchase.bundleId
      };
    }

    // Try to find as bundle purchase
    const bundlePurchase = await fastify.prisma.bundlePurchase.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            role: true
          }
        },
        bundleOffer: {
          select: {
            id: true,
            bundleType: true,
            title: true,
            description: true,
            includedChapters: true,
            originalPrice: true,
            bundlePrice: true,
            discount: true,
            includesMentorAccess: true,
            includesMockExams: true,
            includesCertificate: true,
            mockExamCount: true
          }
        },
        course: {
          select: {
            id: true,
            slug: true,
            title: true
          }
        }
      }
    });

    if (bundlePurchase) {
      // Get chapter progress for this user
      const chapterProgress = await fastify.prisma.chapterProgress.findMany({
        where: {
          userId: bundlePurchase.userId,
          courseId: bundlePurchase.courseId,
          chapterNumber: {
            in: bundlePurchase.bundleOffer.includedChapters as number[]
          }
        }
      });

      return {
        id: bundlePurchase.id,
        type: "BUNDLE",
        user: bundlePurchase.user,
        course: bundlePurchase.course,
        amount: bundlePurchase.amount,
        paymentMethod: bundlePurchase.paymentMethod,
        paymentStatus: bundlePurchase.paymentStatus,
        transactionId: bundlePurchase.transactionId,
        purchaseDate: bundlePurchase.purchaseDate,
        unlockDate: bundlePurchase.unlockDate,
        createdAt: bundlePurchase.createdAt,
        updatedAt: bundlePurchase.updatedAt,
        bundle: {
          id: bundlePurchase.bundleOffer.id,
          type: bundlePurchase.bundleOffer.bundleType,
          title: bundlePurchase.bundleOffer.title,
          description: bundlePurchase.bundleOffer.description,
          chaptersIncluded: bundlePurchase.bundleOffer.includedChapters as number[],
          pricing: {
            originalPrice: bundlePurchase.bundleOffer.originalPrice,
            bundlePrice: bundlePurchase.bundleOffer.bundlePrice,
            discount: bundlePurchase.bundleOffer.discount
          },
          features: {
            mentorAccess: bundlePurchase.bundleOffer.includesMentorAccess,
            mockExams: bundlePurchase.bundleOffer.includesMockExams,
            mockExamCount: bundlePurchase.bundleOffer.mockExamCount,
            certificate: bundlePurchase.bundleOffer.includesCertificate
          }
        },
        chaptersUnlocked: bundlePurchase.chaptersUnlocked as number[],
        chapterProgress: chapterProgress.map((cp) => ({
          chapterNumber: cp.chapterNumber,
          completionPercentage: cp.completionPercentage,
          isCompleted: cp.isChapterCompleted,
          lessonsCompleted: cp.lessonsCompleted,
          totalLessons: cp.totalLessons
        }))
      };
    }

    return reply.notFound("Purchase not found");
  });
};

export default adminRoutes;
