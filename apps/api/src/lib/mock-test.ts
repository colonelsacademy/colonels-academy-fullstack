import type { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";

export class MockTestService {
  constructor(
    private prisma: PrismaClient,
    private fastify: FastifyInstance
  ) {}

  /**
   * Create a new mock test
   */
  async createMockTest(data: {
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
    createdBy: string;
  }) {
    // Validate subject exists
    const subject = await this.prisma.subject.findUnique({
      where: { id: data.subjectId }
    });

    if (!subject) {
      throw new Error("Subject not found");
    }

    // Validate pricing for PAID tests
    if (data.accessType === "PAID" && !data.priceNpr) {
      throw new Error("Price is required for PAID tests");
    }

    return this.prisma.mockTest.create({
      data: {
        title: data.title,
        description: data.description || null,
        position: data.position,
        subjectId: data.subjectId,
        timeLimitMinutes: data.timeLimitMinutes,
        totalQuestions: data.totalQuestions,
        passingScore: data.passingScore,
        accessType: data.accessType || "FREE",
        priceNpr: data.priceNpr || null,
        freePreviewCount: data.freePreviewCount || 0,
        status: "DRAFT",
        createdBy: data.createdBy
      },
      include: {
        subject: true
      }
    });
  }

  /**
   * Update a mock test
   */
  async updateMockTest(
    testId: string,
    data: {
      title?: string;
      description?: string;
      timeLimitMinutes?: number;
      totalQuestions?: number;
      passingScore?: number;
      accessType?: string;
      priceNpr?: number;
      freePreviewCount?: number;
      status?: string;
    }
  ) {
    // Validate pricing for PAID tests
    if (data.accessType === "PAID" && data.priceNpr === null) {
      throw new Error("Price is required for PAID tests");
    }

    return this.prisma.mockTest.update({
      where: { id: testId },
      data,
      include: {
        subject: true
      }
    });
  }

  /**
   * Get mock test by ID with questions
   */
  async getMockTestById(testId: string) {
    return this.prisma.mockTest.findUnique({
      where: { id: testId },
      include: {
        subject: true,
        questions: {
          orderBy: { position: "asc" }
        }
      }
    });
  }

  /**
   * List mock tests by subject
   */
  async listMockTestsBySubject(subjectId: string, status?: string) {
    return this.prisma.mockTest.findMany({
      where: {
        subjectId,
        ...(status && { status })
      },
      include: {
        subject: true,
        _count: {
          select: { attempts: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  /**
   * List all mock tests for a position
   */
  async listMockTestsByPosition(position: string, status?: string) {
    return this.prisma.mockTest.findMany({
      where: {
        position,
        ...(status && { status })
      },
      include: {
        subject: true,
        _count: {
          select: { attempts: true }
        }
      },
      orderBy: [{ subject: { name: "asc" } }, { createdAt: "desc" }]
    });
  }

  /**
   * Publish a mock test
   */
  async publishMockTest(testId: string) {
    // Verify test has questions
    const test = await this.prisma.mockTest.findUnique({
      where: { id: testId },
      include: {
        questions: true
      }
    });

    if (!test) {
      throw new Error("Test not found");
    }

    if (test.questions.length === 0) {
      throw new Error("Cannot publish test without questions");
    }

    if (test.questions.length !== test.totalQuestions) {
      throw new Error(
        `Test has ${test.questions.length} questions but totalQuestions is ${test.totalQuestions}`
      );
    }

    return this.prisma.mockTest.update({
      where: { id: testId },
      data: { status: "PUBLISHED" },
      include: {
        subject: true
      }
    });
  }

  /**
   * Archive a mock test
   */
  async archiveMockTest(testId: string) {
    return this.prisma.mockTest.update({
      where: { id: testId },
      data: { status: "ARCHIVED" },
      include: {
        subject: true
      }
    });
  }

  /**
   * Delete a mock test
   */
  async deleteMockTest(testId: string) {
    return this.prisma.mockTest.delete({
      where: { id: testId }
    });
  }

  /**
   * Get questions for a test attempt filtered by difficulty mode
   */
  async getQuestionsForAttempt(
    testId: string,
    difficultyMode: "EASY" | "MEDIUM" | "HARD" | "MIXED" = "MIXED"
  ) {
    // Validate difficulty mode
    const validModes = ["EASY", "MEDIUM", "HARD", "MIXED"];
    if (!validModes.includes(difficultyMode)) {
      throw new Error(`Invalid difficulty mode: ${difficultyMode}`);
    }

    // Determine difficulty filter
    let difficultyFilter: number | undefined;

    switch (difficultyMode) {
      case "EASY":
        difficultyFilter = 1;
        break;
      case "MEDIUM":
        difficultyFilter = 2;
        break;
      case "HARD":
        difficultyFilter = 3;
        break;
      case "MIXED":
      default:
        difficultyFilter = undefined; // No filter
        break;
    }

    // Get questions
    const questions = await this.prisma.mockTestQuestion.findMany({
      where: {
        mockTestId: testId,
        ...(difficultyFilter !== undefined && { difficulty: difficultyFilter })
      },
      orderBy: { position: "asc" }
    });

    if (questions.length === 0) {
      throw new Error(`No questions found for difficulty mode: ${difficultyMode}`);
    }

    return questions;
  }

  /**
   * Get analytics for a mock test by difficulty mode
   */
  async getMockTestAnalyticsByDifficulty(testId: string) {
    const test = await this.prisma.mockTest.findUnique({
      where: { id: testId },
      include: {
        attempts: {
          where: { status: "SUBMITTED" }
        },
        questions: true
      }
    });

    if (!test) {
      throw new Error("Test not found");
    }

    const attempts = test.attempts;

    // Group questions by difficulty
    const easyQuestions = test.questions.filter((q) => q.difficulty === 1);
    const mediumQuestions = test.questions.filter((q) => q.difficulty === 2);
    const hardQuestions = test.questions.filter((q) => q.difficulty === 3);

    // Calculate stats for each difficulty
    const calculateDifficultyStats = (questions: typeof test.questions) => {
      if (questions.length === 0) {
        return {
          totalQuestions: 0,
          averageAccuracy: 0,
          totalAttempts: 0
        };
      }

      let totalCorrect = 0;
      let totalAttempts = 0;

      for (const question of questions) {
        const questionAttempts = attempts.filter((a) => {
          const answers = a.answers as Record<string, string>;
          return answers && answers[question.id];
        });

        const correctCount = questionAttempts.filter((a) => {
          const answers = a.answers as Record<string, string>;
          return answers[question.id] === question.correctAnswer;
        }).length;

        totalCorrect += correctCount;
        totalAttempts += questionAttempts.length;
      }

      const averageAccuracy =
        totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

      return {
        totalQuestions: questions.length,
        averageAccuracy,
        totalAttempts
      };
    };

    return {
      mockTestId: test.id,
      title: test.title,
      easy: calculateDifficultyStats(easyQuestions),
      medium: calculateDifficultyStats(mediumQuestions),
      hard: calculateDifficultyStats(hardQuestions)
    };
  }

  /**
   * Get analytics for a mock test
   */
  async getMockTestAnalytics(testId: string) {
    const test = await this.prisma.mockTest.findUnique({
      where: { id: testId },
      include: {
        attempts: {
          where: { status: "SUBMITTED" }
        },
        questions: true
      }
    });

    if (!test) {
      throw new Error("Test not found");
    }

    const attempts = test.attempts;
    const totalAttempts = attempts.length;
    const passedAttempts = attempts.filter((a) => a.score && a.score >= test.passingScore).length;
    const averageScore =
      totalAttempts > 0
        ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalAttempts)
        : 0;
    const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
    const averageTimeTaken =
      totalAttempts > 0
        ? Math.round(
            attempts.reduce((sum, a) => sum + (a.timeTakenSeconds || 0), 0) / totalAttempts
          )
        : 0;

    // Question-wise stats
    const questionStats = test.questions.map((question) => {
      const questionAttempts = attempts.filter((a) => {
        const answers = a.answers as Record<string, string>;
        return answers && answers[question.id];
      });

      const correctCount = questionAttempts.filter((a) => {
        const answers = a.answers as Record<string, string>;
        return answers[question.id] === question.correctAnswer;
      }).length;

      const accuracy =
        questionAttempts.length > 0
          ? Math.round((correctCount / questionAttempts.length) * 100)
          : 0;

      return {
        questionId: question.id,
        questionText: question.questionText,
        correctCount,
        incorrectCount: questionAttempts.length - correctCount,
        accuracy
      };
    });

    return {
      mockTestId: test.id,
      title: test.title,
      subjectId: test.subjectId,
      totalAttempts,
      averageScore,
      passRate,
      averageTimeTaken,
      questionStats
    };
  }
}

export function createMockTestService(
  prisma: PrismaClient,
  fastify: FastifyInstance
): MockTestService {
  return new MockTestService(prisma, fastify);
}
