import { type PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";

export class MockTestQuestionService {
  constructor(
    private prisma: PrismaClient,
    private fastify: FastifyInstance
  ) {}

  /**
   * Add a question to a mock test
   */
  async addQuestion(data: {
    mockTestId: string;
    questionText: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
    difficulty?: number;
    position: number;
    isImageBased?: boolean;
    imageUrl?: string;
  }) {
    // Validate test exists
    const test = await this.prisma.mockTest.findUnique({
      where: { id: data.mockTestId }
    });

    if (!test) {
      throw new Error("Mock test not found");
    }

    // Validate options
    if (!Array.isArray(data.options) || data.options.length !== 5) {
      throw new Error("Must provide exactly 5 options (A-E)");
    }

    // Validate correct answer
    const validAnswers = ["A", "B", "C", "D", "E"];
    if (!validAnswers.includes(data.correctAnswer)) {
      throw new Error("Correct answer must be A, B, C, D, or E");
    }

    // Check if position already exists
    const existingQuestion = await this.prisma.mockTestQuestion.findUnique({
      where: {
        mockTestId_position: {
          mockTestId: data.mockTestId,
          position: data.position
        }
      }
    });

    if (existingQuestion) {
      throw new Error(`Question at position ${data.position} already exists`);
    }

    return this.prisma.mockTestQuestion.create({
      data: {
        mockTestId: data.mockTestId,
        questionText: data.questionText,
        options: data.options,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation || null,
        difficulty: data.difficulty || 1,
        position: data.position,
        isImageBased: data.isImageBased || false,
        imageUrl: data.imageUrl || null
      }
    });
  }

  /**
   * Update a question
   */
  async updateQuestion(
    questionId: string,
    data: {
      questionText?: string;
      options?: string[];
      correctAnswer?: string;
      explanation?: string;
      difficulty?: number;
      isImageBased?: boolean;
      imageUrl?: string;
    }
  ) {
    // Validate options if provided
    if (data.options && data.options.length !== 5) {
      throw new Error("Must provide exactly 5 options (A-E)");
    }

    // Validate correct answer if provided
    if (data.correctAnswer) {
      const validAnswers = ["A", "B", "C", "D", "E"];
      if (!validAnswers.includes(data.correctAnswer)) {
        throw new Error("Correct answer must be A, B, C, D, or E");
      }
    }

    return this.prisma.mockTestQuestion.update({
      where: { id: questionId },
      data
    });
  }

  /**
   * Delete a question
   */
  async deleteQuestion(questionId: string) {
    const question = await this.prisma.mockTestQuestion.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      throw new Error("Question not found");
    }

    // Delete the question
    await this.prisma.mockTestQuestion.delete({
      where: { id: questionId }
    });

    // Reorder remaining questions
    const remainingQuestions = await this.prisma.mockTestQuestion.findMany({
      where: { mockTestId: question.mockTestId },
      orderBy: { position: "asc" }
    });

    for (let i = 0; i < remainingQuestions.length; i++) {
      const q = remainingQuestions[i];
      if (q) {
        await this.prisma.mockTestQuestion.update({
          where: { id: q.id },
          data: { position: i + 1 }
        });
      }
    }
  }

  /**
   * Reorder questions
   */
  async reorderQuestions(
    mockTestId: string,
    questionIds: string[]
  ) {
    // Verify all questions belong to the test
    const questions = await this.prisma.mockTestQuestion.findMany({
      where: { mockTestId }
    });

    const questionIdSet = new Set(questions.map((q) => q.id));
    for (const id of questionIds) {
      if (!questionIdSet.has(id)) {
        throw new Error(`Question ${id} does not belong to this test`);
      }
    }

    // Update positions
    for (let i = 0; i < questionIds.length; i++) {
      const qId = questionIds[i];
      if (qId) {
        await this.prisma.mockTestQuestion.update({
          where: { id: qId },
          data: { position: i + 1 }
        });
      }
    }

    return this.prisma.mockTestQuestion.findMany({
      where: { mockTestId },
      orderBy: { position: "asc" }
    });
  }

  /**
   * Get questions for a test
   */
  async getQuestions(mockTestId: string, limit?: number) {
    const query = this.prisma.mockTestQuestion.findMany({
      where: { mockTestId },
      orderBy: { position: "asc" }
    });

    if (limit) {
      return query.then((questions) => questions.slice(0, limit));
    }

    return query;
  }

  /**
   * Get a single question
   */
  async getQuestion(questionId: string) {
    return this.prisma.mockTestQuestion.findUnique({
      where: { id: questionId }
    });
  }
}

export function createMockTestQuestionService(
  prisma: PrismaClient,
  fastify: FastifyInstance
): MockTestQuestionService {
  return new MockTestQuestionService(prisma, fastify);
}
