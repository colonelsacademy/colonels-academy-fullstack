import type { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";

export class MockTestAttemptService {
  constructor(
    private prisma: PrismaClient,
    private fastify: FastifyInstance
  ) {}

  /**
   * Start a mock test attempt
   */
  async startAttempt(userId: string, mockTestId: string) {
    // Verify test exists and is published
    const test = await this.prisma.mockTest.findUnique({
      where: { id: mockTestId },
      include: { questions: true }
    });

    if (!test) {
      throw new Error("Mock test not found");
    }

    if (test.status !== "PUBLISHED") {
      throw new Error("Test is not published");
    }

    // Check if user has access to paid test
    if (test.accessType === "PAID") {
      const purchase = await this.prisma.mockTestPurchase.findUnique({
        where: {
          userId_mockTestId: {
            userId,
            mockTestId
          }
        }
      });

      if (!purchase || purchase.paymentStatus !== "COMPLETED") {
        throw new Error("You must purchase this test to access it");
      }
    }

    // Create attempt
    return this.prisma.mockTestAttempt.create({
      data: {
        userId,
        mockTestId,
        totalMarks: test.totalQuestions,
        status: "IN_PROGRESS",
        answers: {}
      }
    });
  }

  /**
   * Submit a mock test attempt
   */
  async submitAttempt(
    userId: string,
    mockTestId: string,
    attemptId: string,
    answers: Record<string, string>,
    timeTakenSeconds: number
  ) {
    // Verify attempt exists and belongs to user
    const attempt = await this.prisma.mockTestAttempt.findUnique({
      where: { id: attemptId }
    });

    if (!attempt) {
      throw new Error("Attempt not found");
    }

    if (attempt.userId !== userId) {
      throw new Error("Unauthorized");
    }

    if (attempt.mockTestId !== mockTestId) {
      throw new Error("Attempt does not match test");
    }

    // Get test and questions
    const test = await this.prisma.mockTest.findUnique({
      where: { id: mockTestId },
      include: { questions: true }
    });

    if (!test) {
      throw new Error("Test not found");
    }

    // Check if user has access to paid test
    if (test.accessType === "PAID") {
      const purchase = await this.prisma.mockTestPurchase.findUnique({
        where: {
          userId_mockTestId: {
            userId,
            mockTestId
          }
        }
      });

      if (!purchase || purchase.paymentStatus !== "COMPLETED") {
        throw new Error("You must purchase this test to submit");
      }
    }

    // Calculate score
    const score = this.calculateScore(answers, test.questions);
    const percentage = Math.round((score / test.totalQuestions) * 100);

    // Update attempt
    return this.prisma.mockTestAttempt.update({
      where: { id: attemptId },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        timeTakenSeconds,
        score,
        answers
      }
    });
  }

  /**
   * Calculate score based on answers
   */
  private calculateScore(
    answers: Record<string, string>,
    questions: Array<{ id: string; correctAnswer: string; [key: string]: any }>
  ): number {
    let correctCount = 0;

    for (const question of questions) {
      if (answers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    }

    return correctCount;
  }

  /**
   * Get attempt results
   */
  async getAttemptResults(attemptId: string, userId: string) {
    const attempt = await this.prisma.mockTestAttempt.findUnique({
      where: { id: attemptId },
      include: {
        mockTest: {
          include: { questions: true }
        }
      }
    });

    if (!attempt) {
      throw new Error("Attempt not found");
    }

    if (attempt.userId !== userId) {
      throw new Error("Unauthorized");
    }

    if (attempt.status !== "SUBMITTED") {
      throw new Error("Attempt not submitted yet");
    }

    const answers = attempt.answers as Record<string, string>;
    const results = attempt.mockTest.questions.map((question) => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;

      return {
        questionId: question.id,
        questionText: question.questionText,
        options: question.options as string[],
        userAnswer: userAnswer || null,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
    });

    const percentage = Math.round((attempt.score! / attempt.totalMarks) * 100);
    const passed = percentage >= attempt.mockTest.passingScore;

    return {
      attemptId: attempt.id,
      mockTestId: attempt.mockTestId,
      testTitle: attempt.mockTest.title,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage,
      passed,
      timeTakenSeconds: attempt.timeTakenSeconds,
      submittedAt: attempt.submittedAt,
      results
    };
  }

  /**
   * Get user's attempts for a test
   */
  async getUserAttempts(userId: string, mockTestId: string) {
    return this.prisma.mockTestAttempt.findMany({
      where: {
        userId,
        mockTestId,
        status: "SUBMITTED"
      },
      orderBy: { submittedAt: "desc" }
    });
  }

  /**
   * Get user's best score for a test
   */
  async getUserBestScore(userId: string, mockTestId: string) {
    const attempts = await this.prisma.mockTestAttempt.findMany({
      where: {
        userId,
        mockTestId,
        status: "SUBMITTED",
        score: { not: null }
      },
      orderBy: { score: "desc" },
      take: 1
    });

    return attempts[0]?.score || null;
  }

  /**
   * Get user's attempt count for a test
   */
  async getUserAttemptCount(userId: string, mockTestId: string) {
    return this.prisma.mockTestAttempt.count({
      where: {
        userId,
        mockTestId,
        status: "SUBMITTED"
      }
    });
  }
}

export function createMockTestAttemptService(
  prisma: PrismaClient,
  fastify: FastifyInstance
): MockTestAttemptService {
  return new MockTestAttemptService(prisma, fastify);
}
