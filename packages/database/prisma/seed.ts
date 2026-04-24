import { type Prisma, PrismaClient } from "@prisma/client";

import {
  courseCatalog,
  instructors,
  resolveAssessmentComponent,
  staffCollegeCommandAssessmentWeighting,
  staffCollegeCommandPhaseBlueprints,
  upcomingSessions
} from "@colonels-academy/contracts";

import { seedArmyCommandStaff2083 } from "./seeds/army-command-staff-2083-curriculum";
import { buildStaffCollegeCommandCurriculumSeed } from "./staff-college-command-curriculum";

const prisma = new PrismaClient();
const staffCollegeCurriculumSeed = buildStaffCollegeCommandCurriculumSeed();

async function backfillStaffCollegeAssessmentComponents(courseId: string) {
  const [modules, lessons] = await Promise.all([
    prisma.module.findMany({
      where: { courseId },
      select: {
        id: true,
        title: true,
        subjectArea: true,
        componentCode: true,
        componentLabel: true
      }
    }),
    prisma.lesson.findMany({
      where: { courseId },
      select: {
        id: true,
        title: true,
        subjectArea: true,
        componentCode: true,
        componentLabel: true
      }
    })
  ]);

  for (const module of modules) {
    const resolved = resolveAssessmentComponent({
      courseSlug: "staff-college-command",
      subjectArea: module.subjectArea ?? undefined,
      title: module.title,
      componentCode: module.componentCode,
      componentLabel: module.componentLabel
    });

    if (
      resolved &&
      (module.componentCode !== resolved.componentCode ||
        module.componentLabel !== resolved.componentLabel)
    ) {
      await prisma.module.update({
        where: { id: module.id },
        data: {
          componentCode: resolved.componentCode,
          componentLabel: resolved.componentLabel
        }
      });
    }
  }

  for (const lesson of lessons) {
    const resolved = resolveAssessmentComponent({
      courseSlug: "staff-college-command",
      subjectArea: lesson.subjectArea ?? undefined,
      title: lesson.title,
      componentCode: lesson.componentCode,
      componentLabel: lesson.componentLabel
    });

    if (
      resolved &&
      (lesson.componentCode !== resolved.componentCode ||
        lesson.componentLabel !== resolved.componentLabel)
    ) {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          componentCode: resolved.componentCode,
          componentLabel: resolved.componentLabel
        }
      });
    }
  }
}

async function syncStaffCollegeCurriculum(courseId: string) {
  for (const moduleSeed of staffCollegeCurriculumSeed.modules) {
    const moduleRecord = await prisma.module.upsert({
      where: {
        courseId_position: {
          courseId,
          position: moduleSeed.position
        }
      },
      update: {
        phaseNumber: moduleSeed.phaseNumber,
        title: moduleSeed.title,
        ...(moduleSeed.subjectArea
          ? { subjectArea: moduleSeed.subjectArea }
          : { subjectArea: null }),
        ...(moduleSeed.componentCode
          ? { componentCode: moduleSeed.componentCode }
          : { componentCode: null }),
        ...(moduleSeed.componentLabel
          ? { componentLabel: moduleSeed.componentLabel }
          : { componentLabel: null })
      },
      create: {
        courseId,
        position: moduleSeed.position,
        phaseNumber: moduleSeed.phaseNumber,
        title: moduleSeed.title,
        ...(moduleSeed.subjectArea ? { subjectArea: moduleSeed.subjectArea } : {}),
        ...(moduleSeed.componentCode ? { componentCode: moduleSeed.componentCode } : {}),
        ...(moduleSeed.componentLabel ? { componentLabel: moduleSeed.componentLabel } : {})
      },
      select: {
        id: true
      }
    });

    for (const lessonSeed of moduleSeed.lessons) {
      await prisma.lesson.upsert({
        where: {
          courseId_position: {
            courseId,
            position: lessonSeed.position
          }
        },
        update: {
          moduleId: moduleRecord.id,
          phaseNumber: lessonSeed.phaseNumber,
          title: lessonSeed.title,
          synopsis: lessonSeed.synopsis,
          contentType: lessonSeed.contentType,
          learningMode: lessonSeed.learningMode,
          accessKind: lessonSeed.accessKind,
          durationMinutes: lessonSeed.durationMinutes ?? null,
          lessonContent: lessonSeed.lessonContent as unknown as Prisma.InputJsonValue,
          ...(lessonSeed.subjectArea
            ? { subjectArea: lessonSeed.subjectArea }
            : { subjectArea: null }),
          ...(lessonSeed.componentCode
            ? { componentCode: lessonSeed.componentCode }
            : { componentCode: null }),
          ...(lessonSeed.componentLabel
            ? { componentLabel: lessonSeed.componentLabel }
            : { componentLabel: null })
        },
        create: {
          courseId,
          moduleId: moduleRecord.id,
          position: lessonSeed.position,
          phaseNumber: lessonSeed.phaseNumber,
          title: lessonSeed.title,
          synopsis: lessonSeed.synopsis,
          contentType: lessonSeed.contentType,
          learningMode: lessonSeed.learningMode,
          accessKind: lessonSeed.accessKind,
          lessonContent: lessonSeed.lessonContent as unknown as Prisma.InputJsonValue,
          ...(lessonSeed.durationMinutes ? { durationMinutes: lessonSeed.durationMinutes } : {}),
          ...(lessonSeed.subjectArea ? { subjectArea: lessonSeed.subjectArea } : {}),
          ...(lessonSeed.componentCode ? { componentCode: lessonSeed.componentCode } : {}),
          ...(lessonSeed.componentLabel ? { componentLabel: lessonSeed.componentLabel } : {})
        }
      });
    }
  }

  await prisma.lesson.deleteMany({
    where: {
      courseId,
      position: {
        gt: staffCollegeCurriculumSeed.lessonCount
      }
    }
  });

  await prisma.module.deleteMany({
    where: {
      courseId,
      position: {
        gt: staffCollegeCurriculumSeed.modules.length
      }
    }
  });
}

