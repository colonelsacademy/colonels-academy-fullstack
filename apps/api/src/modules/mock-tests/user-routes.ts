import type { FastifyPluginAsync } from "fastify";
import { createMockTestService } from "../../lib/mock-test";
import { createMockTestAttemptService } from "../../lib/mock-test-attempt";
import { createMockTestPurchaseService } from "../../lib/mock-test-purchase";
import { createSubjectService } from "../../lib/subject";
import { syncUserWithPostgres } from "../auth/user-sync";

const userMockTestRoutes: FastifyPluginAsync = async (fastify) => {
  const mockTestService = createMockTestService(fastify.prisma, fastify);
  const attemptService = createMockTestAttemptService(fastify.prisma, fastify);
  const purchaseService = createMockTestPurchaseService(fastify.prisma, fastify);
  const subjectService = createSubjectService(fastify.prisma, fastify);

  /**
   * Resolve DB user ID from Firebase auth
   */
  async function resolveDbUserId(authUid: string): Promise<string> {
    let dbUser = await fastify.prisma.user.findUnique({
      where: { firebaseUid: authUid },
      select: { id: true }
    });

    if (!dbUser) {
      // Sync with basic info - create user directly if sync fails
      try {
        dbUser = await fastify.prisma.user.create({
          data: {
            firebaseUid: authUid,
            role: "STUDENT"
          },
          select: { id: true }
        });
        fastify.log.info(`Created new user: ${authUid}`);
      } catch (err) {
        fastify.log.error(`Failed to create user: ${authUid}`);
        throw new Error("Failed to create user account");
      }
    }

    if (!dbUser) {
      throw new Error("Failed to sync user");
    }

    return dbUser.id;
  }

  // ── SUBJECT BROWSING ──

  /**
   * List subjects for a position
   * GET /v1/mock-tests/subjects?position=Officer%20Cadet
   */
  fastify.get<{ Querystring: { position?: string } }>(
    "/subjects",
    async (request, reply) => {
      try {
        const subjects = request.query.position
          ? await subjectService.listSubjectsByPosition(request.query.position)
          : await subjectService.listAllSubjects();

        return reply.send(subjects);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch subjects";
        return reply.internalServerError(message);
      }
    }
  );

  // ── TEST BROWSING ──

  /**
   * List mock tests by subject
   * GET /v1/mock-tests?position=Officer%20Cadet&subjectId=subject_123
   */
  fastify.get<{ Querystring: { position?: string; subjectId?: string } }>(
    "/",
    async (request, reply) => {
      try {
        if (!request.query.subjectId) {
          return reply.badRequest("subjectId is required");
        }

        const tests = await mockTestService.listMockTestsBySubject(
          request.query.subjectId,
          "PUBLISHED"
        );

        // Enrich with user data if authenticated
        let userId: string | null = null;
        try {
          const authUser = await fastify.requireAuth(request);
          userId = await resolveDbUserId(authUser.uid);
        } catch {
          // Not authenticated, continue without user data
        }

        const enrichedTests = await Promise.all(
          tests.map(async (test) => {
            let bestScore = null;
            let attemptCount = 0;
            let hasPurchased = false;

            if (userId) {
              bestScore = await attemptService.getUserBestScore(userId, test.id);
              attemptCount = await attemptService.getUserAttemptCount(userId, test.id);

              if (test.accessType === "PAID") {
                hasPurchased = await purchaseService.hasPurchased(userId, test.id);
              }
            }

            return {
              ...test,
              bestScore,
              attemptCount,
              hasPurchased
            };
          })
        );

        return reply.send(enrichedTests);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch mock tests";
        return reply.internalServerError(message);
      }
    }
  );

  /**
   * Get mock test details
   * GET /v1/mock-tests/:id
   */
  fastify.get<{ Params: { id: string } }>(
    "/:id",
    async (request, reply) => {
      try {
        const test = await mockTestService.getMockTestById(request.params.id);

        if (!test || test.status !== "PUBLISHED") {
          return reply.notFound("Mock test not found");
        }

        // Check user access
        let userId: string | null = null;
        let hasAccess = test.accessType === "FREE";
        let hasPurchased = false;

        try {
          const authUser = await fastify.requireAuth(request);
          userId = await resolveDbUserId(authUser.uid);

          if (test.accessType === "PAID") {
            hasPurchased = await purchaseService.hasPurchased(userId, test.id);
            hasAccess = hasPurchased;
          }
        } catch {
          // Not authenticated
        }

        // Filter questions based on access
        let questions = test.questions;
        if (test.accessType === "PAID" && !hasAccess) {
          // Show only free preview questions
          questions = questions.slice(0, test.freePreviewCount);
        }

        return reply.send({
          ...test,
          questions,
          hasAccess,
          hasPurchased,
          canViewAllQuestions: hasAccess
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch mock test";
        return reply.internalServerError(message);
      }
    }
  );

  /**
   * Check access to a mock test
   * GET /v1/mock-tests/:id/check-access
   */
  fastify.get<{ Params: { id: string } }>(
    "/:id/check-access",
    async (request, reply) => {
      try {
        const test = await mockTestService.getMockTestById(request.params.id);

        if (!test) {
          return reply.notFound("Mock test not found");
        }

        if (test.accessType === "FREE") {
          return reply.send({
            hasAccess: true,
            accessType: "FREE",
            canViewAllQuestions: true
          });
        }

        // PAID test
        try {
          const authUser = await fastify.requireAuth(request);
          const userId = await resolveDbUserId(authUser.uid);
          const hasPurchased = await purchaseService.hasPurchased(userId, test.id);

          if (hasPurchased) {
            return reply.send({
              hasAccess: true,
              accessType: "PAID",
              canViewAllQuestions: true,
              purchasedAt: new Date()
            });
          }

          return reply.send({
            hasAccess: false,
            accessType: "PAID",
            canViewAllQuestions: false,
            freePreviewCount: test.freePreviewCount,
            price: test.priceNpr,
            message: "Purchase to access full test"
          });
        } catch {
          return reply.send({
            hasAccess: false,
            accessType: "PAID",
            canViewAllQuestions: false,
            freePreviewCount: test.freePreviewCount,
            price: test.priceNpr,
            message: "Login and purchase to access full test"
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to check access";
        return reply.internalServerError(message);
      }
    }
  );

  // ── TEST ATTEMPTS ──

  /**
   * Start a mock test attempt
   * POST /v1/mock-tests/:id/start
   * Body: { difficultyMode?: "EASY" | "MEDIUM" | "HARD" | "MIXED" }
   */
  fastify.post<{ 
    Params: { id: string };
    Body: { difficultyMode?: string };
  }>(
    "/:id/start",
    async (request, reply) => {
      const authUser = await fastify.requireAuth(request);

      try {
        fastify.log.info(`Start attempt request: testId=${request.params.id}, difficultyMode=${request.body?.difficultyMode}`);

        const userId = await resolveDbUserId(authUser.uid);
        const difficultyMode = (request.body?.difficultyMode || "MIXED") as "EASY" | "MEDIUM" | "HARD" | "MIXED";

        // Validate difficulty mode
        const validModes = ["EASY", "MEDIUM", "HARD", "MIXED"];
        if (!validModes.includes(difficultyMode)) {
          fastify.log.error(`Invalid difficulty mode: ${difficultyMode}`);
          return reply.badRequest(`Invalid difficulty mode: ${difficultyMode}`);
        }

        fastify.log.info(`Fetching questions for difficulty mode: ${difficultyMode}`);

        // Get questions for this difficulty mode
        const questions = await mockTestService.getQuestionsForAttempt(
          request.params.id,
          difficultyMode
        );

        fastify.log.info(`Retrieved ${questions.length} questions`);

        // Get test details
        const test = await mockTestService.getMockTestById(request.params.id);
        if (!test) {
          fastify.log.error(`Test not found: ${request.params.id}`);
          return reply.notFound("Mock test not found");
        }

        fastify.log.info(`Creating attempt for user: ${userId}`);

        // Create attempt
        const attempt = await fastify.prisma.mockTestAttempt.create({
          data: {
            userId,
            mockTestId: request.params.id,
            totalMarks: questions.length * 2, // 2 marks per question
            difficultyMode: difficultyMode,
            answers: {}
          }
        });

        fastify.log.info(`Attempt created: ${attempt.id}`);

        return reply.code(201).send({
          id: attempt.id,
          mockTestId: attempt.mockTestId,
          startedAt: attempt.startedAt,
          questions: questions.map(q => ({
            id: q.id,
            questionText: q.questionText,
            options: q.options,
            difficulty: q.difficulty,
            position: q.position,
            isImageBased: q.isImageBased,
            imageUrl: q.imageUrl
          })),
          totalQuestions: questions.length,
          timeLimitMinutes: test.timeLimitMinutes,
          difficultyMode,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to start attempt";
        fastify.log.error(`Start attempt error: ${message}`);
        return reply.badRequest(message);
      }
    }
  );

  /**
   * Submit a mock test attempt
   * POST /v1/mock-tests/:id/submit
   */
  fastify.post<{
    Params: { id: string };
    Body: {
      attemptId: string;
      answers: Record<string, string>;
      timeTakenSeconds: number;
    };
  }>(
    "/:id/submit",
    async (request, reply) => {
      const authUser = await fastify.requireAuth(request);

      try {
        const userId = await resolveDbUserId(authUser.uid);
        
        fastify.log.info(`Submit request: attemptId=${request.body.attemptId}, testId=${request.params.id}, answersCount=${Object.keys(request.body.answers).length}`);

        // Get the attempt to retrieve the difficulty mode
        const attempt = await fastify.prisma.mockTestAttempt.findUnique({
          where: { id: request.body.attemptId }
        });

        if (!attempt) {
          fastify.log.error(`Attempt not found: ${request.body.attemptId}`);
          return reply.notFound("Attempt not found");
        }

        fastify.log.info(`Attempt found: difficultyMode=${attempt.difficultyMode}, mockTestId=${attempt.mockTestId}`);

        // Get questions for the same difficulty mode used in the attempt
        const questions = await mockTestService.getQuestionsForAttempt(
          request.params.id,
          attempt.difficultyMode as "EASY" | "MEDIUM" | "HARD" | "MIXED"
        );

        fastify.log.info(`Retrieved ${questions.length} questions for difficulty mode: ${attempt.difficultyMode}`);

        // Answers are already in full text format from the web app
        const convertedAnswers: Record<string, string> = {};
        let conversionErrors = 0;

        for (const [questionId, answer] of Object.entries(request.body.answers)) {
          const question = questions.find(q => q.id === questionId);
          if (question && answer) {
            // Check if answer is already full text or if it's a letter
            if (answer.length === 1 && /^[A-E]$/.test(answer)) {
              // Convert letter to full text
              const letterIndex = answer.charCodeAt(0) - 65;
              const options = question.options as string[];
              if (letterIndex >= 0 && letterIndex < options.length) {
                const fullAnswer = options[letterIndex];
                if (fullAnswer) {
                  convertedAnswers[questionId] = fullAnswer;
                }
              } else {
                fastify.log.warn(`Invalid letter answer: ${answer} for question ${questionId}`);
                conversionErrors++;
              }
            } else {
              // Already full text
              convertedAnswers[questionId] = answer;
            }
          } else {
            fastify.log.warn(`Question not found or no answer: questionId=${questionId}, answer=${answer}`);
            conversionErrors++;
          }
        }

        fastify.log.info(`Converted ${Object.keys(convertedAnswers).length} answers, ${conversionErrors} errors`);

        const submitAttempt = await attemptService.submitAttempt(
          userId,
          request.params.id,
          request.body.attemptId,
          convertedAnswers,
          request.body.timeTakenSeconds
        );

        fastify.log.info(`Attempt submitted successfully: score=${submitAttempt.score}`);

        return reply.send(submitAttempt);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to submit attempt";
        fastify.log.error(`Submit error: ${message}`);
        return reply.badRequest(message);
      }
    }
  );

  /**
   * Get attempt results
   * GET /v1/mock-tests/:id/attempts/:attemptId
   */
  fastify.get<{ Params: { id: string; attemptId: string } }>(
    "/:id/attempts/:attemptId",
    async (request, reply) => {
      const authUser = await fastify.requireAuth(request);

      try {
        const userId = await resolveDbUserId(authUser.uid);
        const results = await attemptService.getAttemptResults(
          request.params.attemptId,
          userId
        );

        return reply.send(results);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch results";
        return reply.badRequest(message);
      }
    }
  );

  /**
   * Get user's attempts for a test
   * GET /v1/mock-tests/:id/attempts
   */
  fastify.get<{ Params: { id: string } }>(
    "/:id/attempts",
    async (request, reply) => {
      const authUser = await fastify.requireAuth(request);

      try {
        const userId = await resolveDbUserId(authUser.uid);
        const attempts = await attemptService.getUserAttempts(userId, request.params.id);

        return reply.send(attempts);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch attempts";
        return reply.internalServerError(message);
      }
    }
  );

  // ── PURCHASES ──

  /**
   * Purchase a mock test
   * POST /v1/mock-tests/:id/purchase
   */
  fastify.post<{
    Params: { id: string };
    Body: { paymentMethod: string };
  }>(
    "/:id/purchase",
    async (request, reply) => {
      const authUser = await fastify.requireAuth(request);

      try {
        const userId = await resolveDbUserId(authUser.uid);
        const test = await mockTestService.getMockTestById(request.params.id);

        if (!test) {
          return reply.notFound("Mock test not found");
        }

        if (test.accessType !== "PAID") {
          return reply.badRequest("This test is free");
        }

        const purchase = await purchaseService.createPurchase({
          userId,
          mockTestId: request.params.id,
          amount: test.priceNpr!,
          paymentMethod: request.body.paymentMethod
        });

        return reply.code(201).send(purchase);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create purchase";
        return reply.badRequest(message);
      }
    }
  );
};

export default userMockTestRoutes;
