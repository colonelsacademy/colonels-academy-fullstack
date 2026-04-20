import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🖼️  Fixing course image URLs...");

  const imageMapping = {
    "staff-college-command": "/images/courses/nepal-army-staff-college.jpg",
    "police-inspector-cadet": "/images/courses/nepal-police-inspector-cadet.jpg",
    "apf-inspector-cadet": "/images/courses/apf-inspector-cadet.jpg",
    "officer-cadet-elite": "/images/courses/nepal-army-officer-cadet.jpg",
    "mission-english-ops": "/images/courses/mission-english-ops.jpg"
  };

  for (const [slug, imageUrl] of Object.entries(imageMapping)) {
    await prisma.course.update({
      where: { slug },
      data: { heroImageUrl: imageUrl }
    });
    console.log(`✅ Updated ${slug} with ${imageUrl}`);
  }

  console.log("🎉 All course images fixed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
