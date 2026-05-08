import type { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";

export class SubjectService {
  constructor(
    private prisma: PrismaClient,
    private fastify: FastifyInstance
  ) {}

  /**
   * Create a new subject
   */
  async createSubject(data: {
    name: string;
    position: string;
    description?: string;
  }) {
    // Check if subject already exists for this position
    const existing = await this.prisma.subject.findUnique({
      where: {
        name_position: {
          name: data.name,
          position: data.position
        }
      }
    });

    if (existing) {
      throw new Error(`Subject "${data.name}" already exists for ${data.position}`);
    }

    return this.prisma.subject.create({
      data: {
        name: data.name,
        position: data.position,
        description: data.description || null
      }
    });
  }

  /**
   * Get subject by ID
   */
  async getSubjectById(subjectId: string) {
    return this.prisma.subject.findUnique({
      where: { id: subjectId }
    });
  }

  /**
   * List subjects by position
   */
  async listSubjectsByPosition(position: string) {
    return this.prisma.subject.findMany({
      where: { position },
      include: {
        _count: {
          select: { mockTests: true }
        }
      },
      orderBy: { name: "asc" }
    });
  }

  /**
   * List all subjects
   */
  async listAllSubjects() {
    return this.prisma.subject.findMany({
      include: {
        _count: {
          select: { mockTests: true }
        }
      },
      orderBy: [{ position: "asc" }, { name: "asc" }]
    });
  }

  /**
   * Update subject
   */
  async updateSubject(
    subjectId: string,
    data: {
      name?: string;
      description?: string;
    }
  ) {
    return this.prisma.subject.update({
      where: { id: subjectId },
      data
    });
  }

  /**
   * Delete subject
   */
  async deleteSubject(subjectId: string) {
    // Check if subject has tests
    const testCount = await this.prisma.mockTest.count({
      where: { subjectId }
    });

    if (testCount > 0) {
      throw new Error("Cannot delete subject with existing tests");
    }

    return this.prisma.subject.delete({
      where: { id: subjectId }
    });
  }

  /**
   * Get subject with tests and analytics
   */
  async getSubjectWithAnalytics(subjectId: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        mockTests: {
          include: {
            _count: {
              select: { attempts: true }
            }
          }
        }
      }
    });

    if (!subject) {
      throw new Error("Subject not found");
    }

    // Calculate analytics
    const totalTests = subject.mockTests.length;
    const totalAttempts = subject.mockTests.reduce((sum, test) => sum + test._count.attempts, 0);

    return {
      ...subject,
      totalTests,
      totalAttempts
    };
  }
}

export function createSubjectService(
  prisma: PrismaClient,
  fastify: FastifyInstance
): SubjectService {
  return new SubjectService(prisma, fastify);
}
