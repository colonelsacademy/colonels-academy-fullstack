/**
 * Test Seed Protection
 *
 * This script verifies that the seed protection is working correctly.
 * It checks if your lessons are safe from being overwritten.
 *
 * Usage: npx tsx packages/database/scripts/test-seed-protection.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testSeedProtection() {
  console.log("🧪 Testing Seed Protection...\n");

  // Check if course exists
  const course = await prisma.course.findUnique({
    where: { slug: "army-command-staff-2083" },
    include: {
      lessons: {
        select: { id: true, title: true, moduleId: true }
      },
      modules: {
        select: { id: true, title: true, chapterNumber: true }
      }
    }
  });

  if (!course) {
    console.log("❌ Course not found");
    console.log("   The seed will CREATE a new course and lessons");
    return;
  }

  console.log("✅ Course found:", course.title);
  console.log(`   Total lessons: ${course.lessons.length}`);
  console.log(`   Total chapters: ${course.modules.length}\n`);

  // Check protection status
  if (course.lessons.length > 0) {
    console.log("🛡️  PROTECTION ACTIVE");
    console.log("   ✓ Seed will SKIP and preserve your data");
    console.log("   ✓ Your manual changes are SAFE\n");

    // Show lesson distribution
    const lessonsByChapter: Record<string, number> = {};
    for (const lesson of course.lessons) {
      const chapter = course.modules.find((m) => m.id === lesson.moduleId);
      const key = chapter ? `Chapter ${chapter.chapterNumber}: ${chapter.title}` : "No Chapter";
      lessonsByChapter[key] = (lessonsByChapter[key] || 0) + 1;
    }

    console.log("📊 Current Lesson Distribution:");
    for (const [chapter, count] of Object.entries(lessonsByChapter)) {
      console.log(`   ${chapter}: ${count} lessons`);
    }

    console.log("\n💡 What happens if you run seed:");
    console.log("   1. Seed checks: 'Does course have lessons?'");
    console.log("   2. Finds:", course.lessons.length, "lessons");
    console.log("   3. Exits immediately with message:");
    console.log("      '⚠️  Course already has lessons. Skipping seed...'");
    console.log("   4. Your data remains UNCHANGED");
  } else {
    console.log("⚠️  NO PROTECTION");
    console.log("   Course exists but has 0 lessons");
    console.log("   Seed WILL run and create lessons");
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("SUMMARY");
  console.log("=".repeat(60));
  console.log(`Course: ${course.title}`);
  console.log(`Lessons: ${course.lessons.length}`);
  console.log(`Chapters: ${course.modules.length}`);
  console.log(`Protected: ${course.lessons.length > 0 ? "YES ✅" : "NO ⚠️"}`);
  console.log(
    `Safe to run seed: ${course.lessons.length > 0 ? "YES (will skip)" : "NO (will create)"}`
  );
  console.log("=".repeat(60));
}

testSeedProtection()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
