import type { Prisma } from "@prisma/client";
import type {
  LessonSubmissionDetail,
  SubmissionRubricScore,
  SubmissionStatus,
  SubmissionType,
  SubjectArea
} from "@colonels-academy/contracts";
import type { DatabaseClient } from "@colonels-academy/database";

import { assertLessonAccess } from "./access-guard";

export class LessonSubmissionError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "LessonSubmissionError";
    this.statusCode = statusCode;
  }
}

type AuthContext = {
  userId: string;
  userRole?: string;
};

type CreateLessonSubmissionInput = {
  fastify: {
    prisma: DatabaseClient;
    httpErrors: {
      forbidden: (message: string) => Error;
    };
  };
  auth: AuthContext;
  courseSlug: string;
  lessonId?: string;
  phaseNumber?: number;
  subjectArea?: SubjectArea;
  submissionType: SubmissionType;
  title: string;
  body?: string;
  assetUrl?: string;
};

type ReviewLessonSubmissionInput = {
  prisma: DatabaseClient;
  reviewerId: string;
  submissionId: string;
  status: Extract<SubmissionStatus, "REVIEWED" | "REVISION_REQUESTED">;
  score?: number;
  maxScore?: number;
  reviewNotes?: string;
  rubricScores?: SubmissionRubricScore[];
};

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
    throw new LessonSubmissionError("You are not enrolled in this course.", 403);
  }
}

function parseRubricScores(rubricScores: unknown): SubmissionRubricScore[] {
  if (!Array.isArray(rubricScores)) {
    return [];
  }

  return rubricScores.flatMap((entry) => {
    if (!entry || typeof entry !== "object") {
      return [];
    }

    const candidate = entry as {
      criterion?: unknown;
      score?: unknown;
      maxScore?: unknown;
    };

    if (
      typeof candidate.criterion !== "string" ||
      typeof candidate.score !== "number" ||
      typeof candidate.maxScore !== "number"
    ) {
      return [];
    }

    return [
      {
        criterion: candidate.criterion,
        score: candidate.score,
        maxScore: candidate.maxScore
      }
    ];
  });
}

function mapSubmissionDetail(submission: {
  id: string;
  courseId: string;
  lessonId: string | null;
  phaseNumber: number | null;
  subjectArea: string | null;
  submissionType: string;
  title: string;
  body: string | null;
  assetUrl: string | null;
  status: string;
  score: number | null;
  maxScore: number | null;
  reviewNotes: string | null;
  submittedAt: Date;
  reviewedAt: Date | null;
  reviewedByUserId: string | null;
  rubricScores: unknown;
  course: {
    slug: string;
  };
}): LessonSubmissionDetail {
  const rubricScores = parseRubricScores(submission.rubricScores);

  return {
    id: submission.id,
    courseId: submission.courseId,
    courseSlug: submission.course.slug,
    title: submission.title,
    submissionType: submission.submissionType as SubmissionType,
    status: submission.status as SubmissionStatus,
    submittedAt: submission.submittedAt.toISOString(),
    ...(submission.lessonId ? { lessonId: submission.lessonId } : {}),
    ...(submission.phaseNumber ? { phaseNumber: submission.phaseNumber } : {}),
    ...(submission.subjectArea ? { subjectArea: submission.subjectArea as SubjectArea } : {}),
    ...(submission.body ? { body: submission.body } : {}),
    ...(submission.assetUrl ? { assetUrl: submission.assetUrl } : {}),
    ...(submission.score !== null ? { score: submission.score } : {}),
    ...(submission.maxScore !== null ? { maxScore: submission.maxScore } : {}),
    ...(submission.reviewNotes ? { reviewNotes: submission.reviewNotes } : {}),
    ...(submission.reviewedAt ? { reviewedAt: submission.reviewedAt.toISOString() } : {}),
    ...(submission.reviewedByUserId ? { reviewedByUserId: submission.reviewedByUserId } : {}),
    ...(rubricScores.length > 0 ? { rubricScores } : {})
  };
}

