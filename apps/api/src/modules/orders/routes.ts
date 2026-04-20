import type { FastifyPluginAsync } from "fastify";

import { getCachedUserId } from "../../lib/user-cache";

type CreateOrderBody = {
  Body: {
    items: Array<{ courseSlug: string }>;
    provider: "esewa" | "khalti" | "mock";
  };
};

type ConfirmOrderParams = { Params: { orderId: string } };

const ordersRoutes: FastifyPluginAsync = async (fastify) => {
  // ── POST /v1/orders ────────────────────────────────────────────────────────
  // Creates a PurchaseOrder and returns it. Frontend then initiates payment.
  fastify.post<CreateOrderBody>("/", async (request, reply) => {
    const authUser = await fastify.requireAuth(request);

    // ✅ OPTIMIZED: Use cached user lookup
    const userId = await getCachedUserId(fastify, authUser);

    const { items, provider } = request.body;
    if (!items?.length) return reply.badRequest("No items in order.");

    // Resolve courses
    const courses = await fastify.prisma.course.findMany({
      where: { slug: { in: items.map((i) => i.courseSlug) } },
      select: { id: true, slug: true, priceNpr: true, title: true }
    });

    if (courses.length !== items.length) {
      return reply.badRequest("One or more courses not found.");
    }

    // Check for existing active enrollments
    const existingEnrollments = await fastify.prisma.enrollment.findMany({
      where: {
        userId,
        courseId: { in: courses.map((c) => c.id) },
        status: "ACTIVE"
      },
      select: { courseId: true }
    });

    const alreadyEnrolledIds = new Set(existingEnrollments.map((e) => e.courseId));
    const newCourses = courses.filter((c) => !alreadyEnrolledIds.has(c.id));

    if (!newCourses.length) {
      return reply.badRequest("You are already enrolled in all selected courses.");
    }

    const totalNpr = newCourses.reduce((sum, c) => sum + c.priceNpr, 0);

    const order = await fastify.prisma.purchaseOrder.create({
      data: {
        userId, // ✅ Fixed: Use userId directly
        status: "PENDING_PAYMENT",
        totalNpr,
        provider,
        items: {
          create: newCourses.map((c) => ({
            courseId: c.id,
            priceNpr: c.priceNpr,
            quantity: 1
          }))
        }
      },
      include: { items: { include: { course: { select: { slug: true, title: true } } } } }
    });

    return {
      orderId: order.id,
      totalNpr: order.totalNpr,
      status: order.status,
      items: order.items.map((i) => ({
        courseSlug: i.course.slug,
        courseTitle: i.course.title,
        priceNpr: i.priceNpr
      }))
    };
  });

  // ── POST /v1/orders/:orderId/confirm ───────────────────────────────────────
  // Called after payment gateway confirms payment (or mock confirm in dev).
  // Marks order PAID and creates Enrollment records.
  fastify.post<ConfirmOrderParams>("/:orderId/confirm", async (request, reply) => {
    const authUser = await fastify.requireAuth(request);

    const dbUser = await fastify.prisma.user.findUnique({
      where: { firebaseUid: authUser.uid },
      select: { id: true }
    });

    if (!dbUser) return reply.notFound("User not found in database.");

    const order = await fastify.prisma.purchaseOrder.findUnique({
      where: { id: request.params.orderId },
      include: { items: { select: { courseId: true } } }
    });

    if (!order) return reply.notFound("Order not found.");
    if (order.userId !== dbUser.id) return reply.forbidden("Not your order.");
    if (order.status === "PAID") {
      return { ok: true, alreadyPaid: true, orderId: order.id };
    }
    if (order.status !== "PENDING_PAYMENT") {
      return reply.badRequest(`Order is in status ${order.status}, cannot confirm.`);
    }

    // Mark order paid and create enrollments in a transaction
    await fastify.prisma.$transaction(async (tx) => {
      await tx.purchaseOrder.update({
        where: { id: order.id },
        data: { status: "PAID" }
      });

      for (const item of order.items) {
        await tx.enrollment.upsert({
          where: { userId_courseId: { userId: dbUser.id, courseId: item.courseId } },
          create: {
            userId: dbUser.id,
            courseId: item.courseId,
            status: "ACTIVE",
            progressPercent: 0
          },
          update: { status: "ACTIVE" }
        });
      }
    });

    // Return the first course slug for redirect
    const firstItem = await fastify.prisma.purchaseOrderItem.findFirst({
      where: { orderId: order.id },
      include: { course: { select: { slug: true } } }
    });

    return {
      ok: true,
      orderId: order.id,
      courseSlug: firstItem?.course.slug ?? null
    };
  });

  // ── GET /v1/orders/:orderId ────────────────────────────────────────────────
  fastify.get<ConfirmOrderParams>("/:orderId", async (request, reply) => {
    const authUser = await fastify.requireAuth(request);

    const dbUser = await fastify.prisma.user.findUnique({
      where: { firebaseUid: authUser.uid },
      select: { id: true }
    });

    if (!dbUser) return reply.notFound("User not found.");

    const order = await fastify.prisma.purchaseOrder.findUnique({
      where: { id: request.params.orderId },
      include: { items: { include: { course: { select: { slug: true, title: true } } } } }
    });

    if (!order) return reply.notFound("Order not found.");
    if (order.userId !== dbUser.id) return reply.forbidden("Not your order.");

    return {
      orderId: order.id,
      status: order.status,
      totalNpr: order.totalNpr,
      items: order.items.map((i) => ({
        courseSlug: i.course.slug,
        courseTitle: i.course.title,
        priceNpr: i.priceNpr
      }))
    };
  });
};

export default ordersRoutes;
