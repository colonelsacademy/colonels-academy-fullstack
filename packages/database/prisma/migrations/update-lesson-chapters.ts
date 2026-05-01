/**
 * Migration Script: Update Lesson Chapter Assignments
 *
 * Use this script when you need to bulk-update lesson chapter assignments
 * without losing other lesson data.
 *
 * Usage:
 * 1. Modify the lessonUpdates array below
 * 2. Run: npx tsx packages/database/prisma/migrations/update-lesson-chapters.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateLessonChapters() {
  console.log("🔄 Updating lesson chapter assignments...");

  // Define your lesson updates here
  const lessonUpdates = [
    // Example: Move "Operation of War" to Chapter 2
    // {
    //   lessonTitle: "Operation of War",
    //   newChapterNumber: 2
    // },
    // Add more updates as needed
  ];

  const course = await prisma.course.findUnique({
    where: { slug: "army-command-staff-2083" },
    include: {
      modules: true,
      lessons: true
    }
  });

  if (!course) {
    console.error("❌ Course not found");
    return;
  }

  for (const update of lessonUpdates) {
    const lesson = course.lessons.find((l) => l.title === update.lessonTitle);
    const targetChapter = course.modules.find((m) => m.chapterNumber === update.newChapterNumber);

    if (!lesson) {
      console.warn(`⚠️  Lesson not found: ${update.lessonTitle}`);
      continue;
    }

    if (!targetChapter) {
      console.warn(`⚠️  Chapter ${update.newChapterNumber} not found`);
      continue;
    }

    await prisma.lesson.update({
      where: { id: lesson.id },
      data: { moduleId: targetChapter.id }
    });

    console.log(`✅ Moved "${update.lessonTitle}" to ${targetChapter.title}`);
  }

  console.log("✨ Migration complete!");
}

updateLessonChapters()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
