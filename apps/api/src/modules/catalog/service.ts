import type { FastifyBaseLogger } from "fastify";

import type { CourseDetail, InstructorProfile } from "@colonels-academy/contracts";
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
