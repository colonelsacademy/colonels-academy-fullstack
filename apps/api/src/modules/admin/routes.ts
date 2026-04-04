import type { FastifyPluginAsync } from "fastify";

const adminRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all users
  fastify.get("/users", async (request, reply) => {
    const { user } = await fastify.authenticateRequest(request);
    if (!user || user.role !== "ADMIN") {
      return reply.forbidden("Admin access required.");
    }

    const users = await fastify.prisma.user.findMany({
      select: {
        id: true,
        firebaseUid: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
        _count: { select: { enrollments: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    return { users };
  });

  // Get stats overview
  fastify.get("/stats", async (request, reply) => {
    const { user } = await fastify.authenticateRequest(request);
    if (!user || user.role !== "ADMIN") {
      return reply.forbidden("Admin access required.");
    }

    const [userCount, courseCount, enrollmentCount] = await Promise.all([
      fastify.prisma.user.count(),
      fastify.prisma.course.count(),
      fastify.prisma.enrollment.count({ where: { status: "ACTIVE" } })
    ]);

    return { userCount, courseCount, enrollmentCount };
  });

  // Update course
  fastify.patch<{ Params: { slug: string }; Body: Record<string, unknown> }>(
    "/courses/:slug",
    async (request, reply) => {
      const { user } = await fastify.authenticateRequest(request);
      if (!user || user.role !== "ADMIN") {
        return reply.forbidden("Admin access required.");
      }

      const course = await fastify.prisma.course.update({
        where: { slug: request.params.slug },
        data: request.body
      });

      return course;
    }
  );
};

export default adminRoutes;