export async function createLessonSubmission(
  input: CreateLessonSubmissionInput
): Promise<LessonSubmissionDetail> {
  const { fastify, auth } = input;

  const course = await fastify.prisma.course.findUnique({
    where: { slug: input.courseSlug },
    select: { id: true, slug: true }
  });

  if (!course) {
    throw new LessonSubmissionError("Course not found.", 404);
  }

  let resolvedLessonId: string | undefined;
  let resolvedPhaseNumber = input.phaseNumber;
  let resolvedSubjectArea = input.subjectArea;

  if (input.lessonId) {
    const lesson = await fastify.prisma.lesson.findUnique({
      where: { id: input.lessonId },
      select: {
        id: true,
        courseId: true,
        phaseNumber: true,
        subjectArea: true,
        prerequisiteId: true,
        title: true,
        prerequisite: { select: { title: true } }
      }
    });

    if (!lesson || lesson.courseId !== course.id) {
      throw new LessonSubmissionError("Lesson not found for this course.", 404);
    }

    await assertLessonAccess({
      fastify: input.fastify as never,
      userId: auth.userId,
      userRole: auth.userRole,
      courseId: course.id,
      lesson
    });

    resolvedLessonId = lesson.id;
    resolvedPhaseNumber = lesson.phaseNumber ?? resolvedPhaseNumber;
    resolvedSubjectArea = (lesson.subjectArea as SubjectArea | null) ?? resolvedSubjectArea;
  } else {
    await assertCourseEnrollment(fastify.prisma, auth.userId, auth.userRole, course.id);
  }

  if (!resolvedLessonId && !resolvedPhaseNumber && !resolvedSubjectArea) {
    throw new LessonSubmissionError(
      "Provide a lesson, phase, or subject area so the submission can be classified.",
      400
    );
  }

  const submission = await fastify.prisma.lessonSubmission.create({
    data: {
      userId: auth.userId,
      courseId: course.id,
      submissionType: input.submissionType,
      title: input.title.trim(),
      ...(resolvedLessonId ? { lessonId: resolvedLessonId } : {}),
      ...(resolvedPhaseNumber ? { phaseNumber: resolvedPhaseNumber } : {}),
      ...(resolvedSubjectArea ? { subjectArea: resolvedSubjectArea } : {}),
      ...(input.body?.trim() ? { body: input.body.trim() } : {}),
      ...(input.assetUrl?.trim() ? { assetUrl: input.assetUrl.trim() } : {})
    },
    include: {
      course: {
        select: { slug: true }
      }
    }
  });

  return mapSubmissionDetail(submission);
}

export async function listCourseSubmissions(
  prisma: DatabaseClient,
  userId: string,
  courseSlug: string
): Promise<LessonSubmissionDetail[]> {
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: { id: true }
  });

  if (!course) {
    throw new LessonSubmissionError("Course not found.", 404);
  }

  const submissions = await prisma.lessonSubmission.findMany({
    where: {
      userId,
      courseId: course.id
    },
    orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }],
    include: {
      course: {
        select: { slug: true }
      }
    }
  });

  return submissions.map(mapSubmissionDetail);
}

export async function listPendingSubmissionReviews(prisma: DatabaseClient, courseSlug: string) {
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: { id: true, slug: true, title: true }
  });

  if (!course) {
    throw new LessonSubmissionError("Course not found.", 404);
  }

  const items = await prisma.lessonSubmission.findMany({
    where: {
      courseId: course.id,
      status: {
        in: ["SUBMITTED", "REVISION_REQUESTED"]
      }
    },
    orderBy: [{ submittedAt: "asc" }],
    select: {
      id: true,
      submittedAt: true,
      title: true,
      submissionType: true,
      phaseNumber: true,
      subjectArea: true,
      assetUrl: true,
      user: {
        select: {
          id: true,
          email: true,
          displayName: true
        }
      }
    }
  });

  return {
    course,
    items
  };
}

export async function reviewLessonSubmission(
  input: ReviewLessonSubmissionInput
): Promise<LessonSubmissionDetail> {
  const submission = await input.prisma.lessonSubmission.findUnique({
    where: { id: input.submissionId },
    include: {
      course: {
        select: { slug: true }
      }
    }
  });

  if (!submission) {
    throw new LessonSubmissionError("Submission not found.", 404);
  }

  if ((input.score ?? null) !== null && input.score !== undefined && input.score < 0) {
    throw new LessonSubmissionError("Score must be zero or greater.", 400);
  }

  if ((input.maxScore ?? null) !== null && input.maxScore !== undefined && input.maxScore <= 0) {
    throw new LessonSubmissionError("Max score must be greater than zero.", 400);
  }

  if (input.score !== undefined && input.maxScore !== undefined && input.score > input.maxScore) {
    throw new LessonSubmissionError("Score cannot exceed max score.", 400);
  }

  const updated = await input.prisma.lessonSubmission.update({
    where: { id: submission.id },
    data: {
      status: input.status,
      reviewedAt: new Date(),
      reviewedByUserId: input.reviewerId,
      ...(input.score !== undefined ? { score: input.score } : {}),
      ...(input.maxScore !== undefined ? { maxScore: input.maxScore } : {}),
      ...(input.reviewNotes?.trim() ? { reviewNotes: input.reviewNotes.trim() } : {}),
      ...(input.rubricScores?.length
        ? { rubricScores: input.rubricScores as unknown as Prisma.InputJsonValue }
        : {})
    },
    include: {
      course: {
        select: { slug: true }
      }
    }
  });

  return mapSubmissionDetail({
    ...updated,
    course: {
      slug: updated.course.slug
    }
  });
}
