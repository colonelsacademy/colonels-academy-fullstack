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
};

export default catalogRoutes;
