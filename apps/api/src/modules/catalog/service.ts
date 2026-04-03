import type { FastifyBaseLogger } from "fastify";

import type {
  CourseDetail,
  CourseLessonsResponse,
  InstructorProfile,
  LessonDetail,
  ModuleDetail
} from "@colonels-academy/contracts";
import { courseCatalog, instructors } from "@colonels-academy/contracts";
import type { DatabaseClient } from "@colonels-academy/database";

async function loadCourseRecords(prisma: DatabaseClient) {
  return prisma.course.findMany({
    include: {
      instructorLinks: {
        include: {
          instructor: true
        },
        orderBy: {
          displayOrder: "asc"
        }
      }
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }]
  });
}

type CourseRecord = Awaited<ReturnType<typeof loadCourseRecords>>[number];

async function loadInstructorRecords(prisma: DatabaseClient) {
  return prisma.instructor.findMany({
    orderBy: {
      name: "asc"
    }
  });
}

type InstructorRecord = Awaited<ReturnType<typeof loadInstructorRecords>>[number];

function mapCourseRecord(record: CourseRecord): CourseDetail {
  const fallback = courseCatalog.find((course) => course.slug === record.slug);

  return {
    slug: record.slug,
    title: record.title,
    track: (record.track as CourseDetail["track"]) ?? "army",
    summary: record.summary,
    description: record.description,
    level: record.level,
    durationLabel: record.durationLabel,
    lessonCount: record.lessonCount,
    priceNpr: record.priceNpr,
    accentColor: record.accentColor,
    featured: record.isFeatured,
    format: fallback?.format ?? "cohort",
    liveSupport: fallback?.liveSupport ?? "Scheduled instructor support.",
    instructorSlugs: record.instructorLinks.map(
      (link: { instructor: { slug: string } }) => link.instructor.slug
    ),
    outcomeBullets: fallback?.outcomeBullets ?? [],
    syllabus: fallback?.syllabus ?? [],
    ...(record.originalPriceNpr !== null ? { originalPriceNpr: record.originalPriceNpr } : {}),
    ...(record.heroImageUrl ? { heroImageUrl: record.heroImageUrl } : {})
  };
}

function mapInstructorRecord(record: InstructorRecord): InstructorProfile {
  return {
    slug: record.slug,
    name: record.name,
    branch: record.branch,
    experience: record.experienceLabel,
    specialization: record.specialization,
    bio: record.bio,
    ...(record.avatarUrl ? { avatarUrl: record.avatarUrl } : {})
  };
}

export async function listCourses(
  prisma: DatabaseClient,
  log: FastifyBaseLogger
): Promise<CourseDetail[]> {
  try {
    const records = await loadCourseRecords(prisma);

    if (records.length === 0) {
      return courseCatalog;
    }

    return records.map(mapCourseRecord);
  } catch (error) {
    log.error(
      { err: error },
      "catalog.listCourses: database query failed, serving contract fallback"
    );
    return courseCatalog;
  }
}

export async function getCourseBySlug(
  prisma: DatabaseClient,
  log: FastifyBaseLogger,
  slug: string
): Promise<CourseDetail | null> {
  const fallback = courseCatalog.find((course) => course.slug === slug) ?? null;

  try {
    const record = await prisma.course.findUnique({
      where: { slug },
      include: {
        instructorLinks: {
          include: {
            instructor: true
          },
          orderBy: {
            displayOrder: "asc"
          }
        }
      }
    });

    return record ? mapCourseRecord(record) : fallback;
  } catch (error) {
    log.error(
      { err: error, slug },
      "catalog.getCourseBySlug: database query failed, serving contract fallback"
    );
    return fallback;
  }
}

export async function listInstructors(
  prisma: DatabaseClient,
  log: FastifyBaseLogger
): Promise<InstructorProfile[]> {
  try {
    const records = await loadInstructorRecords(prisma);

    if (records.length === 0) {
      return instructors;
    }

    return records.map(mapInstructorRecord);
  } catch (error) {
    log.error(
      { err: error },
      "catalog.listInstructors: database query failed, serving contract fallback"
    );
    return instructors;
  }
}

export async function getCourseLessons(
  prisma: DatabaseClient,
  log: FastifyBaseLogger,
  courseSlug: string,
  userId?: string,
  userRole?: string
): Promise<CourseLessonsResponse | null> {
  try {
    const course = await prisma.course.findUnique({
      where: { slug: courseSlug },
      select: { id: true, slug: true }
    });

    if (!course) return null;

    // Fetch modules and lessons
    const modules = await prisma.module.findMany({
      where: { courseId: course.id },
      orderBy: { position: "asc" },
      include: {
        lessons: {
          orderBy: { position: "asc" },
          include: {
            prerequisite: { select: { title: true } }
          }
        }
      }
    });

    const unorganisedLessons = await prisma.lesson.findMany({
      where: { courseId: course.id, moduleId: null },
      orderBy: { position: "asc" },
      include: {
        prerequisite: { select: { title: true } }
      }
    });

    // Fetch user context if provided
    let userProgress: Record<string, "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"> = {};
    let isEnrolled = false;

    if (userId) {
      const [enrollment, progressRecords] = await Promise.all([
        prisma.enrollment.findUnique({
          where: { userId_courseId: { userId, courseId: course.id } }
        }),
        prisma.userProgress.findMany({
          where: { userId, courseId: course.id }
        })
      ]);

      isEnrolled = enrollment?.status === "ACTIVE";
      progressRecords.forEach((pr) => {
        userProgress[pr.lessonId] = pr.status as any;
      });
    }

    const isAdminOrDs = userRole?.toLowerCase() === "admin" || userRole?.toLowerCase() === "ds";

    const mapLesson = (l: any): LessonDetail => {
      const status = userProgress[l.id] ?? "NOT_STARTED";
      let isLocked = false;
      let unlockRequirement: string | undefined;

      if (!isAdminOrDs) {
        if (!isEnrolled && l.accessKind !== "PREVIEW") {
          isLocked = true;
          unlockRequirement = "Enroll in this course to access this lesson.";
        } else if (l.prerequisiteId && userProgress[l.prerequisiteId] !== "COMPLETED") {
          isLocked = true;
          const prereqTitle = l.prerequisite?.title ?? "the previous lesson";
          unlockRequirement = `Complete '${prereqTitle}' first`;
        }
      }

      return {
        id: l.id,
        courseId: l.courseId,
        moduleId: l.moduleId ?? undefined,
        title: l.title,
        synopsis: l.synopsis,
        position: l.position,
        durationMinutes: l.durationMinutes ?? undefined,
        contentType: l.contentType as any,
        accessKind: l.accessKind as any,
        bunnyVideoId: l.bunnyVideoId ?? undefined,
        meetingUrl: l.meetingUrl ?? undefined,
        pdfUrl: l.pdfUrl ?? undefined,
        prerequisiteId: l.prerequisiteId ?? undefined,
        isLocked,
        unlockRequirement,
        progressStatus: status
      };
    };

    return {
      courseSlug: course.slug,
      modules: modules.map((m) => ({
        id: m.id,
        courseId: m.courseId,
        title: m.title,
        position: m.position,
        lessons: m.lessons.map(mapLesson)
      })),
      unorganisedLessons: unorganisedLessons.map(mapLesson)
    };
  } catch (error) {
    log.error({ err: error, courseSlug }, "catalog.getCourseLessons: failed");
    return null;
  }
}
