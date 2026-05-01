/**
 * Export Current Lesson Structure
 *
 * This script exports your current lesson-to-chapter assignments
 * so you can preserve manual changes in the seed file.
 *
 * Usage: npx tsx packages/database/scripts/export-lesson-structure.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function exportLessonStructure() {
  console.log("📤 Exporting lesson structure...");

  const course = await prisma.course.findUnique({
    where: { slug: "army-command-staff-2083" },
    include: {
      modules: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          chapterNumber: true,
          position: true
        }
      },
      lessons: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          synopsis: true,
          position: true,
          durationMinutes: true,
          moduleId: true,
          contentType: true,
          learningMode: true,
          accessKind: true,
          referencePages: true,
          module: {
            select: {
              title: true,
              chapterNumber: true
            }
          }
        }
      }
    }
  });

  if (!course) {
    console.error("❌ Course not found");
    return;
  }

  // Group lessons by chapter
  const lessonsByChapter: Record<
    string,
    Array<{ id: string; title: string; position: number }>
  > = {};

  for (const lesson of course.lessons) {
    const chapterKey = lesson.module?.chapterNumber
      ? `Chapter ${lesson.module.chapterNumber}`
      : "No Chapter";

    if (!lessonsByChapter[chapterKey]) {
      lessonsByChapter[chapterKey] = [];
    }

    lessonsByChapter[chapterKey].push({
      position: lesson.position,
      title: lesson.title,
      synopsis: lesson.synopsis,
      durationMinutes: lesson.durationMinutes,
      referencePages: lesson.referencePages,
      contentType: lesson.contentType,
      learningMode: lesson.learningMode,
      accessKind: lesson.accessKind,
      moduleId: lesson.moduleId
    });
  }

  // Generate TypeScript code
  let output = `/**
 * Current Lesson Structure Export
 * Generated: ${new Date().toISOString()}
 * 
 * This file contains your current lesson-to-chapter assignments.
 * Use this to update the seed file if needed.
 */

export const currentLessonStructure = {\n`;

  for (const [chapter, lessons] of Object.entries(lessonsByChapter)) {
    output += `  "${chapter}": [\n`;
    for (const lesson of lessons) {
      output += "    {\n";
      output += `      position: ${lesson.position},\n`;
      output += `      title: "${lesson.title}",\n`;
      output += `      synopsis: "${lesson.synopsis}",\n`;
      output += `      durationMinutes: ${lesson.durationMinutes},\n`;
      if (lesson.referencePages) {
        output += `      referencePages: "${lesson.referencePages}",\n`;
      }
      output += "    },\n";
    }
    output += "  ],\n";
  }

  output += "};\n\n";

  // Add summary
  output += "// Summary:\n";
  output += `// Total Lessons: ${course.lessons.length}\n`;
  for (const [chapter, lessons] of Object.entries(lessonsByChapter)) {
    output += `// ${chapter}: ${lessons.length} lessons\n`;
  }

  // Write to file
  const outputPath = path.join(__dirname, "../exports/lesson-structure.ts");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);

  console.log(`✅ Exported to: ${outputPath}`);
  console.log("\n📊 Summary:");
  console.log(`   Total Lessons: ${course.lessons.length}`);
  for (const [chapter, lessons] of Object.entries(lessonsByChapter)) {
    console.log(`   ${chapter}: ${lessons.length} lessons`);
  }
}

exportLessonStructure()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
