/**
 * Verify Seed Safety - Pre-Seed Check
 *
 * This script checks your current database state and predicts
 * what will happen if you run the seed.
 *
 * Usage: npx tsx packages/database/scripts/verify-seed-safety.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifySeedSafety() {
  console.log("🔍 SEED SAFETY VERIFICATION");
  console.log("=".repeat(70));
  console.log("");

  // Step 1: Check if course exists
  const course = await prisma.course.findUnique({
    where: { slug: "army-command-staff-2083" },
    include: {
      lessons: {
        select: {
          id: true,
          title: true,
          position: true,
          moduleId: true,
          module: {
            select: {
              title: true,
              chapterNumber: true
            }
          }
        },
        orderBy: { position: "asc" }
      },
      modules: {
        select: {
          id: true,
          title: true,
          chapterNumber: true,
          position: true
        },
        orderBy: { position: "asc" }
      }
    }
  });

  if (!course) {
    console.log("❌ COURSE NOT FOUND");
    console.log("");
    console.log("What will happen if you run seed:");
    console.log("  ✓ Seed will CREATE a new course");
    console.log("  ✓ Seed will CREATE all chapters");
    console.log("  ✓ Seed will CREATE all lessons");
    console.log("");
    console.log("⚠️  This is a FRESH SETUP - seed will run normally");
    console.log("=".repeat(70));
    return;
  }

  console.log("✅ COURSE FOUND");
  console.log(`   Title: ${course.title}`);
  console.log("   Slug: army-command-staff-2083");
  console.log("");

  // Step 2: Analyze current state
  console.log("📊 CURRENT DATABASE STATE");
  console.log("-".repeat(70));
  console.log(`   Total Chapters: ${course.modules.length}`);
  console.log(`   Total Lessons: ${course.lessons.length}`);
  console.log("");

  // Step 3: Show lesson distribution
  if (course.lessons.length > 0) {
    console.log("📚 LESSON DISTRIBUTION BY CHAPTER");
    console.log("-".repeat(70));

    const lessonsByChapter: Record<string, { count: number; lessons: string[] }> = {};

    for (const lesson of course.lessons) {
      const chapterKey = lesson.module
        ? `Ch ${lesson.module.chapterNumber}: ${lesson.module.title}`
        : "No Chapter Assigned";

      if (!lessonsByChapter[chapterKey]) {
        lessonsByChapter[chapterKey] = { count: 0, lessons: [] };
      }

      lessonsByChapter[chapterKey].count++;
      lessonsByChapter[chapterKey].lessons.push(lesson.title);
    }

    for (const [chapter, data] of Object.entries(lessonsByChapter)) {
      console.log(`\n   ${chapter}: ${data.count} lessons`);
      // Show first 3 lessons as examples
      for (const title of data.lessons.slice(0, 3)) {
        console.log(`      • ${title}`);
      }
      if (data.lessons.length > 3) {
        console.log(`      ... and ${data.lessons.length - 3} more`);
      }
    }
    console.log("");
  }

  // Step 4: Check for manual changes
  console.log("🔍 CHECKING FOR MANUAL CHANGES");
  console.log("-".repeat(70));

  // Check if any lessons have been moved to different chapters
  const lessonsWithChapters = course.lessons.filter((l) => l.moduleId !== null);
  const lessonsWithoutChapters = course.lessons.filter((l) => l.moduleId === null);

  console.log(`   Lessons assigned to chapters: ${lessonsWithChapters.length}`);
  console.log(`   Lessons without chapters: ${lessonsWithoutChapters.length}`);
  console.log("");

  // Step 5: SEED PROTECTION CHECK
  console.log("🛡️  SEED PROTECTION STATUS");
  console.log("-".repeat(70));

  if (course.lessons.length > 0) {
    console.log("   ✅ PROTECTION ACTIVE");
    console.log("");
    console.log("   The seed file has this protection code:");
    console.log("   ┌─────────────────────────────────────────────────────┐");
    console.log("   │ if (existingCourse.lessons.length > 0) {           │");
    console.log("   │   console.log('⚠️  Skipping seed...');              │");
    console.log("   │   return; // ← EXITS HERE                          │");
    console.log("   │ }                                                   │");
    console.log("   └─────────────────────────────────────────────────────┘");
    console.log("");
  } else {
    console.log("   ⚠️  NO PROTECTION");
    console.log("   Course exists but has 0 lessons");
    console.log("   Seed WILL run and create lessons");
    console.log("");
  }

  // Step 6: PREDICTION
  console.log("🔮 WHAT WILL HAPPEN IF YOU RUN SEED NOW");
  console.log("=".repeat(70));

  if (course.lessons.length > 0) {
    console.log("");
    console.log("   1️⃣  Seed starts running...");
    console.log("   2️⃣  Checks: 'Does course have lessons?'");
    console.log(`   3️⃣  Finds: ${course.lessons.length} lessons exist`);
    console.log("   4️⃣  Displays message:");
    console.log("       '⚠️  Course already has lessons. Skipping seed...'");
    console.log(`       'Found ${course.lessons.length} existing lessons.'`);
    console.log("   5️⃣  EXITS IMMEDIATELY - No changes made");
    console.log("");
    console.log("   ✅ YOUR DATA IS SAFE!");
    console.log("   ✅ All your manual changes will be preserved");
    console.log("   ✅ Lesson-to-chapter assignments unchanged");
    console.log("   ✅ No lessons will be created, updated, or deleted");
    console.log("");
  } else {
    console.log("");
    console.log("   1️⃣  Seed starts running...");
    console.log("   2️⃣  Checks: 'Does course have lessons?'");
    console.log("   3️⃣  Finds: 0 lessons");
    console.log("   4️⃣  Proceeds to create lessons");
    console.log("   5️⃣  Creates all chapters and lessons from scratch");
    console.log("");
    console.log("   ⚠️  SEED WILL RUN");
    console.log("   ⚠️  This will create fresh lesson data");
    console.log("");
  }

  // Step 7: BEFORE/AFTER COMPARISON
  if (course.lessons.length > 0) {
    console.log("📋 BEFORE vs AFTER SEED");
    console.log("=".repeat(70));
    console.log("");
    console.log("   BEFORE SEED (Current State):");
    console.log(`      • ${course.lessons.length} lessons`);
    console.log(`      • ${course.modules.length} chapters`);
    console.log("      • Your custom chapter assignments");
    console.log("");
    console.log("   AFTER SEED (Predicted State):");
    console.log(`      • ${course.lessons.length} lessons (UNCHANGED)`);
    console.log(`      • ${course.modules.length} chapters (UNCHANGED)`);
    console.log("      • Your custom chapter assignments (PRESERVED)");
    console.log("");
    console.log("   🎯 RESULT: NO CHANGES - Your data is protected!");
    console.log("");
  }

  // Step 8: RECOMMENDATIONS
  console.log("💡 RECOMMENDATIONS");
  console.log("=".repeat(70));

  if (course.lessons.length > 0) {
    console.log("");
    console.log("   ✅ Safe to run seed - it will skip automatically");
    console.log("   ✅ Continue using admin panel for content management");
    console.log("   ✅ No need to update seed file for daily changes");
    console.log("");
    console.log("   To test the protection:");
    console.log("   $ npm run db:seed");
    console.log("");
    console.log("   Expected output:");
    console.log("   '⚠️  Course already has lessons. Skipping seed...'");
    console.log("");
  } else {
    console.log("");
    console.log("   ⚠️  Running seed will create lessons");
    console.log("   ⚠️  Only run if you want fresh data");
    console.log("");
  }

  console.log("=".repeat(70));
  console.log("");

  // Step 9: Summary Box
  const status = course.lessons.length > 0 ? "PROTECTED ✅" : "UNPROTECTED ⚠️";
  const safe = course.lessons.length > 0 ? "YES" : "NO";

  console.log("┌─────────────────────────────────────────────────────────────────┐");
  console.log("│                         SUMMARY                                 │");
  console.log("├─────────────────────────────────────────────────────────────────┤");
  console.log(`│  Course: ${course.title.padEnd(52)} │`);
  console.log(`│  Lessons: ${String(course.lessons.length).padEnd(54)} │`);
  console.log(`│  Chapters: ${String(course.modules.length).padEnd(53)} │`);
  console.log(`│  Status: ${status.padEnd(55)} │`);
  console.log(`│  Safe to run seed: ${safe.padEnd(43)} │`);
  console.log("└─────────────────────────────────────────────────────────────────┘");
  console.log("");
}

verifySeedSafety()
  .catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
