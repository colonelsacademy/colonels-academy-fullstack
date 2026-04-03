import { PrismaClient } from "@prisma/client";

import { courseCatalog, instructors, upcomingSessions } from "@colonels-academy/contracts";

const prisma = new PrismaClient();

async function main() {
  const instructorIdsBySlug = new Map<string, string>();

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
    const record = await prisma.course.upsert({
      where: { slug: course.slug },
      update: {
        title: course.title,
        track: course.track,
        summary: course.summary,
        description: course.description,
        level: course.level,
        durationLabel: course.durationLabel,
        lessonCount: course.lessonCount,
        priceNpr: course.priceNpr,
        accentColor: course.accentColor,
        isFeatured: course.featured,
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
        lessonCount: course.lessonCount,
        priceNpr: course.priceNpr,
        accentColor: course.accentColor,
        isFeatured: course.featured,
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

    await prisma.liveSession.create({
      data: {
        courseId: course.id,
        title: session.title,
        startsAt: new Date(session.startsAt),
        endsAt: new Date(session.endsAt),
        deliveryMode: session.deliveryMode
      }
    });
  }

  console.log("✅ Seed completed successfully.");
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
