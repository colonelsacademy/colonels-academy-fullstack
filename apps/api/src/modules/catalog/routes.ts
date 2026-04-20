import type { FastifyPluginAsync } from "fastify";

import { getCoursePhasePlan } from "../../lib/course-phase-plan";
import { getCachedUserId } from "../../lib/user-cache";
import { getCourseBySlug, getCourseLessons, listCourses, listInstructors } from "./service";

const catalogRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/courses", async (request) => {
    // ✅ OPTIMIZED: Pass cache manager to service
    const items = await listCourses(fastify.prisma, fastify.cache, request.log);

    return {
      items
    };
  });

  fastify.get<{ Params: { slug: string } }>("/courses/:slug", async (request, reply) => {
    // ✅ OPTIMIZED: Pass cache manager to service
    const course = await getCourseBySlug(
      fastify.prisma,
      fastify.cache,
      request.log,
      request.params.slug
    );

    if (!course) {
      return reply.notFound("Course not found.");
    }

    return course;
  });

  fastify.get<{ Params: { slug: string } }>("/courses/:slug/lessons", async (request, reply) => {
    const { user: authUser } = await fastify.authenticateRequest(request);

    // ✅ OPTIMIZED: Use cached user lookup
    let dbUserId: string | undefined;
    if (authUser) {
      dbUserId = await getCachedUserId(fastify, authUser);
    }

    const response = await getCourseLessons(
      fastify.prisma,
      request.log,
      request.params.slug,
      dbUserId,
      authUser?.role
    );

    if (!response) {
      return reply.notFound("Course lessons not found.");
    }

    return response;
  });

  fastify.get<{ Params: { slug: string } }>("/courses/:slug/phases", async (request, reply) => {
    const { user: authUser } = await fastify.authenticateRequest(request);

    // ✅ OPTIMIZED: Use cached user lookup
    let dbUserId: string | undefined;
    if (authUser) {
      dbUserId = await getCachedUserId(fastify, authUser);
    }

    const response = await getCoursePhasePlan(
      fastify.prisma,
      request.log,
      request.params.slug,
      dbUserId,
      authUser?.role
    );

    if (!response) {
      return reply.notFound("Course phase plan not found.");
    }

    return response;
  });

  fastify.get("/instructors", async (request) => {
    // ✅ OPTIMIZED: Pass cache manager to service
    const items = await listInstructors(fastify.prisma, fastify.cache, request.log);

    return {
      items
    };
  });

  // ── GET /v1/catalog/courses/:slug/chapters ─────────────────────────────────
  fastify.get<{ Params: { slug: string } }>("/courses/:slug/chapters", async (request, reply) => {
    const { slug } = request.params;

    // Get course with modules and bundle offers
    const course = await fastify.prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          orderBy: { position: "asc" },
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                contentType: true,
                durationMinutes: true,
                isRequired: true
              },
              orderBy: { position: "asc" }
            }
          }
        },
        bundleOffers: {
          where: { isActive: true },
          orderBy: { bundlePrice: "asc" }
        }
      }
    });

    if (!course) {
      return reply.notFound("Course not found");
    }

    // Format response
    return {
      course: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        heroImageUrl: course.heroImageUrl,
        durationLabel: course.durationLabel,
        totalPrice: course.priceNpr
      },
      chapters: course.modules.map((module) => ({
        id: module.id,
        chapterNumber: module.chapterNumber,
        title: module.title,
        position: module.position,
        price: module.chapterPrice,
        isFreeIntro: module.isFreeIntro,
        isLocked: module.isLocked,
        lessonCount: module.lessons.length,
        totalDuration: module.lessons.reduce(
          (sum, lesson) => sum + (lesson.durationMinutes || 0),
          0
        ),
        lessons: module.lessons
      })),
      bundles: course.bundleOffers.map((bundle) => ({
        id: bundle.id,
        type: bundle.bundleType,
        title: bundle.title,
        description: bundle.description,
        originalPrice: bundle.originalPrice,
        bundlePrice: bundle.bundlePrice,
        discount: bundle.discount,
        features: {
          includesMentorAccess: bundle.includesMentorAccess,
          includesMockExams: bundle.includesMockExams,
          includesCertificate: bundle.includesCertificate,
          includesLiveClasses: bundle.includesLiveClasses,
          mockExamCount: bundle.mockExamCount,
          liveClassCount: bundle.liveClassCount
        },
        includedChapters: bundle.includedChapters as number[]
      }))
    };
  });
};

export default catalogRoutes;
