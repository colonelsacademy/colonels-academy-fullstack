import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding mock test bundles...");

  // Create Officer Cadet bundle
  const cadetBundle = await prisma.mockTestBundle.upsert({
    where: { position: "Officer Cadet" },
    update: {},
    create: {
      position: "Officer Cadet",
      title: "Officer Cadet Practice Tests",
      description: "Complete mock test bundle for Officer Cadet examination preparation",
      priceNpr: 2000,
      freePreviewCount: 5,
      isActive: true
    }
  });

  console.log("Created Officer Cadet bundle:", cadetBundle);

  // Create ASI bundle
  const asiBundle = await prisma.mockTestBundle.upsert({
    where: { position: "ASI" },
    update: {},
    create: {
      position: "ASI",
      title: "ASI Practice Tests",
      description: "Complete mock test bundle for ASI examination preparation",
      priceNpr: 1500,
      freePreviewCount: 5,
      isActive: true
    }
  });

  console.log("Created ASI bundle:", asiBundle);

  console.log("Mock test bundles seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
