import type { FastifyPluginAsync } from "fastify";

import { getCourseBySlug, getCourseLessons, listCourses, listInstructors } from "./service";

const catalogRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/courses", async (request) => {
    const items = await listCourses(fastify.prisma, request.log);

    return {
      items
    };
  });

  fastify.get<{ Params: { slug: string } }>("/courses/:slug", async (request, reply) => {
    const course = await getCourseBySlug(fastify.prisma, request.log, request.params.slug);

    if (!course) {
      return reply.notFound("Course not found.");
    }

    return course;
  });

  fastify.get<{ Params: { slug: string } }>("/courses/:slug/lessons", async (request, reply) => {
    const { user: authUser } = await fastify.authenticateRequest(request);

    // Fetch DB user ID to check enrollment/progress
    let dbUserId: string | undefined;
    if (authUser) {
      const dbUser = await fastify.prisma.user.findUnique({
        where: { firebaseUid: authUser.uid },
        select: { id: true }
      });
      dbUserId = dbUser?.id;
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

  fastify.get("/instructors", async (request) => {
    const items = await listInstructors(fastify.prisma, request.log);

    return {
      items
    };
  });
};

export default catalogRoutes;
