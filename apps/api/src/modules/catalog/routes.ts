import type { FastifyPluginAsync } from "fastify";

import { getCourseBySlug, listCourses, listInstructors } from "./service";

const catalogRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/courses", async () => {
    const items = await listCourses(fastify.prisma);

    return {
      items
    };
  });

  fastify.get<{ Params: { slug: string } }>("/courses/:slug", async (request, reply) => {
    const course = await getCourseBySlug(fastify.prisma, request.params.slug);

    if (!course) {
      return reply.notFound("Course not found.");
    }

    return course;
  });

  fastify.get("/instructors", async () => {
    const items = await listInstructors(fastify.prisma);

    return {
      items
    };
  });
};

export default catalogRoutes;
