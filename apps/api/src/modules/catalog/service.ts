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
  lessonContentSchema,
  resolveAssessmentComponent
} from "@colonels-academy/contracts";
import type { DatabaseClient } from "@colonels-academy/database";

import { CacheKeys, CacheTTL } from "../../lib/cache";
import type { CacheManager } from "../../lib/cache";
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

function parseLessonContent(value: unknown): LessonDetail["lessonContent"] {
  const parsed = lessonContentSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

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
    isComingSoon: record.isComingSoon,
    format: fallback?.format ?? "cohort",
    liveSupport: fallback?.liveSupport ?? "Scheduled instructor support.",
    instructorSlugs: record.instructorLinks.map(
      (link: { instructor: { slug: string } }) => link.instructor.slug
    ),
    outcomeBullets: fallback?.outcomeBullets ?? [],
    syllabus: fallback?.syllabus ?? [],
    ...(record.originalPriceNpr !== null ? { originalPriceNpr: record.originalPriceNpr } : {}),
    heroImageUrl: record.heroImageUrl ? getAssetUrl(record.heroImageUrl) : undefined
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
  cache: CacheManager,
  log: FastifyBaseLogger
): Promise<CourseDetail[]> {
  const cacheKey = CacheKeys.courseList();

  // ✅ OPTIMIZED: Try cache first
  const cached = await cache.get<CourseDetail[]>(cacheKey);
  if (cached) {
    log.debug("Serving course list from cache");
    return cached;
  }

  try {
    const records = await loadCourseRecords(prisma);

    if (records.length === 0) {
      return courseCatalog;
    }

    const courses = records.map(mapCourseRecord);

    // Cache for 5 minutes
    await cache.set(cacheKey, courses, CacheTTL.COURSE_LIST);
    log.debug("Course list cached");

    return courses;
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
  cache: CacheManager,
  log: FastifyBaseLogger,
  slug: string
): Promise<CourseDetail | null> {
  const fallback = courseCatalog.find((course) => course.slug === slug) ?? null;
  const cacheKey = CacheKeys.course(slug);

  // ✅ OPTIMIZED: Try cache first
  const cached = await cache.get<CourseDetail>(cacheKey);
  if (cached) {
    log.debug({ slug }, "Serving course from cache");
    return cached;
  }

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

    const course = record ? mapCourseRecord(record) : fallback;

    // Cache for 5 minutes
    if (course) {
      await cache.set(cacheKey, course, CacheTTL.COURSE);
      log.debug({ slug }, "Course cached");
    }

    return course;
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
  cache: CacheManager,
  log: FastifyBaseLogger
): Promise<InstructorProfile[]> {
  const cacheKey = CacheKeys.instructorList();

  // ✅ OPTIMIZED: Try cache first
  const cached = await cache.get<InstructorProfile[]>(cacheKey);
  if (cached) {
    log.debug("Serving instructor list from cache");
    return cached;
  }

  try {
    const records = await loadInstructorRecords(prisma);

    if (records.length === 0) {
      return instructors;
    }

    const instructorList = records.map(mapInstructorRecord);

    // Cache for 10 minutes
    await cache.set(cacheKey, instructorList, CacheTTL.INSTRUCTOR_LIST);
    log.debug("Instructor list cached");

    return instructorList;
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

    log.info({ courseId: course.id, courseSlug: course.slug }, "Fetching lessons for course");

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
            prerequisite: { select: { title: true } },
            quizQuestions: {
              orderBy: { position: "asc" },
              select: {
                id: true,
                question: true,
                options: true,
                explanation: true,
                position: true
              }
            }
          }
        }
      }
    });

    log.info({ moduleCount: modules.length, courseId: course.id }, "Fetched modules");

    const unorganisedLessons = await prisma.lesson.findMany({
      where: { courseId: course.id, moduleId: null },
      orderBy: { position: "asc" },
      include: {
        prerequisite: { select: { title: true } },
        quizQuestions: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            question: true,
            options: true,
            explanation: true,
            position: true
          }
        }
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
      learningMode?: string | null;
      accessKind: string;
      bunnyVideoId?: string | null;
      meetingUrl?: string | null;
      pdfUrl?: string | null;
      lessonContent?: unknown;
      quizQuestions?: Array<{
        id: string;
        question: string;
        options: unknown;
        explanation?: string | null;
        position: number;
      }>;
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
      if (l.learningMode)
        lesson.learningMode = l.learningMode as NonNullable<LessonDetail["learningMode"]>;
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
      if (l.lessonContent) {
        const lessonContent = parseLessonContent(l.lessonContent);
        if (lessonContent) lesson.lessonContent = lessonContent;
      }
      if (l.quizQuestions?.length) {
        lesson.quizQuestions = l.quizQuestions.map((question) => ({
          id: question.id,
          question: question.question,
          options: Array.isArray(question.options)
            ? question.options.filter(
                (option): option is { text: string } =>
                  typeof option === "object" &&
                  option !== null &&
                  "text" in option &&
                  typeof (option as { text?: unknown }).text === "string"
              )
            : [],
          ...(question.explanation ? { explanation: question.explanation } : {}),
          position: question.position
        }));
      }
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
