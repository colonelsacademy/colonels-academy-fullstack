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

  // ── POST /v1/orders/chapters ───────────────────────────────────────────────
  fastify.post<{ Body: { moduleId: string; paymentMethod: string } }>(
    "/chapters",
    async (request, reply) => {
      const authUser = await fastify.requireAuth(request);
      const userId = await getCachedUserId(fastify, authUser);

      const { moduleId, paymentMethod } = request.body;

      if (!moduleId || !paymentMethod) {
        return reply.badRequest("moduleId and paymentMethod are required");
      }

      // Get module details
      const module = await fastify.prisma.module.findUnique({
        where: { id: moduleId },
        include: {
          course: {
            select: {
              id: true,
              slug: true,
              title: true
            }
          }
        }
      });

      if (!module) {
        return reply.notFound("Module not found");
      }

      if (module.isFreeIntro) {
        return reply.badRequest("This module is free and does not require purchase");
      }

      if (!module.chapterPrice || !module.chapterNumber) {
        return reply.badRequest("This module is not available for purchase");
      }

      // Check if already purchased
      const existingPurchase = await fastify.prisma.chapterPurchase.findUnique({
        where: {
          userId_moduleId: {
            userId,
            moduleId: module.id
          }
        }
      });

      if (existingPurchase && existingPurchase.paymentStatus === "COMPLETED") {
        return reply.badRequest("Chapter already purchased");
      }

      // Create or update chapter purchase
      const chapterPurchase = await fastify.prisma.chapterPurchase.upsert({
        where: {
          userId_moduleId: {
            userId,
            moduleId: module.id
          }
        },
        update: {
          paymentMethod,
          paymentStatus: "PENDING",
          amount: module.chapterPrice
        },
        create: {
          userId,
          courseId: module.courseId,
          moduleId: module.id,
          chapterNumber: module.chapterNumber,
          amount: module.chapterPrice,
          paymentMethod,
          paymentStatus: "PENDING"
        }
      });

      // Initialize chapter progress
      await fastify.prisma.chapterProgress.upsert({
        where: {
          userId_moduleId: {
            userId,
            moduleId: module.id
          }
        },
        update: {},
        create: {
          userId,
          courseId: module.courseId,
          moduleId: module.id,
          chapterNumber: module.chapterNumber,
          totalLessons: await fastify.prisma.lesson.count({
            where: { moduleId: module.id, isRequired: true }
          }),
          totalVideos: await fastify.prisma.lesson.count({
            where: { moduleId: module.id, contentType: "VIDEO" }
          }),
          totalQuizzes: await fastify.prisma.lesson.count({
            where: { moduleId: module.id, contentType: "QUIZ" }
          }),
          totalAssignments: await fastify.prisma.lesson.count({
            where: { moduleId: module.id, learningMode: "PRACTICE" }
          })
        }
      });

      // Return payment initiation data
      return {
        purchaseId: chapterPurchase.id,
        amount: chapterPurchase.amount,
        currency: "NPR",
        chapter: {
          number: module.chapterNumber,
          title: module.title
        },
        course: {
          slug: module.course.slug,
          title: module.course.title
        },
        paymentMethod: chapterPurchase.paymentMethod,
        paymentUrl: `/payment/${paymentMethod.toLowerCase()}?purchaseId=${chapterPurchase.id}`
      };
    }
  );

  // ── POST /v1/orders/bundles ────────────────────────────────────────────────
  fastify.post<{ Body: { bundleOfferId: string; paymentMethod: string } }>(
    "/bundles",
    async (request, reply) => {
      const authUser = await fastify.requireAuth(request);
      const userId = await getCachedUserId(fastify, authUser);

      const { bundleOfferId, paymentMethod } = request.body;

      if (!bundleOfferId || !paymentMethod) {
        return reply.badRequest("bundleOfferId and paymentMethod are required");
      }

      // Get bundle offer details
      const bundleOffer = await fastify.prisma.courseBundleOffer.findUnique({
        where: { id: bundleOfferId },
        include: {
          course: {
            select: {
              id: true,
              slug: true,
              title: true
            }
          }
        }
      });

      if (!bundleOffer) {
        return reply.notFound("Bundle offer not found");
      }

      if (!bundleOffer.isActive) {
        return reply.badRequest("This bundle offer is no longer active");
      }

      // Check if already purchased
      const existingPurchase = await fastify.prisma.bundlePurchase.findUnique({
        where: {
          userId_bundleOfferId: {
            userId,
            bundleOfferId: bundleOffer.id
          }
        }
      });

      if (existingPurchase && existingPurchase.paymentStatus === "COMPLETED") {
        return reply.badRequest("Bundle already purchased");
      }

      // Create or update bundle purchase
      const bundlePurchase = await fastify.prisma.bundlePurchase.upsert({
        where: {
          userId_bundleOfferId: {
            userId,
            bundleOfferId: bundleOffer.id
          }
        },
        update: {
          paymentMethod,
          paymentStatus: "PENDING",
          amount: bundleOffer.bundlePrice
        },
        create: {
          userId,
          bundleOfferId: bundleOffer.id,
          courseId: bundleOffer.courseId,
          amount: bundleOffer.bundlePrice,
          paymentMethod,
          paymentStatus: "PENDING",
          chaptersUnlocked: bundleOffer.includedChapters
        }
      });

      // Return payment initiation data
      return {
        purchaseId: bundlePurchase.id,
        amount: bundlePurchase.amount,
        currency: "NPR",
        bundle: {
          type: bundleOffer.bundleType,
          title: bundleOffer.title,
          chaptersIncluded: bundleOffer.includedChapters as number[]
        },
        course: {
          slug: bundleOffer.course.slug,
          title: bundleOffer.course.title
        },
        paymentMethod: bundlePurchase.paymentMethod,
        paymentUrl: `/payment/${paymentMethod.toLowerCase()}?purchaseId=${bundlePurchase.id}&type=bundle`
      };
    }
  );

  // ── POST /v1/orders/confirm-payment ────────────────────────────────────────
  fastify.post<{
    Body: {
      purchaseId: string;
      type: string;
      transactionId: string;
      paymentStatus: string;
    };
  }>("/confirm-payment", async (request, reply) => {
    const authUser = await fastify.requireAuth(request);
    const userId = await getCachedUserId(fastify, authUser);

    const { purchaseId, type, transactionId, paymentStatus } = request.body;

    if (!purchaseId || !type || !transactionId || !paymentStatus) {
      return reply.badRequest("Missing required fields");
    }

    if (type === "chapter") {
      // Update chapter purchase
      const chapterPurchase = await fastify.prisma.chapterPurchase.findUnique({
        where: { id: purchaseId },
        include: {
          module: {
            include: {
              lessons: {
                where: { isRequired: true },
                select: { id: true }
              }
            }
          }
        }
      });

      if (!chapterPurchase) {
        return reply.notFound("Purchase not found");
      }

      if (chapterPurchase.userId !== userId) {
        return reply.forbidden("Unauthorized");
      }

      // Update payment status
      await fastify.prisma.chapterPurchase.update({
        where: { id: purchaseId },
        data: {
          paymentStatus,
          transactionId,
          purchaseDate: paymentStatus === "COMPLETED" ? new Date() : undefined
        }
      });

      if (paymentStatus === "COMPLETED") {
        // Unlock chapter by updating module
        await fastify.prisma.module.update({
          where: { id: chapterPurchase.moduleId },
          data: { isLocked: false }
        });

        // Create enrollment if doesn't exist
        await fastify.prisma.enrollment.upsert({
          where: {
            userId_courseId: {
              userId,
              courseId: chapterPurchase.courseId
            }
          },
          update: {},
          create: {
            userId,
            courseId: chapterPurchase.courseId,
            status: "ACTIVE"
          }
        });
      }

      return {
        success: true,
        message:
          paymentStatus === "COMPLETED" ? "Chapter unlocked successfully!" : "Payment failed",
        redirectUrl:
          paymentStatus === "COMPLETED"
            ? `/classroom/${chapterPurchase.module.courseId}`
            : `/courses/${chapterPurchase.module.courseId}`
      };
    }

    if (type === "bundle") {
      // Update bundle purchase
      const bundlePurchase = await fastify.prisma.bundlePurchase.findUnique({
        where: { id: purchaseId },
        include: {
          bundleOffer: {
            include: {
              course: {
                include: {
                  modules: {
                    where: {
                      chapterNumber: {
                        in: [] // Will be populated below
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!bundlePurchase) {
        return reply.notFound("Purchase not found");
      }

      if (bundlePurchase.userId !== userId) {
        return reply.forbidden("Unauthorized");
      }

      // Update payment status
      await fastify.prisma.bundlePurchase.update({
        where: { id: purchaseId },
        data: {
          paymentStatus,
          transactionId,
          purchaseDate: paymentStatus === "COMPLETED" ? new Date() : undefined,
          unlockDate: paymentStatus === "COMPLETED" ? new Date() : undefined
        }
      });

      if (paymentStatus === "COMPLETED") {
        const includedChapters = bundlePurchase.bundleOffer.includedChapters as number[];

        // Unlock all chapters in the bundle
        await fastify.prisma.module.updateMany({
          where: {
            courseId: bundlePurchase.courseId,
            chapterNumber: {
              in: includedChapters
            }
          },
          data: { isLocked: false }
        });

        // Create chapter purchases for each chapter
        const modules = await fastify.prisma.module.findMany({
          where: {
            courseId: bundlePurchase.courseId,
            chapterNumber: {
              in: includedChapters
            }
          }
        });

        for (const module of modules) {
          await fastify.prisma.chapterPurchase.upsert({
            where: {
              userId_moduleId: {
                userId,
                moduleId: module.id
              }
            },
            update: {
              paymentStatus: "COMPLETED",
              isBundle: true,
              bundleId: bundlePurchase.id
            },
            create: {
              userId,
              courseId: bundlePurchase.courseId,
              moduleId: module.id,
              chapterNumber: module.chapterNumber!,
              amount: 0, // Part of bundle
              paymentMethod: bundlePurchase.paymentMethod,
              paymentStatus: "COMPLETED",
              isBundle: true,
              bundleId: bundlePurchase.id,
              transactionId
            }
          });

          // Initialize chapter progress
          await fastify.prisma.chapterProgress.upsert({
            where: {
              userId_moduleId: {
                userId,
                moduleId: module.id
              }
            },
            update: {},
            create: {
              userId,
              courseId: bundlePurchase.courseId,
              moduleId: module.id,
              chapterNumber: module.chapterNumber!,
              totalLessons: await fastify.prisma.lesson.count({
                where: { moduleId: module.id, isRequired: true }
              }),
              totalVideos: await fastify.prisma.lesson.count({
                where: { moduleId: module.id, contentType: "VIDEO" }
              }),
              totalQuizzes: await fastify.prisma.lesson.count({
                where: { moduleId: module.id, contentType: "QUIZ" }
              }),
              totalAssignments: await fastify.prisma.lesson.count({
                where: { moduleId: module.id, learningMode: "PRACTICE" }
              })
            }
          });
        }

        // Create enrollment
        await fastify.prisma.enrollment.upsert({
          where: {
            userId_courseId: {
              userId,
              courseId: bundlePurchase.courseId
            }
          },
          update: {},
          create: {
            userId,
            courseId: bundlePurchase.courseId,
            status: "ACTIVE"
          }
        });
      }

      return {
        success: true,
        message:
          paymentStatus === "COMPLETED"
            ? "Bundle purchased successfully! All chapters unlocked."
            : "Payment failed",
        redirectUrl:
          paymentStatus === "COMPLETED"
            ? `/classroom/${bundlePurchase.courseId}`
            : `/courses/${bundlePurchase.courseId}`
      };
    }

    return reply.badRequest("Invalid purchase type");
  });
};

export default ordersRoutes;
