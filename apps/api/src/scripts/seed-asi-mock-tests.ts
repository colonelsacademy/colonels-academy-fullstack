import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding ASI Mock Tests...");

  try {
    // Create ASI Subjects (Idempotent - safe to run multiple times)
    console.log("📚 Creating ASI subjects...");

    const gkSubject = await prisma.subject.upsert({
      where: { name_position: { name: "GK", position: "ASI" } },
      update: {
        // Don't update description - preserve admin edits
      },
      create: {
        name: "GK",
        position: "ASI",
        description: "General Knowledge"
      }
    });
    console.log(`✓ GK subject: ${gkSubject.id}`);

    const reasoningSubject = await prisma.subject.upsert({
      where: { name_position: { name: "Reasoning", position: "ASI" } },
      update: {
        // Don't update description - preserve admin edits
      },
      create: {
        name: "Reasoning",
        position: "ASI",
        description: "Logical Reasoning"
      }
    });
    console.log(`✓ Reasoning subject: ${reasoningSubject.id}`);

    // Create ASI Mock Tests (Idempotent - safe to run multiple times)
    console.log("📝 Creating ASI mock tests...");

    const gkTest = await prisma.mockTest.upsert({
      where: { id: "test_asi_gk_001" },
      update: {
        // Only update structural fields, preserve admin-managed fields
        title: "ASI GK Test",
        description: "General Knowledge test for ASI - 25 questions, 50 marks, 25 minutes",
        timeLimitMinutes: 25,
        totalQuestions: 25,
        passingScore: 60
        // Do NOT update: status, priceNpr, freePreviewCount, accessType (admin-managed)
      },
      create: {
        id: "test_asi_gk_001",
        title: "ASI GK Test",
        description: "General Knowledge test for ASI - 25 questions, 50 marks, 25 minutes",
        position: "ASI",
        subjectId: gkSubject.id,
        timeLimitMinutes: 25,
        totalQuestions: 25,
        passingScore: 60,
        accessType: "FREE",
        priceNpr: null,
        freePreviewCount: 0,
        status: "DRAFT",
        createdBy: "system"
      }
    });
    console.log(`✓ GK test: ${gkTest.id}`);

    const reasoningTest = await prisma.mockTest.upsert({
      where: { id: "test_asi_reasoning_001" },
      update: {
        // Only update structural fields, preserve admin-managed fields
        title: "ASI Reasoning Test",
        description: "Logical Reasoning test for ASI - 25 questions, 50 marks, 25 minutes",
        timeLimitMinutes: 25,
        totalQuestions: 25,
        passingScore: 60
        // Do NOT update: status, priceNpr, freePreviewCount, accessType (admin-managed)
      },
      create: {
        id: "test_asi_reasoning_001",
        title: "ASI Reasoning Test",
        description: "Logical Reasoning test for ASI - 25 questions, 50 marks, 25 minutes",
        position: "ASI",
        subjectId: reasoningSubject.id,
        timeLimitMinutes: 25,
        totalQuestions: 25,
        passingScore: 60,
        accessType: "FREE",
        priceNpr: null,
        freePreviewCount: 0,
        status: "DRAFT",
        createdBy: "system"
      }
    });
    console.log(`✓ Reasoning test: ${reasoningTest.id}`);

    console.log("\n✅ ASI Mock Tests seeded successfully!");
    console.log("\n💡 This seed is idempotent - safe to run multiple times during deployments");
    console.log("   Admin-managed fields (status, pricing) are preserved");
  } catch (error) {
    console.error("❌ Error seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
