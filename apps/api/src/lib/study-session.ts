import type { StudySessionDetail, StudySessionSource } from "@colonels-academy/contracts";
import type { DatabaseClient } from "@colonels-academy/database";

import { assertLessonAccess } from "./access-guard";

export class StudySessionError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "StudySessionError";
    this.statusCode = statusCode;
  }
}

type AuthContext = {
  userId: string;
  userRole?: string;
};

type StartStudySessionInput = {
  fastify: {
    prisma: DatabaseClient;
    httpErrors: {
      forbidden: (message: string) => Error;
    };
  };
  auth: AuthContext;
  courseSlug: string;
  lessonId?: string;
  source: StudySessionSource;
  deviceSessionId?: string;
};

type UpdateStudySessionInput = {
  prisma: DatabaseClient;
  userId: string;
  sessionId: string;
  deviceSessionId?: string;
  action: "heartbeat" | "end";
};

function minutesBetween(startedAt: Date, endedAt?: Date | null) {
  const end = endedAt ?? new Date();
  const diffMs = Math.max(0, end.getTime() - startedAt.getTime());

  return Math.max(0, Math.round(diffMs / 60_000));
}

function mapStudySession(session: {
  id: string;
  courseId: string;
  lessonId: string | null;
  source: string;
  deviceSessionId: string | null;
  startedAt: Date;
  heartbeatAt: Date | null;
  endedAt: Date | null;
  course: {
    slug: string;
  };
}): StudySessionDetail {
  return {
    id: session.id,
    courseId: session.courseId,
    courseSlug: session.course.slug,
    source: session.source as StudySessionSource,
    startedAt: session.startedAt.toISOString(),
    active: session.endedAt === null,
    elapsedMinutes: minutesBetween(session.startedAt, session.endedAt),
    ...(session.lessonId ? { lessonId: session.lessonId } : {}),
    ...(session.deviceSessionId ? { deviceSessionId: session.deviceSessionId } : {}),
    ...(session.heartbeatAt ? { heartbeatAt: session.heartbeatAt.toISOString() } : {}),
    ...(session.endedAt ? { endedAt: session.endedAt.toISOString() } : {})
  };
}

async function assertCourseEnrollment(
  prisma: DatabaseClient,
  userId: string,
  userRole: string | undefined,
  courseId: string
) {
  const normalizedRole = userRole?.toLowerCase();
  if (normalizedRole === "admin" || normalizedRole === "ds") {
    return;
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId
      }
    },
    select: { status: true }
  });

  if (!enrollment || enrollment.status !== "ACTIVE") {
    throw new StudySessionError("You are not enrolled in this course.", 403);
  }
}

export async function startStudySession(
  input: StartStudySessionInput
): Promise<StudySessionDetail> {
  const { fastify, auth, courseSlug, lessonId, source, deviceSessionId } = input;

  const course = await fastify.prisma.course.findUnique({
    where: { slug: courseSlug },
    select: { id: true, slug: true }
  });

  if (!course) {
    throw new StudySessionError("Course not found.", 404);
  }

  let resolvedLessonId: string | undefined;

  if (lessonId) {
    const lesson = await fastify.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        courseId: true,
        phaseNumber: true,
        prerequisiteId: true,
        title: true,
        prerequisite: { select: { title: true } }
      }
    });

    if (!lesson || lesson.courseId !== course.id) {
      throw new StudySessionError("Lesson not found for this course.", 404);
    }

    await assertLessonAccess({
      fastify: input.fastify as never,
      userId: auth.userId,
      userRole: auth.userRole,
      courseId: course.id,
      lesson
    });

    resolvedLessonId = lesson.id;
  } else {
    await assertCourseEnrollment(fastify.prisma, auth.userId, auth.userRole, course.id);
  }

  const now = new Date();

  const dedupeWhere = {
    userId: auth.userId,
    courseId: course.id,
    endedAt: null,
    ...(deviceSessionId
      ? { deviceSessionId }
      : resolvedLessonId
        ? { lessonId: resolvedLessonId }
        : {})
  };

  await fastify.prisma.studySession.updateMany({
    where: dedupeWhere,
    data: {
      endedAt: now,
      heartbeatAt: now
    }
  });

  const session = await fastify.prisma.studySession.create({
    data: {
      userId: auth.userId,
      courseId: course.id,
      source,
      startedAt: now,
      heartbeatAt: now,
      ...(resolvedLessonId ? { lessonId: resolvedLessonId } : {}),
      ...(deviceSessionId ? { deviceSessionId } : {})
    },
    include: {
      course: {
        select: { slug: true }
      }
    }
  });

  return mapStudySession(session);
}

export async function updateStudySession(
  input: UpdateStudySessionInput
): Promise<StudySessionDetail> {
  const { prisma, userId, sessionId, deviceSessionId, action } = input;

  const existing = await prisma.studySession.findFirst({
    where: {
      id: sessionId,
      userId
    },
    include: {
      course: {
        select: { slug: true }
      }
    }
  });

  if (!existing) {
    throw new StudySessionError("Study session not found.", 404);
  }

  if (deviceSessionId && existing.deviceSessionId && existing.deviceSessionId !== deviceSessionId) {
    throw new StudySessionError("Study session does not belong to this device session.", 403);
  }

  if (action === "heartbeat" && existing.endedAt) {
    throw new StudySessionError("This study session has already ended.", 409);
  }

  const now = new Date();

  const updated = await prisma.studySession.update({
    where: { id: existing.id },
    data:
      action === "heartbeat"
        ? {
            heartbeatAt: now
          }
        : {
            heartbeatAt: now,
            endedAt: existing.endedAt ?? now
          },
    include: {
      course: {
        select: { slug: true }
      }
    }
  });

  return mapStudySession(updated);
}
