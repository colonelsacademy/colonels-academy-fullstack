/**
 * Army Command & Staff Course 2083 - Curriculum Seed
 *
 * This seed creates the complete course structure with:
 * - Free Introduction Module (Module 0)
 * - 5 Paid Chapters (Modules 1-5)
 * - Bundle Offers (Standard & Premium)
 * - Sequential lesson progression
 */

import { ContentType, LessonAccessKind, LessonLearningMode, SubjectArea } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

export async function seedArmyCommandStaff2083(prisma: PrismaClient) {
  console.log("🎖️  Seeding Army Command & Staff Course 2083...");

  // Step 1: Check for existing course - if it exists, just update it
  const existingCourse = await prisma.course.findUnique({
    where: { slug: "army-command-staff-2083" }
  });

  if (existingCourse) {
    console.log("ℹ️  Existing course found, updating...");
    // Just update the course without deleting to preserve purchase history
  } else {
    console.log("ℹ️  No existing course found, will create new one");
  }

  // Step 2: Upsert the course to preserve purchase history
  const course = await prisma.course.upsert({
    where: { slug: "army-command-staff-2083" },
    update: {
      title: "Army Command & Staff Course Entrance Exam Preparation - 2083",
      track: "army",
      summary:
        "6-month comprehensive preparation program for Nepal Army Command & Staff Course entrance exam",
      description: `Professional preparation platform for Nepalese Army officers preparing for the Command & Staff Course entrance examination. 
      
This comprehensive 6-month program covers all five subjects with structured study plans, mock exams, and expert guidance.

**Subjects Covered:**
- Military Operations & Administration (100 marks)
- Contemporary Affairs (100 marks)
- Military History & Strategic Thoughts (100 marks)
- Armed Conflicts - Appreciation & Plans (100 marks)
- Lecturette (100 marks)

**Total: 500 marks**`,
      level: "Advanced",
      durationLabel: "6 months",
      priceNpr: 20000,
      originalPriceNpr: 20000,
      accentColor: "#1a4d2e",
      heroImageUrl: "/images/courses/army-command-staff.jpg",
      isFeatured: true,
      isComingSoon: false,
      assessmentWeighting: {
        subjects: [
          { name: "Military Operations & Administration", weight: 100, percentage: 20 },
          { name: "Contemporary Affairs", weight: 100, percentage: 20 },
          { name: "Military History & Strategic Thoughts", weight: 100, percentage: 20 },
          { name: "Armed Conflicts - Appreciation & Plans", weight: 100, percentage: 20 },
          { name: "Lecturette", weight: 100, percentage: 20 }
        ],
        total: 500
      }
    },
    create: {
      slug: "army-command-staff-2083",
      title: "Army Command & Staff Course Entrance Exam Preparation - 2083",
      track: "army",
      summary:
        "6-month comprehensive preparation program for Nepal Army Command & Staff Course entrance exam",
      description: `Professional preparation platform for Nepalese Army officers preparing for the Command & Staff Course entrance examination. 
      
This comprehensive 6-month program covers all five subjects with structured study plans, mock exams, and expert guidance.

**Subjects Covered:**
- Military Operations & Administration (100 marks)
- Contemporary Affairs (100 marks)
- Military History & Strategic Thoughts (100 marks)
- Armed Conflicts - Appreciation & Plans (100 marks)
- Lecturette (100 marks)

**Total: 500 marks**`,
      level: "Advanced",
      durationLabel: "6 months",
      lessonCount: 0,
      priceNpr: 20000,
      originalPriceNpr: 20000,
      accentColor: "#1a4d2e",
      heroImageUrl: "/images/courses/army-command-staff.jpg",
      isFeatured: true,
      isComingSoon: false,
      assessmentWeighting: {
        subjects: [
          { name: "Military Operations & Administration", weight: 100, percentage: 20 },
          { name: "Contemporary Affairs", weight: 100, percentage: 20 },
          { name: "Military History & Strategic Thoughts", weight: 100, percentage: 20 },
          { name: "Armed Conflicts - Appreciation & Plans", weight: 100, percentage: 20 },
          { name: "Lecturette", weight: 100, percentage: 20 }
        ],
        total: 500
      }
    }
  });

  console.log(`✅ Course upserted: ${course.title} (ID: ${course.id})`);

  // Step 3: Create FREE Introduction Module (Module 0)
  const introModule = await prisma.module.upsert({
    where: {
      courseId_position: {
        courseId: course.id,
        position: 0
      }
    },
    update: {},
    create: {
      courseId: course.id,
      title: "Introduction: Vision, Mission & Course Overview",
      position: 0,
      phaseNumber: 0,
      chapterNumber: 0,
      chapterPrice: 0,
      isLocked: false,
      isFreeIntro: true,
      componentCode: "INTRO",
      componentLabel: "Free Introduction",
      completionCriteria: {
        requiredLessons: [],
        minCompletionPercentage: 0
      }
    }
  });

  console.log(`✅ Free Introduction Module created: ${introModule.id}`);

  // Create single introduction video lesson
  await prisma.lesson.upsert({
    where: {
      courseId_position: {
        courseId: course.id,
        position: 1
      }
    },
    update: {},
    create: {
      courseId: course.id,
      moduleId: introModule.id,
      title: "Introduction: Vision, Mission & Objectives",
      synopsis: "Introduction covering vision, mission, and objectives of the course",
      position: 1,
      contentType: ContentType.VIDEO,
      durationMinutes: 10,
      learningMode: LessonLearningMode.LESSON,
      accessKind: LessonAccessKind.PREVIEW, // Free preview
      isRequired: false,
      completionWeight: 0,
      bunnyVideoId: "6334bf98-12c7-492f-97bc-43dde00e0a3e" // Introduction video
    }
  });

  console.log("✅ Created 1 introduction video lesson");

  // Step 2b: Create FREE Overview Description Module
  const overviewModule = await prisma.module.upsert({
    where: {
      courseId_position: {
        courseId: course.id,
        position: 1
      }
    },
    update: {},
    create: {
      courseId: course.id,
      title: "Overview Description",
      position: 1,
      phaseNumber: 0,
      chapterNumber: 0,
      chapterPrice: 0,
      isLocked: false,
      isFreeIntro: true,
      componentCode: "OVERVIEW",
      componentLabel: "Free Overview",
      completionCriteria: {
        requiredLessons: [],
        minCompletionPercentage: 0
      }
    }
  });

  console.log("✅ Free Overview Module created");

  // Create overview lesson
  await prisma.lesson.upsert({
    where: {
      courseId_position: {
        courseId: course.id,
        position: 2
      }
    },
    update: {},
    create: {
      courseId: course.id,
      moduleId: overviewModule.id,
      title: "Course Overview & Structure",
      synopsis: "6-month preparation program covering all 5 subjects with structured learning path",
      position: 2,
      contentType: ContentType.VIDEO,
      durationMinutes: 15,
      learningMode: LessonLearningMode.LESSON,
      accessKind: LessonAccessKind.PREVIEW, // Free preview
      isRequired: false,
      completionWeight: 0,
      bunnyVideoId: "dc18e46f-4ca9-4d41-a289-9f59edbce15e" // Your overview video ID
    }
  });

  console.log("✅ Created 1 overview video lesson");

  // Step 3: Create Chapter 1 - Military Operations & Administration
  const chapter1 = await prisma.module.upsert({
    where: {
      courseId_position: {
        courseId: course.id,
        position: 2
      }
    },
    update: {},
    create: {
      courseId: course.id,
      title: "Chapter 1: Military Operations & Administration",
      position: 2,
      phaseNumber: 1,
      subjectArea: SubjectArea.TACTICS_ADMIN,
      chapterNumber: 1,
      chapterPrice: 5000,
      isLocked: true,
      isFreeIntro: false,
      componentCode: "MOA",
      componentLabel: "Military Operations & Administration",
      completionCriteria: {
        requiredLessons: 25,
        minCompletionPercentage: 100,
        minQuizScore: 70
      }
    }
  });

  console.log(`✅ Chapter 1 created: ${chapter1.title}`);

  // Create Chapter 1 lessons (25 lessons)
  const chapter1Lessons = [
    {
      title: "Operation of War",
      synopsis: "Fundamentals of military operations",
      durationMinutes: 45,
      referencePages: "002-Tac, Pg 2-32"
    },
    {
      title: "Patrolling Tactics",
      synopsis: "Reconnaissance and combat patrols",
      durationMinutes: 60,
      referencePages: "002-Tac, Pg 33-68"
    },
    {
      title: "Raid Operations",
      synopsis: "Planning and executing raids",
      durationMinutes: 50,
      referencePages: "002-Tac, Pg 69-100"
    },
    {
      title: "Ambush Tactics",
      synopsis: "Ambush planning and execution",
      durationMinutes: 50,
      referencePages: "002-Tac, Pg 101-130"
    },
    {
      title: "Infantry Operations",
      synopsis: "Infantry tactics and formations",
      durationMinutes: 45,
      referencePages: "002-Tac, Pg 131-160"
    },
    {
      title: "Armor Operations",
      synopsis: "Tank and armored vehicle tactics",
      durationMinutes: 40,
      referencePages: "002-Tac, Pg 161-185"
    },
    {
      title: "Artillery Support",
      synopsis: "Fire support coordination",
      durationMinutes: 40,
      referencePages: "002-Tac, Pg 186-210"
    },
    {
      title: "Air Defence Operations",
      synopsis: "Anti-aircraft defense systems",
      durationMinutes: 35,
      referencePages: "002-Tac, Pg 211-235"
    },
    {
      title: "Engineer Operations",
      synopsis: "Combat engineering and obstacles",
      durationMinutes: 35,
      referencePages: "002-Tac, Pg 236-260"
    },
    {
      title: "Signal Operations",
      synopsis: "Military communications",
      durationMinutes: 30,
      referencePages: "002-Tac, Pg 261-280"
    },
    {
      title: "Special Forces Operations",
      synopsis: "Special operations tactics",
      durationMinutes: 40,
      referencePages: "002-Tac, Pg 281-310"
    },
    {
      title: "Mountain Warfare",
      synopsis: "High-altitude combat operations",
      durationMinutes: 45,
      referencePages: "002-Tac, Pg 311-345"
    },
    {
      title: "Jungle Warfare",
      synopsis: "Tropical environment operations",
      durationMinutes: 40,
      referencePages: "002-Tac, Pg 346-375"
    },
    {
      title: "Counter Insurgency",
      synopsis: "COIN operations and tactics",
      durationMinutes: 50,
      referencePages: "002-Tac, Pg 376-415"
    },
    {
      title: "Urban Warfare",
      synopsis: "Fighting in built-up areas",
      durationMinutes: 45,
      referencePages: "002-Tac, Pg 416-450"
    },
    {
      title: "Peacekeeping Operations",
      synopsis: "UN peacekeeping missions",
      durationMinutes: 40,
      referencePages: "002-Tac, Pg 451-480"
    },
    {
      title: "Intelligence & Security",
      synopsis: "Military intelligence operations",
      durationMinutes: 35,
      referencePages: "002-Tac, Pg 481-505"
    },
    {
      title: "Administration in War",
      synopsis: "Wartime administrative procedures",
      durationMinutes: 30,
      referencePages: "001-SD, Pg 2-25"
    },
    {
      title: "Administration in Peace",
      synopsis: "Peacetime administrative duties",
      durationMinutes: 25,
      referencePages: "001-SD, Pg 26-45"
    },
    {
      title: "Training Methods",
      synopsis: "Military training principles",
      durationMinutes: 35,
      referencePages: "001-SD, Pg 46-70"
    },
    {
      title: "Leadership Principles",
      synopsis: "Military leadership fundamentals",
      durationMinutes: 40,
      referencePages: "001-SD, Pg 71-100"
    },
    {
      title: "Man Management",
      synopsis: "Personnel management skills",
      durationMinutes: 35,
      referencePages: "001-SD, Pg 101-125"
    },
    {
      title: "Nepal Army Organization",
      synopsis: "Structure and organization",
      durationMinutes: 25,
      referencePages: "001-SD, Pg 126-145"
    },
    {
      title: "Military Act & Laws",
      synopsis: "Military legal framework",
      durationMinutes: 30,
      referencePages: "001-SD, Pg 146-170"
    },
    {
      title: "Logistics System",
      synopsis: "Military supply chain management",
      durationMinutes: 40,
      referencePages: "001-SD, Pg 171-200"
    }
  ];

  let lessonPosition = 3; // Continue from intro (1) and overview (2) lessons
  for (const lessonData of chapter1Lessons) {
    await prisma.lesson.upsert({
      where: {
        courseId_position: {
          courseId: course.id,
          position: lessonPosition
        }
      },
      update: {},
      create: {
        ...lessonData,
        courseId: course.id,
        moduleId: chapter1.id,
        position: lessonPosition,
        contentType: ContentType.VIDEO,
        learningMode: LessonLearningMode.LESSON,
        accessKind: LessonAccessKind.STANDARD,
        isRequired: true,
        completionWeight: 1
      }
    });
    lessonPosition++;
  }

  console.log(`✅ Created ${chapter1Lessons.length} lessons for Chapter 1`);

  // Step 4: Create remaining chapters (2-5) with placeholder structure
  const chapters = [
    {
      position: 3,
      title: "Chapter 2: Contemporary Affairs",
      subjectArea: SubjectArea.CURRENT_AFFAIRS,
      chapterNumber: 2,
      chapterPrice: 3500,
      lessonCount: 15
    },
    {
      position: 4,
      title: "Chapter 3: Military History & Strategic Thoughts",
      subjectArea: SubjectArea.MILITARY_HISTORY_STRATEGY,
      chapterNumber: 3,
      chapterPrice: 4000,
      lessonCount: 20
    },
    {
      position: 5,
      title: "Chapter 4: Armed Conflicts - Appreciation & Plans",
      subjectArea: SubjectArea.APPRECIATION_PLANS,
      chapterNumber: 4,
      chapterPrice: 4500,
      lessonCount: 15
    },
    {
      position: 6,
      title: "Chapter 5: Lecturette",
      subjectArea: SubjectArea.LECTURETTE,
      chapterNumber: 5,
      chapterPrice: 3000,
      lessonCount: 10
    }
  ];

  for (const chapterData of chapters) {
    const chapter = await prisma.module.upsert({
      where: {
        courseId_position: {
          courseId: course.id,
          position: chapterData.position
        }
      },
      update: {},
      create: {
        courseId: course.id,
        title: chapterData.title,
        position: chapterData.position,
        phaseNumber: chapterData.position <= 2 ? 1 : chapterData.position <= 4 ? 2 : 3,
        subjectArea: chapterData.subjectArea,
        chapterNumber: chapterData.chapterNumber,
        chapterPrice: chapterData.chapterPrice,
        isLocked: true,
        isFreeIntro: false,
        componentCode: `CH${chapterData.chapterNumber}`,
        componentLabel: chapterData.title,
        completionCriteria: {
          requiredLessons: chapterData.lessonCount,
          minCompletionPercentage: 100,
          minQuizScore: 70
        }
      }
    });

    console.log(`✅ ${chapter.title} created`);

    // Create placeholder lessons for each chapter
    for (let i = 1; i <= chapterData.lessonCount; i++) {
      await prisma.lesson.upsert({
        where: {
          courseId_position: {
            courseId: course.id,
            position: lessonPosition
          }
        },
        update: {},
        create: {
          courseId: course.id,
          moduleId: chapter.id,
          title: `${chapterData.title} - Lesson ${i}`,
          synopsis: `Lesson ${i} content for ${chapterData.title}`,
          position: lessonPosition,
          durationMinutes: 30,
          contentType: ContentType.VIDEO,
          learningMode: LessonLearningMode.LESSON,
          accessKind: LessonAccessKind.STANDARD,
          isRequired: true,
          completionWeight: 1
        }
      });
      lessonPosition++;
    }

    console.log(`✅ Created ${chapterData.lessonCount} placeholder lessons for ${chapter.title}`);
  }

  // Step 5: Create Bundle Offers
  // Check if standard bundle exists
  const existingStandardBundle = await prisma.courseBundleOffer.findFirst({
    where: {
      courseId: course.id,
      bundleType: "STANDARD"
    }
  });

  const standardBundle = existingStandardBundle
    ? await prisma.courseBundleOffer.update({
        where: { id: existingStandardBundle.id },
        data: {
          title: "Standard Bundle - Complete Course Access",
          description: `Get all 5 chapters at a discounted price!

**Includes:**
- All 5 chapters (85+ lessons)
- 3 comprehensive mock exams
- Official completion certificate
- Structured 6-month study schedule
- Progress tracking and analytics

**Save NPR 2,000** compared to buying chapters individually!`,
          includedChapters: [1, 2, 3, 4, 5],
          originalPrice: 20000,
          bundlePrice: 18000,
          discount: 2000,
          includesMentorAccess: false,
          includesMockExams: true,
          includesCertificate: true,
          includesLiveClasses: false,
          mockExamCount: 3,
          isActive: true
        }
      })
    : await prisma.courseBundleOffer.create({
        data: {
          courseId: course.id,
          bundleType: "STANDARD",
          title: "Standard Bundle - Complete Course Access",
          description: `Get all 5 chapters at a discounted price!

**Includes:**
- All 5 chapters (85+ lessons)
- 3 comprehensive mock exams
- Official completion certificate
- Structured 6-month study schedule
- Progress tracking and analytics

**Save NPR 2,000** compared to buying chapters individually!`,
          includedChapters: [1, 2, 3, 4, 5],
          originalPrice: 20000,
          bundlePrice: 18000,
          discount: 2000,
          includesMentorAccess: false,
          includesMockExams: true,
          includesCertificate: true,
          includesLiveClasses: false,
          mockExamCount: 3,
          isActive: true
        }
      });

  const existingPremiumBundle = await prisma.courseBundleOffer.findFirst({
    where: {
      courseId: course.id,
      bundleType: "PREMIUM"
    }
  });

  const premiumBundle = existingPremiumBundle
    ? await prisma.courseBundleOffer.update({
        where: { id: existingPremiumBundle.id },
        data: {
          title: "Premium Bundle - Complete Course + Mentorship",
          description: `The ultimate preparation package with personal mentorship!

**Includes Everything in Standard Bundle PLUS:**
- Personal mentor access for guidance
- 5 comprehensive mock exams (2 extra)
- 10 live classes with expert instructors
- Priority support (24-hour response)
- Personalized study plan
- Detailed performance reports
- One-on-one feedback sessions

**Save NPR 7,000** and get premium features!`,
          includedChapters: [1, 2, 3, 4, 5],
          originalPrice: 32000,
          bundlePrice: 25000,
          discount: 7000,
          includesMentorAccess: true,
          includesMockExams: true,
          includesCertificate: true,
          includesLiveClasses: true,
          mockExamCount: 5,
          liveClassCount: 10,
          isActive: true
        }
      })
    : await prisma.courseBundleOffer.create({
        data: {
          courseId: course.id,
          bundleType: "PREMIUM",
          title: "Premium Bundle - Complete Course + Mentorship",
          description: `The ultimate preparation package with personal mentorship!

**Includes Everything in Standard Bundle PLUS:**
- Personal mentor access for guidance
- 5 comprehensive mock exams (2 extra)
- 10 live classes with expert instructors
- Priority support (24-hour response)
- Personalized study plan
- Detailed performance reports
- One-on-one feedback sessions

**Save NPR 7,000** and get premium features!`,
          includedChapters: [1, 2, 3, 4, 5],
          originalPrice: 32000,
          bundlePrice: 25000,
          discount: 7000,
          includesMentorAccess: true,
          includesMockExams: true,
          includesCertificate: true,
          includesLiveClasses: true,
          mockExamCount: 5,
          liveClassCount: 10,
          isActive: true
        }
      });

  console.log("✅ Bundle offers created:");
  console.log(`   - ${standardBundle.title}: NPR ${standardBundle.bundlePrice}`);
  console.log(`   - ${premiumBundle.title}: NPR ${premiumBundle.bundlePrice}`);

  // Update course lesson count
  const totalLessons = await prisma.lesson.count({
    where: { courseId: course.id }
  });

  await prisma.course.update({
    where: { id: course.id },
    data: { lessonCount: totalLessons }
  });

  console.log("\n🎉 Army Command & Staff Course 2083 seeded successfully!");
  console.log(`   - Total lessons: ${totalLessons}`);
  console.log("   - Free modules: 2 (Introduction + Overview) - 2 video lessons");
  console.log(`   - Paid chapters: 5 chapters (${totalLessons - 2} lessons)`);
  console.log("   - Bundle offers: 2 (Standard & Premium)");

  // Verify data was created
  const moduleCount = await prisma.module.count({ where: { courseId: course.id } });
  const lessonCount = await prisma.lesson.count({ where: { courseId: course.id } });
  console.log(`\n🔍 Verification: ${moduleCount} modules, ${lessonCount} lessons in database`);
}
