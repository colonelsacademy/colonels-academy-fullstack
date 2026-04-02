import type { FastifyPluginAsync } from "fastify";

import { getCourseBySlug, listCourses, listInstructors } from "./service";

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

  fastify.get("/instructors", async (request) => {
    const items = await listInstructors(fastify.prisma, request.log);

    return {
      items
    };
  });
};

export default catalogRoutes;
