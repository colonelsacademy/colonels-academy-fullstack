import type { FastifyBaseLogger } from "fastify";

import { getAssetUrl } from "@colonels-academy/config";
import type {
  CourseDetail,
  CourseLessonsResponse,
  InstructorProfile,
  LessonDetail
} from "@colonels-academy/contracts";
import {
  courseCatalog,
  instructors,
  resolveAssessmentComponent
} from "@colonels-academy/contracts";
import type { DatabaseClient } from "@colonels-academy/database";

import { isPhaseUnlocked, resolveCoursePhaseAccess } from "../../lib/course-phase-plan";

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
    heroImageUrl: getAssetUrl(record.heroImageUrl ?? fallback?.heroImageUrl ?? "")
  };
}

function mapInstructorRecord(record: InstructorRecord): InstructorProfile {
  const fallback = instructors.find((i) => i.slug === record.slug);
  return {
    slug: record.slug,
    name: record.name,
    branch: record.branch,
    experience: record.experienceLabel,
    specialization: record.specialization,
    bio: record.bio,
    avatarUrl: getAssetUrl(record.avatarUrl ?? fallback?.avatarUrl ?? "")
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
        // Phase metadata is optional today, but once populated it drives
        // milestone-aware curriculum grouping and lesson gating.
        // Keeping it in the response now avoids a later contract break.
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
    const userProgress: Record<string, "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"> = {};
    let isEnrolled = false;
    const phaseAccess = await resolveCoursePhaseAccess(prisma, log, course.slug, userId, userRole);
    const milestoneTitleByPhase = new Map<number, string>();

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
      for (const pr of progressRecords) {
        userProgress[pr.lessonId] = pr.status as "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
      }
    }

    if (phaseAccess?.courseId) {
      const milestoneRecords = await prisma.phaseMilestone.findMany({
        where: { courseId: phaseAccess.courseId },
        select: { phaseNumber: true, title: true }
      });

      for (const milestone of milestoneRecords) {
        milestoneTitleByPhase.set(milestone.phaseNumber, milestone.title);
      }
    }

    const isAdminOrDs = userRole?.toLowerCase() === "admin" || userRole?.toLowerCase() === "ds";

    const mapLesson = (l: {
      id: string;
      courseId: string;
      moduleId?: string | null;
      phaseNumber?: number | null;
      subjectArea?: string | null;
      componentCode?: string | null;
      componentLabel?: string | null;
      title: string;
      synopsis: string;
      position: number;
      durationMinutes?: number | null;
      contentType: string;
      accessKind: string;
      bunnyVideoId?: string | null;
      meetingUrl?: string | null;
      pdfUrl?: string | null;
      prerequisiteId?: string | null;
      prerequisite?: { title: string } | null;
    }): LessonDetail => {
      const status = userProgress[l.id] ?? "NOT_STARTED";
      let isLocked = false;
      let unlockRequirement: string | undefined;
      const resolvedComponent = resolveAssessmentComponent({
        courseSlug: course.slug,
        subjectArea: (l.subjectArea as LessonDetail["subjectArea"]) ?? undefined,
        title: l.title,
        componentCode: l.componentCode,
        componentLabel: l.componentLabel
      });

      if (!isAdminOrDs) {
        if (!isEnrolled && l.accessKind !== "PREVIEW") {
          isLocked = true;
          unlockRequirement = "Enroll in this course to access this lesson.";
        } else if (l.phaseNumber && phaseAccess && !isPhaseUnlocked(phaseAccess, l.phaseNumber)) {
          isLocked = true;
          const requiredPhaseNumber = l.phaseNumber - 1;
          const milestoneTitle =
            milestoneTitleByPhase.get(requiredPhaseNumber) ??
            `Phase ${requiredPhaseNumber} milestone`;
          unlockRequirement = phaseAccess.pendingPhaseNumbers.has(requiredPhaseNumber)
            ? `Await review for '${milestoneTitle}'`
            : `Complete '${milestoneTitle}' first`;
        } else if (l.prerequisiteId && userProgress[l.prerequisiteId] !== "COMPLETED") {
          isLocked = true;
          const prereqTitle = l.prerequisite?.title ?? "the previous lesson";
          unlockRequirement = `Complete '${prereqTitle}' first`;
        }
      }

      const lesson: LessonDetail = {
        id: l.id,
        courseId: l.courseId,
        title: l.title,
        synopsis: l.synopsis,
        position: l.position,
        contentType: l.contentType as LessonDetail["contentType"],
        accessKind: l.accessKind as LessonDetail["accessKind"],
        isLocked,
        progressStatus: status
      };

      if (l.moduleId) lesson.moduleId = l.moduleId;
      if (l.phaseNumber) lesson.phaseNumber = l.phaseNumber;
      if (l.subjectArea) {
        lesson.subjectArea = l.subjectArea as NonNullable<LessonDetail["subjectArea"]>;
      }
      if (resolvedComponent?.componentCode) lesson.componentCode = resolvedComponent.componentCode;
      if (resolvedComponent?.componentLabel)
        lesson.componentLabel = resolvedComponent.componentLabel;
      if (l.durationMinutes) lesson.durationMinutes = l.durationMinutes;
      if (l.bunnyVideoId) lesson.bunnyVideoId = l.bunnyVideoId;
      if (l.meetingUrl) lesson.meetingUrl = l.meetingUrl;
      if (l.pdfUrl) lesson.pdfUrl = l.pdfUrl;
      if (l.prerequisiteId) lesson.prerequisiteId = l.prerequisiteId;
      if (unlockRequirement) lesson.unlockRequirement = unlockRequirement;

      return lesson;
    };

    return {
      courseSlug: course.slug,
      modules: modules.map((m) => {
        const resolvedComponent = resolveAssessmentComponent({
          courseSlug: course.slug,
          subjectArea: (m.subjectArea as LessonDetail["subjectArea"]) ?? undefined,
          title: m.title,
          componentCode: m.componentCode,
          componentLabel: m.componentLabel
        });

        return {
          id: m.id,
          courseId: m.courseId,
          ...(m.phaseNumber ? { phaseNumber: m.phaseNumber } : {}),
          ...(m.subjectArea
            ? {
                subjectArea: m.subjectArea as NonNullable<LessonDetail["subjectArea"]>
              }
            : {}),
          ...(resolvedComponent?.componentCode
            ? { componentCode: resolvedComponent.componentCode }
            : {}),
          ...(resolvedComponent?.componentLabel
            ? { componentLabel: resolvedComponent.componentLabel }
            : {}),
          title: m.title,
          position: m.position,
          lessons: m.lessons.map(mapLesson)
        };
      }),
      unorganisedLessons: unorganisedLessons.map(mapLesson)
    };
  } catch (error) {
    log.error({ err: error, courseSlug }, "catalog.getCourseLessons: failed");
    return null;
  }
}
