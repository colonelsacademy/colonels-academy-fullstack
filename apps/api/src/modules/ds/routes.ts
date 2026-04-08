import type { FastifyPluginAsync } from "fastify";

import {
  LessonSubmissionError,
  listPendingSubmissionReviews,
  reviewLessonSubmission
} from "../../lib/lesson-submissions";
import {
  MilestoneProgressError,
  approveMilestoneReview,
  listPendingMilestoneReviews
} from "../../lib/milestone-progress";

type MilestoneApprovalBody = {
  Body: {
    notes?: string;
  };
};

type SubmissionReviewBody = {
  Body: {
    status: "REVIEWED" | "REVISION_REQUESTED";
    score?: number;
    maxScore?: number;
    reviewNotes?: string;
    rubricScores?: Array<{
      criterion: string;
      score: number;
      maxScore: number;
    }>;
  };
};

const dsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Params: { courseSlug: string } }>(
    "/milestones/:courseSlug/pending",
    async (request, reply) => {
      await fastify.requireRole(request, ["ds", "admin"]);

      const course = await fastify.prisma.course.findUnique({
        where: { slug: request.params.courseSlug },
        select: { id: true, slug: true, title: true }
      });

      if (!course) {
        return reply.notFound("Course not found.");
      }

      const items = await listPendingMilestoneReviews(fastify.prisma, course.id);

      return {
        course: {
          id: course.id,
          slug: course.slug,
          title: course.title
        },
        items: items.map((item) => ({
          id: item.id,
          createdAt: item.createdAt.toISOString(),
          notes: item.notes,
          officer: {
            id: item.user.id,
            displayName: item.user.displayName,
            email: item.user.email
          },
          milestone: {
            phaseNumber: item.milestone.phaseNumber,
            title: item.milestone.title,
            description: item.milestone.description
          }
        }))
      };
    }
  );

  fastify.post<
    { Params: { courseSlug: string; phaseNumber: string; userId: string } } & MilestoneApprovalBody
  >("/milestones/:courseSlug/:phaseNumber/approve/:userId", async (request, reply) => {
    const authUser = await fastify.requireRole(request, ["ds", "admin"]);

    const approver = await fastify.prisma.user.findUnique({
      where: { firebaseUid: authUser.uid },
      select: { id: true }
    });

    if (!approver) {
      return reply.notFound("Approver not found in database.");
    }

    const phaseNumber = Number.parseInt(request.params.phaseNumber, 10);

    if (!Number.isInteger(phaseNumber) || phaseNumber < 1) {
      return reply.badRequest("A valid phase number is required.");
    }

    const course = await fastify.prisma.course.findUnique({
      where: { slug: request.params.courseSlug },
      select: { id: true }
    });

    if (!course) {
      return reply.notFound("Course not found.");
    }

    const targetUser = await fastify.prisma.user.findUnique({
      where: { id: request.params.userId },
      select: { id: true }
    });

    if (!targetUser) {
      return reply.notFound("Target officer not found.");
    }

    try {
      const milestone = await approveMilestoneReview(
        fastify.prisma,
        targetUser.id,
        course.id,
        phaseNumber,
        approver.id,
        request.body?.notes?.trim() || undefined
      );

      return {
        ok: true,
        approved: true,
        milestone
      };
    } catch (error) {
      if (error instanceof MilestoneProgressError) {
        return reply.status(error.statusCode).send({
          message: error.message,
          statusCode: error.statusCode
        });
      }

      throw error;
    }
  });

  fastify.get<{ Params: { courseSlug: string } }>(
    "/submissions/:courseSlug/pending",
    async (request, reply) => {
      await fastify.requireRole(request, ["ds", "admin"]);

      try {
        const result = await listPendingSubmissionReviews(
          fastify.prisma,
          request.params.courseSlug
        );

        return {
          course: result.course,
          items: result.items.map((item) => ({
            id: item.id,
            submittedAt: item.submittedAt.toISOString(),
            title: item.title,
            submissionType: item.submissionType,
            ...(item.phaseNumber ? { phaseNumber: item.phaseNumber } : {}),
            ...(item.subjectArea ? { subjectArea: item.subjectArea } : {}),
            ...(item.assetUrl ? { assetUrl: item.assetUrl } : {}),
            officer: {
              id: item.user.id,
              displayName: item.user.displayName,
              email: item.user.email
            }
          }))
        };
      } catch (error) {
        if (error instanceof LessonSubmissionError) {
          return reply.status(error.statusCode).send({
            message: error.message,
            statusCode: error.statusCode
          });
        }

        throw error;
      }
    }
  );

  fastify.post<{ Params: { submissionId: string } } & SubmissionReviewBody>(
    "/submissions/:submissionId/review",
    async (request, reply) => {
      const authUser = await fastify.requireRole(request, ["ds", "admin"]);

      const reviewer = await fastify.prisma.user.findUnique({
        where: { firebaseUid: authUser.uid },
        select: { id: true }
      });

      if (!reviewer) {
        return reply.notFound("Reviewer not found in database.");
      }

      try {
        const submission = await reviewLessonSubmission({
          prisma: fastify.prisma,
          reviewerId: reviewer.id,
          submissionId: request.params.submissionId,
          status: request.body.status,
          ...(request.body.score !== undefined ? { score: request.body.score } : {}),
          ...(request.body.maxScore !== undefined ? { maxScore: request.body.maxScore } : {}),
          ...(request.body.reviewNotes ? { reviewNotes: request.body.reviewNotes } : {}),
          ...(request.body.rubricScores?.length ? { rubricScores: request.body.rubricScores } : {})
        });

        return {
          ok: true,
          submission,
          note: "Submission review recorded."
        };
      } catch (error) {
        if (error instanceof LessonSubmissionError) {
          return reply.status(error.statusCode).send({
            message: error.message,
            statusCode: error.statusCode
          });
        }

        throw error;
      }
    }
  );
};

export default dsRoutes;
