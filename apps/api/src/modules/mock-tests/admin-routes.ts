import type { FastifyPluginAsync } from "fastify";
import { createMockTestService } from "../../lib/mock-test";
import { createMockTestQuestionService } from "../../lib/mock-test-question";
import { createSubjectService } from "../../lib/subject";

const adminMockTestRoutes: FastifyPluginAsync = async (fastify) => {
  const mockTestService = createMockTestService(fastify.prisma, fastify);
  const questionService = createMockTestQuestionService(fastify.prisma, fastify);
  const subjectService = createSubjectService(fastify.prisma, fastify);

  // ── SUBJECT MANAGEMENT ──

  /**
   * Create subject
   * POST /v1/admin/subjects
   */
  fastify.post<{ Body: { name: string; position: string; description?: string } }>(
    "/subjects",
    async (request, reply) => {
      const authUser = await fastify.requireAuth(request);

      // Check admin role
      if (authUser.role !== "ADMIN") {
        return reply.forbidden("Only admins can create subjects");
      }

      try {
        const subject = await subjectService.createSubject(request.body);
        return reply.code(201).send(subject);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create subject";
        return reply.badRequest(message);
      }
    }
  );

  /**
   * List subjects by position
   * GET /v1/admin/subjects?position=Officer%20Cadet
   */
  fastify.get<{ Querystring: { position?: string } }>("/subjects", async (request, reply) => {
    const authUser = await fastify.requireAuth(request);

    if (authUser.role !== "ADMIN") {
      return reply.forbidden("Only admins can view subjects");
    }

    try {
      const subjects = request.query.position
        ? await subjectService.listSubjectsByPosition(request.query.position)
        : await subjectService.listAllSubjects();

      return reply.send(subjects);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch subjects";
      return reply.internalServerError(message);
    }
  });

  // ── MOCK TEST MANAGEMENT ──

  /**
   * Create mock test
   * POST /v1/admin/mock-tests
   */
  fastify.post<{
    Body: {
      title: string;
      description?: string;
      position: string;
      subjectId: string;
      timeLimitMinutes: number;
      totalQuestions: number;
      passingScore: number;
      accessType?: string;
      priceNpr?: number;
      freePreviewCount?: number;
    };
  }>("/mock-tests", async (request, reply) => {
    const authUser = await fastify.requireAuth(request);

    if (authUser.role !== "ADMIN") {
      return reply.forbidden("Only admins can create mock tests");
    }

    try {
      const test = await mockTestService.createMockTest({
        ...request.body,
        createdBy: authUser.uid
      });

      return reply.code(201).send(test);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create mock test";
      return reply.badRequest(message);
    }
  });

  /**
   * List mock tests by subject(s)
   * GET /v1/admin/mock-tests?subjectId=subject_123&status=PUBLISHED
   * GET /v1/admin/mock-tests?subjectIds=subject_123,subject_456&status=PUBLISHED
   */
  fastify.get<{ Querystring: { subjectId?: string; subjectIds?: string; status?: string } }>(
    "/mock-tests",
    async (request, reply) => {
      const authUser = await fastify.requireAuth(request);

      if (authUser.role !== "ADMIN") {
        return reply.forbidden("Only admins can view mock tests");
      }

      try {
        // Support both single subjectId and multiple subjectIds
        const subjectId = request.query.subjectId;
        const subjectIds = request.query.subjectIds;

        if (!subjectId && !subjectIds) {
          return reply.badRequest("subjectId or subjectIds is required");
        }

        let tests: Awaited<ReturnType<typeof mockTestService.listMockTestsBySubject>> = [];

        if (subjectIds) {
          // Handle multiple subject IDs
          const ids = subjectIds.split(",").map((id) => id.trim());
          for (const id of ids) {
            const subjectTests = await mockTestService.listMockTestsBySubject(
              id,
              request.query.status
            );
            tests = tests.concat(subjectTests);
          }
        } else if (subjectId) {
          // Handle single subject ID
          tests = await mockTestService.listMockTestsBySubject(subjectId, request.query.status);
        }

        return reply.send(tests);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch mock tests";
        return reply.internalServerError(message);
      }
    }
  );

  /**
   * Get mock test details
   * GET /v1/admin/mock-tests/:id
   */
  fastify.get<{ Params: { id: string } }>("/mock-tests/:id", async (request, reply) => {
    const authUser = await fastify.requireAuth(request);

    if (authUser.role !== "ADMIN") {
      return reply.forbidden("Only admins can view mock tests");
    }

    try {
      const test = await mockTestService.getMockTestById(request.params.id);

      if (!test) {
        return reply.notFound("Mock test not found");
      }

      return reply.send(test);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch mock test";
      return reply.internalServerError(message);
    }
  });

  /**
   * Update mock test
   * PUT /v1/admin/mock-tests/:id
   */
  fastify.put<{
    Params: { id: string };
    Body: {
      title?: string;
      description?: string;
      timeLimitMinutes?: number;
      totalQuestions?: number;
      passingScore?: number;
      accessType?: string;
      priceNpr?: number;
      freePreviewCount?: number;
    };
  }>("/mock-tests/:id", async (request, reply) => {
    const authUser = await fastify.requireAuth(request);

    if (authUser.role !== "ADMIN") {
      return reply.forbidden("Only admins can update mock tests");
    }

    try {
      const test = await mockTestService.updateMockTest(request.params.id, request.body);
      return reply.send(test);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update mock test";
      return reply.badRequest(message);
    }
  });

  /**
   * Publish mock test
   * POST /v1/admin/mock-tests/:id/publish
   */
  fastify.post<{ Params: { id: string } }>("/mock-tests/:id/publish", async (request, reply) => {
    const authUser = await fastify.requireAuth(request);

    if (authUser.role !== "ADMIN") {
      return reply.forbidden("Only admins can publish mock tests");
    }

    try {
      const test = await mockTestService.publishMockTest(request.params.id);
      return reply.send(test);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to publish mock test";
      return reply.badRequest(message);
    }
  });

  /**
   * Archive mock test
   * POST /v1/admin/mock-tests/:id/archive
   */
  fastify.post<{ Params: { id: string } }>("/mock-tests/:id/archive", async (request, reply) => {
    const authUser = await fastify.requireAuth(request);

    if (authUser.role !== "ADMIN") {
      return reply.forbidden("Only admins can archive mock tests");
    }

    try {
      const test = await mockTestService.archiveMockTest(request.params.id);
      return reply.send(test);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to archive mock test";
      return reply.badRequest(message);
    }
  });

  /**
   * Delete mock test
   * DELETE /v1/admin/mock-tests/:id
   */
  fastify.delete<{ Params: { id: string } }>("/mock-tests/:id", async (request, reply) => {
    const authUser = await fastify.requireAuth(request);

    if (authUser.role !== "ADMIN") {
      return reply.forbidden("Only admins can delete mock tests");
    }

    try {
      await mockTestService.deleteMockTest(request.params.id);
      return reply.code(204).send();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete mock test";
      return reply.badRequest(message);
    }
  });

  // ── QUESTION MANAGEMENT ──

  /**
   * Add question to mock test
   * POST /v1/admin/mock-tests/:id/questions
   */
  fastify.post<{
    Params: { id: string };
    Body: {
      questionText: string;
      options: string[];
      correctAnswer: string;
      explanation?: string;
      difficulty?: number;
      position: number;
      isImageBased?: boolean;
      imageUrl?: string;
    };
  }>("/mock-tests/:id/questions", async (request, reply) => {
    const authUser = await fastify.requireAuth(request);

    if (authUser.role !== "ADMIN") {
      return reply.forbidden("Only admins can add questions");
    }

    try {
      const question = await questionService.addQuestion({
        mockTestId: request.params.id,
        ...request.body
      });

      return reply.code(201).send(question);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add question";
      return reply.badRequest(message);
    }
  });

  /**
   * Update question
   * PUT /v1/admin/mock-tests/:id/questions/:qId
   */
  fastify.put<{
    Params: { id: string; qId: string };
    Body: {
      questionText?: string;
      options?: string[];
      correctAnswer?: string;
      explanation?: string;
      difficulty?: number;
      isImageBased?: boolean;
      imageUrl?: string;
    };
  }>("/mock-tests/:id/questions/:qId", async (request, reply) => {
    const authUser = await fastify.requireAuth(request);

    if (authUser.role !== "ADMIN") {
      return reply.forbidden("Only admins can update questions");
    }

    try {
      const question = await questionService.updateQuestion(request.params.qId, request.body);
      return reply.send(question);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update question";
      return reply.badRequest(message);
    }
  });

  /**
   * Delete question
   * DELETE /v1/admin/mock-tests/:id/questions/:qId
   */
  fastify.delete<{ Params: { id: string; qId: string } }>(
    "/mock-tests/:id/questions/:qId",
    async (request, reply) => {
      const authUser = await fastify.requireAuth(request);

      if (authUser.role !== "ADMIN") {
        return reply.forbidden("Only admins can delete questions");
      }

      try {
        await questionService.deleteQuestion(request.params.qId);
        return reply.code(204).send();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete question";
        return reply.badRequest(message);
      }
    }
  );

  /**
   * Reorder questions
   * POST /v1/admin/mock-tests/:id/questions/reorder
   */
  fastify.post<{
    Params: { id: string };
    Body: { questionIds: string[] };
  }>("/mock-tests/:id/questions/reorder", async (request, reply) => {
    const authUser = await fastify.requireAuth(request);

    if (authUser.role !== "ADMIN") {
      return reply.forbidden("Only admins can reorder questions");
    }

    try {
      const questions = await questionService.reorderQuestions(
        request.params.id,
        request.body.questionIds
      );

      return reply.send(questions);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reorder questions";
      return reply.badRequest(message);
    }
  });

  /**
   * Get mock test analytics
   * GET /v1/admin/mock-tests/:id/analytics
   */
  fastify.get<{ Params: { id: string } }>("/mock-tests/:id/analytics", async (request, reply) => {
    const authUser = await fastify.requireAuth(request);

    if (authUser.role !== "ADMIN") {
      return reply.forbidden("Only admins can view analytics");
    }

    try {
      const analytics = await mockTestService.getMockTestAnalytics(request.params.id);
      return reply.send(analytics);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch analytics";
      return reply.internalServerError(message);
    }
  });
};

export default adminMockTestRoutes;
