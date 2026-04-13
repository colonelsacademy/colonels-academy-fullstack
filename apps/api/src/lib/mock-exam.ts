import type { SubjectArea } from "@colonels-academy/contracts";
import type { DatabaseClient } from "@colonels-academy/database";

type MockExamAttemptSnapshot = {
  questionId: string;
  isCorrect: boolean;
  attemptedAt: Date;
  difficultySnapshot: number;
  lesson: {
    title: string;
    subjectArea: SubjectArea | null;
    componentCode: string | null;
    componentLabel: string | null;
  };
};

export type MockExamAttemptContext = {
  sessionId: string | null;
  source: "session" | "attempts";
  totalQuestions: number;
  attemptedQuestions: number;
  attempts: MockExamAttemptSnapshot[];
};

function isMockExamLessonTitle(title: string) {
  return title.toLowerCase().includes("mock exam");
}

export async function listPhaseMockExamLessonIds(
  prisma: DatabaseClient,
  courseId: string,
  phaseNumber: number
) {
  const lessons = await prisma.lesson.findMany({
    where: {
      courseId,
      phaseNumber,
      contentType: "QUIZ"
    },
    select: {
      id: true,
      title: true,
      durationMinutes: true
    }
  });

  return lessons.filter((lesson) => isMockExamLessonTitle(lesson.title)).map((lesson) => lesson.id);
}

export async function findOrCreateMockExamSession(input: {
  prisma: DatabaseClient;
  userId: string;
  courseId: string;
  phaseNumber: number;
  requestedSessionId?: string | null;
}) {
  const { prisma, userId, courseId, phaseNumber, requestedSessionId } = input;

  if (requestedSessionId) {
    const existingSession = await prisma.quizSession.findFirst({
      where: {
        id: requestedSessionId,
        userId,
        courseId,
        kind: "MOCK_EXAM",
        finishedAt: null
      },
      select: { id: true }
    });

    if (existingSession) {
      return existingSession.id;
    }
  }

  const openSession = await prisma.quizSession.findFirst({
    where: {
      userId,
      courseId,
      kind: "MOCK_EXAM",
      finishedAt: null,
      attempts: {
        some: {
          lesson: {
            phaseNumber
          }
        }
      }
    },
    orderBy: [{ startedAt: "desc" }],
    select: { id: true }
  });

  if (openSession) {
    return openSession.id;
  }

  const createdSession = await prisma.quizSession.create({
    data: {
      userId,
      courseId,
      kind: "MOCK_EXAM"
    },
    select: { id: true }
  });

  return createdSession.id;
}

export async function finalizeMockExamSessionIfComplete(input: {
  prisma: DatabaseClient;
  sessionId: string;
  courseId: string;
  phaseNumber: number;
}) {
  const { prisma, sessionId, courseId, phaseNumber } = input;
  const lessonIds = await listPhaseMockExamLessonIds(prisma, courseId, phaseNumber);

  if (lessonIds.length === 0) {
    return { finished: false, totalQuestions: 0, attemptedQuestions: 0 };
  }

  const [totalQuestions, attempts] = await Promise.all([
    prisma.quizQuestion.count({
      where: {
        lessonId: { in: lessonIds }
      }
    }),
    prisma.quizAttempt.findMany({
      where: {
        sessionId,
        lessonId: { in: lessonIds }
      },
      select: {
        questionId: true,
        attemptedAt: true
      },
      orderBy: {
        attemptedAt: "desc"
      }
    })
  ]);

  const attemptedQuestions = new Set(attempts.map((attempt) => attempt.questionId)).size;

  if (totalQuestions > 0 && attemptedQuestions >= totalQuestions) {
    await prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        finishedAt: new Date()
      }
    });

    return { finished: true, totalQuestions, attemptedQuestions };
  }

  return { finished: false, totalQuestions, attemptedQuestions };
}

export async function getMockExamAttemptContext(input: {
  prisma: DatabaseClient;
  userId: string;
  courseId: string;
  phaseNumber: number;
}): Promise<MockExamAttemptContext | null> {
  const { prisma, userId, courseId, phaseNumber } = input;
  const lessonIds = await listPhaseMockExamLessonIds(prisma, courseId, phaseNumber);

  if (lessonIds.length === 0) {
    return null;
  }

  const totalQuestions = await prisma.quizQuestion.count({
    where: {
      lessonId: { in: lessonIds }
    }
  });

  const session = await prisma.quizSession.findFirst({
    where: {
      userId,
      courseId,
      kind: "MOCK_EXAM",
      finishedAt: { not: null },
      attempts: {
        some: {
          lessonId: { in: lessonIds }
        }
      }
    },
    orderBy: [{ finishedAt: "desc" }, { startedAt: "desc" }],
    select: {
      id: true,
      attempts: {
        where: {
          lessonId: { in: lessonIds }
        },
        select: {
          questionId: true,
          isCorrect: true,
          attemptedAt: true,
          difficultySnapshot: true,
          lesson: {
            select: {
              title: true,
              subjectArea: true,
              componentCode: true,
              componentLabel: true
            }
          }
        },
        orderBy: {
          attemptedAt: "desc"
        }
      }
    }
  });

  const rawAttempts = session
    ? session.attempts
    : await prisma.quizAttempt.findMany({
        where: {
          userId,
          courseId,
          lessonId: { in: lessonIds }
        },
        select: {
          questionId: true,
          isCorrect: true,
          attemptedAt: true,
          difficultySnapshot: true,
          lesson: {
            select: {
              title: true,
              subjectArea: true,
              componentCode: true,
              componentLabel: true
            }
          }
        },
        orderBy: {
          attemptedAt: "desc"
        }
      });

  const latestAttemptByQuestion = new Map<string, MockExamAttemptSnapshot>();

  for (const attempt of rawAttempts) {
    if (!latestAttemptByQuestion.has(attempt.questionId)) {
      latestAttemptByQuestion.set(attempt.questionId, attempt);
    }
  }

  return {
    sessionId: session?.id ?? null,
    source: session ? "session" : "attempts",
    totalQuestions,
    attemptedQuestions: latestAttemptByQuestion.size,
    attempts: Array.from(latestAttemptByQuestion.values())
  };
}
