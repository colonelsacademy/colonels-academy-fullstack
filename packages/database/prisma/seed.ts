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

  console.log("Seeding Manual Featured Courses...");

  // 1. Army Officer Cadet
  const armyInstructor = await prisma.instructor.findUnique({ where: { slug: "rajesh-thapa" } });
  if (armyInstructor) {
    const armyCourse = await prisma.course.upsert({
      where: { slug: "army-officer-cadet-prep" },
      update: {},
      create: {
        title: "Officer Cadet Comprehensive Preparation",
        slug: "army-officer-cadet-prep",
        track: "army",
        summary: "Expert-led preparation for the Nepal Army Officer Cadet selection.",
        description:
          "Master the IQ, GK, and physical requirements for the Nepal Army Officer Cadet selection board. Guided by retired officers with decades of experience.",
        level: "Advanced",
        durationLabel: "12 Weeks",
        lessonCount: 45,
        priceNpr: 4500,
        originalPriceNpr: 6000,
        accentColor: "#8F7A38",
        heroImageUrl: "/images/courses/officer-cadet-elite.jpg",
        isFeatured: true
      }
    });

    await prisma.courseInstructor.upsert({
      where: {
        courseId_instructorId: {
          courseId: armyCourse.id,
          instructorId: armyInstructor.id
        }
      },
      update: {},
      create: {
        courseId: armyCourse.id,
        instructorId: armyInstructor.id,
        displayOrder: 0
      }
    });
  }

  // 2. Police Inspector
  const policeInstructor = await prisma.instructor.findUnique({ where: { slug: "kp-sharma" } });
  if (policeInstructor) {
    const policeCourse = await prisma.course.upsert({
      where: { slug: "police-inspector-prep" },
      update: {},
      create: {
        title: "Nepal Police Inspector Preparation",
        slug: "police-inspector-prep",
        track: "police",
        summary: "Comprehensive legal and procedural coaching for Inspector candidates.",
        description:
          "Intensive study module covering criminal law, constitution, and general knowledge. Includes mock oral boards and case analysis drills.",
        level: "Intermediate",
        durationLabel: "8 Weeks",
        lessonCount: 32,
        priceNpr: 3500,
        originalPriceNpr: 5000,
        accentColor: "#224785",
        heroImageUrl: "/images/courses/police-inspector-cadet.jpg",
        isFeatured: true
      }
    });

    await prisma.courseInstructor.upsert({
      where: {
        courseId_instructorId: {
          courseId: policeCourse.id,
          instructorId: policeInstructor.id
        }
      },
      update: {},
      create: {
        courseId: policeCourse.id,
        instructorId: policeInstructor.id,
        displayOrder: 0
      }
    });
  }

  console.log("✅ Manual courses seeded successfully.");
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