async function main() {
  const instructorIdsBySlug = new Map<string, string>();

  console.log("📚 Starting seed process...");

  for (const instructor of instructors) {
    const record = await prisma.instructor.upsert({
      where: { slug: instructor.slug },
      update: {
        name: instructor.name,
        branch: instructor.branch,
        experienceLabel: instructor.experience,
        specialization: instructor.specialization,
        bio: instructor.bio,
        ...(instructor.avatarUrl ? { avatarUrl: instructor.avatarUrl } : {})
      },
      create: {
        slug: instructor.slug,
        name: instructor.name,
        branch: instructor.branch,
        experienceLabel: instructor.experience,
        specialization: instructor.specialization,
        bio: instructor.bio,
        ...(instructor.avatarUrl ? { avatarUrl: instructor.avatarUrl } : {})
      }
    });

    instructorIdsBySlug.set(instructor.slug, record.id);
  }

  for (const course of courseCatalog) {
    console.log(`  📖 Processing course: ${course.slug}...`);
    const record = await prisma.course.upsert({
      where: { slug: course.slug },
      update: {
        title: course.title,
        track: course.track,
        summary: course.summary,
        description: course.description,
        level: course.level,
        durationLabel: course.durationLabel,
        lessonCount:
          course.slug === "staff-college-command"
            ? staffCollegeCurriculumSeed.lessonCount
            : course.lessonCount,
        priceNpr: course.priceNpr,
        accentColor: course.accentColor,
        isFeatured: course.featured,
        ...(course.slug === "staff-college-command"
          ? {
              assessmentWeighting:
                staffCollegeCommandAssessmentWeighting as unknown as Prisma.InputJsonValue
            }
          : {}),
        ...(course.originalPriceNpr !== undefined
          ? { originalPriceNpr: course.originalPriceNpr }
          : {}),
        ...(course.heroImageUrl ? { heroImageUrl: course.heroImageUrl } : {})
      },
      create: {
        slug: course.slug,
        title: course.title,
        track: course.track,
        summary: course.summary,
        description: course.description,
        level: course.level,
        durationLabel: course.durationLabel,
        lessonCount:
          course.slug === "staff-college-command"
            ? staffCollegeCurriculumSeed.lessonCount
            : course.lessonCount,
        priceNpr: course.priceNpr,
        accentColor: course.accentColor,
        isFeatured: course.featured,
        ...(course.slug === "staff-college-command"
          ? {
              assessmentWeighting:
                staffCollegeCommandAssessmentWeighting as unknown as Prisma.InputJsonValue
            }
          : {}),
        ...(course.originalPriceNpr !== undefined
          ? { originalPriceNpr: course.originalPriceNpr }
          : {}),
        ...(course.heroImageUrl ? { heroImageUrl: course.heroImageUrl } : {})
      }
    });

    await prisma.courseInstructor.deleteMany({
      where: { courseId: record.id }
    });

    await prisma.courseInstructor.createMany({
      data: course.instructorSlugs
        .map((slug, index) => {
          const instructorId = instructorIdsBySlug.get(slug);

          if (!instructorId) {
            return null;
          }

          return {
            courseId: record.id,
            instructorId,
            displayOrder: index
          };
        })
        .filter(
          (value): value is { courseId: string; instructorId: string; displayOrder: number } =>
            Boolean(value)
        )
    });

    if (course.slug === "staff-college-command") {
      await syncStaffCollegeCurriculum(record.id);

      for (const phase of staffCollegeCommandPhaseBlueprints) {
        await prisma.phaseMilestone.upsert({
          where: {
            courseId_phaseNumber: {
              courseId: record.id,
              phaseNumber: phase.phaseNumber
            }
          },
          update: {
            slug: phase.slug,
            title: phase.milestone.title,
            description: phase.milestone.description,
            criteria: phase.milestone.criteria as unknown as Prisma.InputJsonValue
          },
          create: {
            courseId: record.id,
            phaseNumber: phase.phaseNumber,
            slug: phase.slug,
            title: phase.milestone.title,
            description: phase.milestone.description,
            criteria: phase.milestone.criteria as unknown as Prisma.InputJsonValue
          }
        });
      }

      await backfillStaffCollegeAssessmentComponents(record.id);
    }
  }

  // Only reset live sessions when explicitly requested (e.g. CI or local dev reset).
  // Prevents destructive wipe on shared/staging environments during routine seeding.
  if (process.env.SEED_RESET_LIVE_SESSIONS === "true") {
    await prisma.liveSession.deleteMany();
  }

  for (const session of upcomingSessions) {
    const course = await prisma.course.findUnique({
      where: { slug: session.courseSlug },
      select: { id: true }
    });

    if (!course) {
      continue;
    }

    const startsAt = new Date(session.startsAt);
    const endsAt = new Date(session.endsAt);
    const existingSessions = await prisma.liveSession.findMany({
      where: {
        courseId: course.id,
        title: session.title,
        startsAt,
        endsAt,
        deliveryMode: session.deliveryMode
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: { id: true }
    });

    if (existingSessions.length > 0) {
      if (existingSessions.length > 1) {
        await prisma.liveSession.deleteMany({
          where: {
            id: {
              in: existingSessions.slice(1).map((record) => record.id)
            }
          }
        });
      }

      continue;
    }

    await prisma.liveSession.create({
      data: {
        courseId: course.id,
        title: session.title,
        startsAt,
        endsAt,
        deliveryMode: session.deliveryMode
      }
    });
  }

  const courseCount = await prisma.course.count();
  console.log(`✅ Seed completed successfully. Courses in DB: ${courseCount}`);

  // Fix course image URLs to match actual Bunny CDN filenames
  console.log("\n🖼️  Fixing course image URLs...");
  const imageMapping: Record<string, string> = {
    "staff-college-command": "/images/courses/nepal-army-staff-college.jpg",
    "police-inspector-cadet": "/images/courses/nepal-police-inspector-cadet.jpg",
    "apf-inspector-cadet": "/images/courses/apf-inspector-cadet.jpg",
    "officer-cadet-elite": "/images/courses/nepal-army-officer-cadet.jpg",
    "mission-english-ops": "/images/courses/mission-english-ops.jpg",
    "army-command-staff-2083": "/images/courses/army-command-staff.jpg"
  };

  for (const [slug, imageUrl] of Object.entries(imageMapping)) {
    const result = await prisma.course.updateMany({
      where: { slug },
      data: { heroImageUrl: imageUrl }
    });
    if (result.count > 0) {
      console.log(`  ✅ Updated ${slug} with ${imageUrl}`);
    } else {
      console.log(`  ℹ️ Skipped ${slug} (course not present in this dataset)`);
    }
  }

  console.log("\n🎖️  Seeding Army Command & Staff Course 2083...");
  try {
    await seedArmyCommandStaff2083(prisma);
  } catch (error) {
    console.error("❌ Error seeding Army course:", error);
    throw error;
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
